import prisma, { Prisma } from '../config/db';
import { SyncResult, SyncConflict, ConflictResolution, RemoteRecord, DeferredRecord } from './types';
import { ConflictResolver } from './conflict-resolver';
import { ApiClient } from './api-client';
import * as crypto from 'crypto';

export class DatabaseSyncer {
  private conflictResolver: ConflictResolver;
  private apiClient: ApiClient;

  constructor() {
    this.conflictResolver = new ConflictResolver();
    this.apiClient = new ApiClient();
  }

  // Exposed so SyncManager can refuse a sync run outright when no peer is set,
  // instead of failing once per record deep inside pushLocalChanges.
  isRemoteConfigured(): boolean {
    return this.apiClient.isConfigured();
  }

  // Field names per model, straight from the generated schema. Used to map
  // incoming keys onto what Prisma actually accepts.
  private static fieldCache = new Map<string, Set<string>>();

  private fieldsOf(tableName: string): Set<string> {
    const cached = DatabaseSyncer.fieldCache.get(tableName);
    if (cached) return cached;

    const model = (Prisma as any).dmmf?.datamodel?.models?.find(
      (m: any) => m.name === tableName
    );
    const names = new Set<string>((model?.fields ?? []).map((f: any) => f.name));
    DatabaseSyncer.fieldCache.set(tableName, names);
    return names;
  }

  // Records arriving from a peer may be camelCase: app.ts applied
  // convertSnakeToCamelCase globally, above the sync routes, so
  // GET /sync/changes/:table served "serverId"/"updatedAt" and every Prisma
  // write on this side rejected them. app.ts now mounts sync ahead of that
  // middleware, but a peer running an older build still camelCases, so
  // normalise defensively on receipt.
  //
  // Converting every camelCase key to snake_case is wrong, though: this schema
  // is snake_case except for SubClassSubject.userId, which a blind conversion
  // turned into user_id and Prisma rejected — all 397 rows of that table. So
  // check the real field list: keep a key that already matches, convert only
  // when the snake_case form is the one the model declares, and otherwise leave
  // it alone so genuine schema drift still surfaces as an error.
  //
  // Keys are handled one level only — these are flat Prisma rows, and recursing
  // would turn Date values into {}.
  private toSnakeKeys(record: any, tableName?: string): any {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return record;

    const fields = tableName ? this.fieldsOf(tableName) : null;
    const out: any = {};

    for (const key of Object.keys(record)) {
      const snake = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
      let target = key;
      if (fields && fields.size > 0) {
        if (fields.has(key)) target = key;
        else if (fields.has(snake)) target = snake;
      } else {
        target = snake;
      }
      out[target] = record[key];
    }
    return out;
  }

  // Prisma exposes delegates in camelCase ("SubClass" -> prisma.subClass), so
  // lowercasing the whole name only resolves for single-word models. Every
  // multi-word table (AcademicYear, PaymentTransaction, ...) returned undefined
  // and threw "Model not found", which syncTable swallowed into result.errors —
  // sync reported COMPLETED while silently skipping half its tables.
  private modelFor(tableName: string) {
    const key = tableName.charAt(0).toLowerCase() + tableName.slice(1);
    const model = (prisma as any)[key];
    if (!model) throw new Error(`Model ${tableName} not found (prisma.${key} is undefined)`);
    return model;
  }

  async syncTable(tableName: string, lastSync: Date): Promise<SyncResult> {
    const result: SyncResult = {
      recordsProcessed: 0,
      conflicts: [],
      errors: [],
      deferred: []
    };

    try {
      // Get local changes since last sync
      const localChanges = await this.getLocalChanges(tableName, lastSync);

      // Get remote changes since last sync
      const remoteChanges = await this.getRemoteChanges(tableName, lastSync);

      // Push local changes to remote
      await this.pushLocalChanges(tableName, localChanges, result);

      // Pull remote changes to local
      await this.pullRemoteChanges(tableName, remoteChanges, result);

      console.log(`Synced ${tableName}: ${result.recordsProcessed} records`);

    } catch (error: any) {
      result.errors.push(`Table ${tableName}: ${error.message}`);
    }

    return result;
  }

