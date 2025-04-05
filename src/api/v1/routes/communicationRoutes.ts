// Swagger documentation can be found in src/config/swagger/docs/communicationDocs.ts
import { Router } from 'express';
import * as communicationController from '../controllers/communicationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /announcements - List announcements (optionally filter by audience/academicYearId)
// All authenticated users can view announcements
router.get('/announcements', authenticate, communicationController.getAnnouncements);

// POST /announcements - Create an announcement
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can create announcements
router.post('/announcements', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.createAnnouncement);

// PUT /announcements/:id - Update an announcement
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update announcements
router.put('/announcements/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.updateAnnouncement);

// DELETE /announcements/:id - Delete an announcement
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can delete announcements
router.delete('/announcements/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.deleteAnnouncement);

// POST /notifications - Send push notifications
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can send notifications
router.post('/notifications', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.sendNotification);

export default router;
