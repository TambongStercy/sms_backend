import { Router } from 'express';
import * as communicationController from '../controllers/communicationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /announcements - List announcements (optionally filter by audience)
// All authenticated users can view announcements
router.get('/announcements', authenticate, communicationController.getAnnouncements);

// POST /announcements - Create an announcement
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can create announcements
router.post('/announcements', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.createAnnouncement);

// POST /notifications - Send push notifications
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can send notifications
router.post('/notifications', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.sendNotification);

export default router;
