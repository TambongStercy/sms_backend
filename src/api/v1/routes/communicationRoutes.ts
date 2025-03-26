// Swagger documentation can be found in src/config/swagger/docs/communicationDocs.ts
import { Router } from 'express';
import * as communicationController from '../controllers/communicationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /announcements - List announcements (optionally filter by audience)
// All authenticated users can view announcements
router.get('/announcements', authenticate, communicationController.getAnnouncements);

// POST /announcements - Create an announcement
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can create announcements
router.post('/announcements', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.createAnnouncement);

// POST /notifications - Send push notifications
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can send notifications
router.post('/notifications', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.sendNotification);

export default router;
