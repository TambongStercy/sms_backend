import { Router } from 'express';
import * as communicationController from '../controllers/communicationController';

const router = Router();

// GET /announcements - List announcements (optionally filter by audience)
router.get('/announcements', communicationController.getAnnouncements);

// POST /announcements - Create an announcement
router.post('/announcements', communicationController.createAnnouncement);

// POST /notifications - Send push notifications
router.post('/notifications', communicationController.sendNotification);

export default router;
