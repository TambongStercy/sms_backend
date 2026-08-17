export interface SyncLog {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: SyncStatus;
  direction: SyncDirection;
  recordsProcessed: number;
  conflicts: SyncConflict[];
  errors: string[];
}

export interface SyncConflict {
  table: string;
  recordId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  localUpdatedAt?: Date;
  remoteUpdatedAt?: Date;
  resolution: ConflictResolution;
  resolvedValue: any;
}

export interface SyncResult {
  recordsProcessed: number;
  conflicts: SyncConflict[];
  errors: string[];
}

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL'
}

export enum SyncDirection {
  PUSH = 'PUSH',
  PULL = 'PULL',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum ConflictResolution {
  LOCAL_WINS = 'LOCAL_WINS',
  REMOTE_WINS = 'REMOTE_WINS',
  MERGE = 'MERGE',
  MANUAL = 'MANUAL',
  TIMESTAMP_WINS = 'TIMESTAMP_WINS'
}

export interface SyncConfig {
  remoteUrl: string;
  apiKey: string;
  syncInterval: number; // minutes
  conflictResolution: ConflictResolution;
  priorityTables: string[];
  excludeTables: string[];
}

// Records come from GET /sync/changes/:table as raw Prisma rows — the columns
// live at the top level, not wrapped in a `data` field. sync_metadata columns
// (server_id, checksum) are optional because they were added in a later
// migration and older rows may still be null.
export interface RemoteRecord {
  id: number | string;
  updated_at: Date;
  server_id?: string | null;
  checksum?: string | null;
  [key: string]: any;
}