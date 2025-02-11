import { Router } from 'express';
import * as mobileController from '../controllers/mobileController';

const router = Router();

// GET /mobile/notifications - Get user-specific notifications
router.get('/notifications', mobileController.getNotifications);

// POST /mobile/data/sync - Sync offline data (if implemented)
router.post('/data/sync', mobileController.syncData);

export default router;
