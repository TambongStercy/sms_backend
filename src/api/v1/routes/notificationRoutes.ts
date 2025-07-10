// src/api/v1/routes/notificationRoutes.ts
import express from 'express';
import {
    sendNotification,
    sendBulkNotifications,
    sendTemplatedNotification,
    getUserNotifications,
    markNotificationRead,
    getUnreadNotificationCount,
    getNotificationTemplates,
    sendPaymentConfirmation,
    sendAbsenceNotification
} from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Get notification templates (public for admins)
router.get('/templates',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']),
    getNotificationTemplates
);

// Get user's notifications
router.get('/me',
    authenticate,
    getUserNotifications
);

// Get unread notification count
router.get('/me/unread-count',
    authenticate,
    getUnreadNotificationCount
);

// Mark notification as read
router.put('/:id/read',
    authenticate,
    markNotificationRead
);

// Send single notification (admin only)
router.post('/send',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER']),
    sendNotification
);

// Send bulk notifications (admin only)
router.post('/send-bulk',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    sendBulkNotifications
);

// Send templated notification (admin only)
router.post('/send-template',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER']),
    sendTemplatedNotification
);

// Send payment confirmation (Bursar only)
router.post('/payment-confirmation',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'BURSAR']),
    sendPaymentConfirmation
);

// Send absence notification (Teachers and admin)
router.post('/absence-notification',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'HOD', 'DISCIPLINE_MASTER']),
    sendAbsenceNotification
);

export default router; 