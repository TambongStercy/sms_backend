// Swagger documentation can be found in src/config/swagger/docs/mobileDocs.ts
import { Router } from 'express';
import * as mobileController from '../controllers/mobileController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /mobile/dashboard - Get mobile dashboard data
// All authenticated users can access their dashboard
router.get('/dashboard', authenticate, mobileController.getDashboard);

// POST /mobile/register-device - Register a mobile device for push notifications
// All authenticated users can register their devices
router.post('/register-device', authenticate, mobileController.registerDevice);

// GET /mobile/notifications - Get user-specific notifications
// All authenticated users can access their notifications
router.get('/notifications', authenticate, mobileController.getNotifications);

// POST /mobile/data/sync - Sync offline data (if implemented)
// All authenticated users can sync their data
router.post('/data/sync', authenticate, mobileController.syncData);

export default router;