  async getLocalChanges(tableName: string, lastSync: Date) {
    const model = this.modelFor(tableName);

    // Only push records that originated locally (or predate the sync system).
    // Records with a foreign server_id were just pulled from remote — pushing
    // them back creates an echo loop and manufactures phantom conflicts.
    const localServerId = process.env.SERVER_ID || 'local';

    return await model.findMany({
      where: {
        updated_at: { gt: lastSync },
        OR: [
          { server_id: null },
          { server_id: localServerId }
        ]
      }
    });
  }

  private async getRemoteChanges(tableName: string, lastSync: Date): Promise<RemoteRecord[]> {
    return await this.apiClient.getChanges(tableName, lastSync);
  }

  private async pushLocalChanges(tableName: string, localChanges: any[], result: SyncResult) {
    for (const record of localChanges) {
      try {
        // Add server metadata
        const syncRecord = {
          ...record,
          server_id: process.env.SERVER_ID || 'local',
          checksum: this.generateChecksum(record)
        };

        await this.apiClient.pushRecord(tableName, syncRecord);
        result.recordsProcessed++;

      } catch (error: any) {
        result.errors.push(`Push ${tableName}[${record.id}]: ${error.message}`);
      }
    }
  }

  private async pullRemoteChanges(tableName: string, remoteChanges: RemoteRecord[], result: SyncResult) {
    const model = this.modelFor(tableName);

    for (const rawRemote of remoteChanges) {
      const remoteRecord = this.toSnakeKeys(rawRemote, tableName) as RemoteRecord;
      try {
        // Check if record exists locally
        const localRecord = await model.findUnique({
          where: { id: remoteRecord.id }
        });

        if (!localRecord) {
          // New record - insert. The remote record is a flat Prisma row.
          await this.insertRecord(model, remoteRecord);
          result.recordsProcessed++;

        } else {
          // Existing record - check for conflicts
          const conflict = await this.detectConflict(tableName, localRecord, remoteRecord);

          if (conflict) {
            const resolution = await this.conflictResolver.resolve(conflict);
            result.conflicts.push(resolution);

            if (resolution.resolution !== ConflictResolution.MANUAL) {
              await this.applyResolution(model, resolution);
              result.recordsProcessed++;
            }
          } else {
            // No conflict - update
            await this.updateRecord(model, String(remoteRecord.id), remoteRecord);
            result.recordsProcessed++;
          }
        }

      } catch (error: any) {
        // A missing referenced row is usually a timing problem, not a real
        // failure: the target may belong to a table later in the run, or to
        // another row of this same table (Class -> Class via next_class_id).
        // Hold it back for the retry pass instead of burning it as an error.
        if (this.isMissingReferenceError(error)) {
          result.deferred.push({
            table: tableName,
            record: remoteRecord,
            lastError: this.shortError(error)
          });
        } else {
          result.errors.push(`Pull ${tableName}[${remoteRecord.id}]: ${this.shortError(error)}`);
        }
      }
    }
  }

  // P2003 is Prisma's foreign-key constraint failure. P2025 ("required record
  // not found") shows up for the same underlying cause on some update paths.
  private isMissingReferenceError(error: any): boolean {
    if (error?.code === 'P2003' || error?.code === 'P2025') return true;
    return typeof error?.message === 'string'
      && error.message.includes('Foreign key constraint');
  }

