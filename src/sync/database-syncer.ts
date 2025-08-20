import prisma from '../config/db';
import { SyncResult, SyncConflict, ConflictResolution, RemoteRecord } from './types';
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

  async syncTable(tableName: string, lastSync: Date): Promise<SyncResult> {
    const result: SyncResult = {
      recordsProcessed: 0,
      conflicts: [],
      errors: []
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
    const model = (prisma as any)[tableName.toLowerCase()];
    if (!model) throw new Error(`Model ${tableName} not found`);

    return await model.findMany({
      where: {
        updated_at: {
          gt: lastSync
        }
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
    const model = (prisma as any)[tableName.toLowerCase()];

    for (const remoteRecord of remoteChanges) {
      try {
        // Check if record exists locally
        const localRecord = await model.findUnique({
          where: { id: remoteRecord.id }
        });

        if (!localRecord) {
          // New record - insert
          await this.insertRecord(model, remoteRecord.data);
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
            await this.updateRecord(model, remoteRecord.id, remoteRecord.data);
            result.recordsProcessed++;
          }
        }

      } catch (error: any) {
        result.errors.push(`Pull ${tableName}[${remoteRecord.id}]: ${error.message}`);
      }
    }
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
      // Find conflicting fields
      const conflictingFields = this.findConflictingFields(localRecord, remoteRecord.data);

      if (conflictingFields.length > 0) {
        return {
          table: tableName,
          recordId: localRecord.id.toString(),
          field: conflictingFields[0], // Handle first conflict
          localValue: localRecord[conflictingFields[0]],
          remoteValue: remoteRecord.data[conflictingFields[0]],
          resolution: ConflictResolution.TIMESTAMP_WINS,
          resolvedValue: null
        };
      }
    }

    return null;
  }

  private findConflictingFields(localRecord: any, remoteRecord: any): string[] {
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
    const { server_id, checksum, ...recordData } = data;
    await model.create({ data: recordData });
  }

  private async updateRecord(model: any, id: string, data: any) {
    const { server_id, checksum, ...recordData } = data;
    await model.update({
      where: { id: parseInt(id) },
      data: recordData
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

  async processIncomingRecord(tableName: string, record: any) {
    const model = (prisma as any)[tableName.toLowerCase()];
    if (!model) throw new Error(`Model ${tableName} not found`);

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
      console.error(`Error processing ${tableName}[${record.id}]:`, error.message);
      throw error;
    }
  }
}