import { SyncConflict, ConflictResolution } from './types';

export class ConflictResolver {
  
  async resolve(conflict: SyncConflict): Promise<SyncConflict> {
    switch (conflict.resolution) {
      case ConflictResolution.LOCAL_WINS:
        conflict.resolvedValue = conflict.localValue;
        break;
        
      case ConflictResolution.REMOTE_WINS:
        conflict.resolvedValue = conflict.remoteValue;
        break;
        
      case ConflictResolution.TIMESTAMP_WINS:
        conflict.resolvedValue = await this.resolveByTimestamp(conflict);
        break;
        
      case ConflictResolution.MERGE:
        conflict.resolvedValue = await this.mergeValues(conflict);
        break;
        
      case ConflictResolution.MANUAL:
        // Store for manual resolution
        await this.storeForManualResolution(conflict);
        break;
        
      default:
        conflict.resolvedValue = conflict.remoteValue; // Default to remote
    }

    return conflict;
  }

  private async resolveByTimestamp(conflict: SyncConflict): Promise<any> {
    // For school management, implement business logic
    switch (conflict.table) {
      case 'Mark':
        // Latest mark wins (teacher might correct a grade)
        return this.getLatestValue(conflict);
        
      case 'StudentAbsence':
        // Local wins (real-time attendance in school)
        return conflict.localValue;
        
      case 'PaymentTransaction':
        // Remote wins (online payments processed on VPS)
        return conflict.remoteValue;
        
      case 'User':
        // Handle specific fields
        return this.resolveUserConflict(conflict);
        
      default:
        return this.getLatestValue(conflict);
    }
  }

  private async resolveUserConflict(conflict: SyncConflict): Promise<any> {
    // User-specific conflict resolution
    switch (conflict.field) {
      case 'password':
        // Latest password change wins
        return this.getLatestValue(conflict);
        
      case 'status':
        // More restrictive status wins
        return this.getMostRestrictiveStatus(conflict.localValue, conflict.remoteValue);
        
      case 'phone':
      case 'address':
        // Latest contact info wins
        return this.getLatestValue(conflict);
        
      default:
        return conflict.remoteValue;
    }
  }

  private getLatestValue(conflict: SyncConflict): any {
    // This would need timestamp comparison logic
    // For now, return remote value as default
    return conflict.remoteValue;
  }

  private getMostRestrictiveStatus(localStatus: string, remoteStatus: string): string {
    const statusPriority: { [key: string]: number } = {
      'SUSPENDED': 3,
      'INACTIVE': 2,
      'ACTIVE': 1
    };

    const localPriority = statusPriority[localStatus] || 0;
    const remotePriority = statusPriority[remoteStatus] || 0;

    return localPriority > remotePriority ? localStatus : remoteStatus;
  }

  private async mergeValues(conflict: SyncConflict): Promise<any> {
    // Implement merge logic for specific fields
    if (typeof conflict.localValue === 'object' && typeof conflict.remoteValue === 'object') {
      return { ...conflict.localValue, ...conflict.remoteValue };
    }
    
    // For non-objects, default to remote
    return conflict.remoteValue;
  }

  private async storeForManualResolution(conflict: SyncConflict) {
    // Store conflict in database for manual resolution
    console.log(`Manual resolution required for ${conflict.table}[${conflict.recordId}].${conflict.field}`);
    // Implementation would store in a conflicts table
  }
}