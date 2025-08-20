import prisma from '../config/db';
import { SyncLog, SyncStatus, SyncDirection } from './types';
import { DatabaseSyncer } from './database-syncer';
import { NetworkChecker } from './network-checker';

export class SyncManager {
    private dbSyncer: DatabaseSyncer;
    private networkChecker: NetworkChecker;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.dbSyncer = new DatabaseSyncer();
        this.networkChecker = new NetworkChecker();
    }

    async startAutoSync(intervalMinutes: number = 5) {
        console.log(`Starting auto-sync every ${intervalMinutes} minutes`);

        this.syncInterval = setInterval(async () => {
            if (await this.networkChecker.isOnline()) {
                await this.performSync();
            } else {
                console.log('Network offline - skipping sync');
            }
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async performSync(): Promise<SyncLog> {
        const syncLog: SyncLog = {
            id: Date.now().toString(),
            startTime: new Date(),
            status: SyncStatus.IN_PROGRESS,
            direction: SyncDirection.BIDIRECTIONAL,
            recordsProcessed: 0,
            conflicts: [],
            errors: []
        };

        try {
            console.log('Starting database sync...');

            // 1. Get last sync timestamp
            const lastSync = await this.getLastSyncTimestamp();

            // 2. Sync critical data first (users, academic years, classes)
            await this.syncCriticalData(lastSync, syncLog);

            // 3. Sync operational data (enrollments, marks, attendance)
            await this.syncOperationalData(lastSync, syncLog);

            // 4. Sync transactional data (payments, reports)
            await this.syncTransactionalData(lastSync, syncLog);

            // 5. Update sync timestamp
            await this.updateSyncTimestamp();

            syncLog.status = SyncStatus.COMPLETED;
            syncLog.endTime = new Date();

            console.log(`Sync completed: ${syncLog.recordsProcessed} records processed`);

        } catch (error: any) {
            syncLog.status = SyncStatus.FAILED;
            syncLog.errors.push(error.message);
            console.error('Sync failed:', error);
        }

        await this.saveSyncLog(syncLog);
        return syncLog;
    }

    private async syncCriticalData(lastSync: Date, syncLog: SyncLog) {
        const tables = ['User', 'AcademicYear', 'Class', 'SubClass', 'Subject'];

        for (const table of tables) {
            try {
                const result = await this.dbSyncer.syncTable(table, lastSync);
                syncLog.recordsProcessed += result.recordsProcessed;
                syncLog.conflicts.push(...result.conflicts);
            } catch (error: any) {
                syncLog.errors.push(`${table}: ${error.message}`);
            }
        }
    }

    private async syncOperationalData(lastSync: Date, syncLog: SyncLog) {
        const tables = ['Enrollment', 'Mark', 'StudentAbsence', 'TeacherAbsence'];

        for (const table of tables) {
            try {
                const result = await this.dbSyncer.syncTable(table, lastSync);
                syncLog.recordsProcessed += result.recordsProcessed;
                syncLog.conflicts.push(...result.conflicts);
            } catch (error: any) {
                syncLog.errors.push(`${table}: ${error.message}`);
            }
        }
    }

    private async syncTransactionalData(lastSync: Date, syncLog: SyncLog) {
        const tables = ['PaymentTransaction', 'GeneratedReport', 'Announcement'];

        for (const table of tables) {
            try {
                const result = await this.dbSyncer.syncTable(table, lastSync);
                syncLog.recordsProcessed += result.recordsProcessed;
                syncLog.conflicts.push(...result.conflicts);
            } catch (error: any) {
                syncLog.errors.push(`${table}: ${error.message}`);
            }
        }
    }

    private async getLastSyncTimestamp(): Promise<Date> {
        const lastSync = await prisma.syncMetadata.findFirst({
            orderBy: { timestamp: 'desc' }
        });

        return lastSync?.timestamp || new Date(0);
    }

    private async updateSyncTimestamp() {
        await prisma.syncMetadata.create({
            data: {
                timestamp: new Date(),
                server_type: process.env.SERVER_TYPE || 'local'
            }
        });
    }

    private async saveSyncLog(syncLog: SyncLog) {
        await prisma.syncLog.create({
            data: {
                sync_id: syncLog.id,
                start_time: syncLog.startTime,
                end_time: syncLog.endTime,
                status: syncLog.status,
                direction: syncLog.direction,
                records_processed: syncLog.recordsProcessed,
                conflicts: JSON.stringify(syncLog.conflicts),
                errors: JSON.stringify(syncLog.errors)
            }
        });
    }

    async getSyncStatus() {
        const lastSync = await prisma.syncLog.findFirst({
            orderBy: { start_time: 'desc' }
        });

        const isOnline = await this.networkChecker.isOnline();

        return {
            lastSync: lastSync?.start_time,
            lastSyncStatus: lastSync?.status,
            isOnline,
            autoSyncEnabled: this.syncInterval !== null
        };
    }
}