  // Prisma renders a multi-line source excerpt into error.message; keep the
  // meaningful tail so a run with thousands of failures stays readable.
  private shortError(error: any): string {
    const msg = String(error?.message ?? error);
    const constraint = msg.match(/Foreign key constraint violated:? `?([^`\n]+)`?/);
    if (constraint) return `FK violation: ${constraint[1].trim()}`;
    return msg.split('\n').map(l => l.trim()).filter(Boolean).pop() || msg;
  }

  // Retry a batch of held-back records. Returns the ones that still failed, so
  // the caller can loop until a pass stops making progress.
  async retryDeferred(deferred: DeferredRecord[]): Promise<{ applied: number; remaining: DeferredRecord[] }> {
    let applied = 0;
    const remaining: DeferredRecord[] = [];

    for (const item of deferred) {
      try {
        await this.processIncomingRecord(item.table, item.record);
        applied++;
      } catch (error: any) {
        remaining.push({ ...item, lastError: this.shortError(error) });
      }
    }

    return { applied, remaining };
  }

  private async detectConflict(tableName: string, localRecord: any, remoteRecord: RemoteRecord): Promise<SyncConflict | null> {
    // Skip if same server
    if (localRecord.server_id === remoteRecord.server_id) {
      return null;
    }

    // Check if both records were modified after last sync
    const localChecksum = this.generateChecksum(localRecord);
    const remoteChecksum = remoteRecord.checksum;

    if (localChecksum !== remoteChecksum) {
      // RemoteRecord is a flat Prisma row (see types.ts) — passing
      // remoteRecord.data here iterated `undefined`, so this always found zero
      // conflicting fields and every remote row silently overwrote the local one.
      const conflictingFields = this.findConflictingFields(localRecord, remoteRecord);

      if (conflictingFields.length > 0) {
        return {
          table: tableName,
          recordId: localRecord.id.toString(),
          field: conflictingFields[0], // Handle first conflict
          localValue: localRecord[conflictingFields[0]],
          remoteValue: remoteRecord[conflictingFields[0]],
          localUpdatedAt: localRecord.updated_at,
          remoteUpdatedAt: remoteRecord.updated_at,
          resolution: ConflictResolution.TIMESTAMP_WINS,
          resolvedValue: null
        };
      }
    }

    return null;
  }

  private findConflictingFields(localRecord: any, remoteRecord: RemoteRecord): string[] {
    const conflicts: string[] = [];
    const excludeFields = ['id', 'created_at', 'updated_at', 'server_id', 'checksum'];

    for (const field in remoteRecord) {
      if (excludeFields.includes(field)) continue;

      if (JSON.stringify(localRecord[field]) !== JSON.stringify(remoteRecord[field])) {
        conflicts.push(field);
      }
    }

    return conflicts;
  }

  private async insertRecord(model: any, data: any) {
    // Preserve server_id and checksum from the remote payload so
    // getLocalChanges can later filter out records that originated remotely
    // (echo-loop prevention). The Prisma middleware in db.ts sees server_id
    // is already present and won't overwrite it.
    await model.create({ data });
  }

  private async updateRecord(model: any, id: string, data: any) {
    await model.update({
      where: { id: parseInt(id) },
      data
    });
  }

  private async applyResolution(model: any, resolution: SyncConflict) {
    await model.update({
      where: { id: parseInt(resolution.recordId) },
      data: {
        [resolution.field]: resolution.resolvedValue
      }
    });
  }

  private generateChecksum(record: any): string {
    const { id, created_at, updated_at, server_id, checksum, ...data } = record;
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  // Additional methods needed by SyncManager

  async processIncomingRecord(tableName: string, rawRecord: any) {
    const model = this.modelFor(tableName);
    const record = this.toSnakeKeys(rawRecord, tableName);

    try {
      // Check if record exists
      const existing = await model.findUnique({
        where: { id: record.id }
      });

      if (existing) {
        // Update existing record
        await this.updateRecord(model, record.id, record);
      } else {
        // Insert new record
        await this.insertRecord(model, record);
      }
    } catch (error: any) {
      // Logged short, not raw: Prisma embeds a multi-line source excerpt in
      // error.message, and the retry pass calls this once per held-back record —
      // 2481 of those buried the actual summary. The caller groups and reports
      // these, so one line each is enough to trace.
      console.error(`Error processing ${tableName}[${record.id}]: ${this.shortError(error)}`);
      throw error;
    }
  }
}