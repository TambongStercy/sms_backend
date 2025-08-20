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

export interface RemoteRecord {
  id: string;
  data: any;
  updated_at: Date;
  server_id: string;
  checksum: string;
}