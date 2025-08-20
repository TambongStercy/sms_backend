import { Router, Request, Response } from 'express';
import { SyncManager } from './sync-manager';
import { DatabaseSyncer } from './database-syncer';
import prisma from '../config/db';

const router = Router();
const syncManager = new SyncManager();
const dbSyncer = new DatabaseSyncer();

// Manual sync trigger
router.post('/sync/trigger', async (req: Request, res: Response) => {
  try {
    const syncLog = await syncManager.performSync();
    res.json({
      success: true,
      syncLog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync status
router.get('/sync/status', async (req: Request, res: Response) => {
  try {
    const status = await syncManager.getSyncStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync logs
router.get('/sync/logs', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.syncLog.findMany({
      orderBy: { start_time: 'desc' },
      take: 50
    });

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start auto sync
router.post('/sync/auto/start', async (req: Request, res: Response) => {
  try {
    const { intervalMinutes = 5 } = req.body;
    await syncManager.startAutoSync(intervalMinutes);

    res.json({
      success: true,
      message: `Auto sync started with ${intervalMinutes} minute interval`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop auto sync
router.post('/sync/auto/stop', async (req: Request, res: Response) => {
  try {
    syncManager.stopAutoSync();

    res.json({
      success: true,
      message: 'Auto sync stopped'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Receive changes from remote server (webhook endpoint)
router.post('/sync/receive/:tableName', async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const { records } = req.body;

    // Process incoming changes
    for (const record of records) {
      await dbSyncer.processIncomingRecord(tableName, record);
    }

    res.json({
      success: true,
      processed: records.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get changes since timestamp (for remote server to pull)
router.get('/sync/changes/:tableName', async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const { since, server_id } = req.query;

    const sinceDate = new Date(since as string);
    const changes = await dbSyncer.getLocalChanges(tableName, sinceDate);

    // Filter out changes from the requesting server
    const filteredChanges = changes.filter((record: any) =>
      record.server_id !== server_id
    );

    res.json({
      records: filteredChanges,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/sync/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server_id: process.env.SERVER_ID || 'local'
  });
});

export default router;