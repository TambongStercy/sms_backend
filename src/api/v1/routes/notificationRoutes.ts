// src/api/v1/routes/notificationRoutes.ts
import express from 'express';
import {
    sendNotification,
    sendBulkNotifications,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount
} from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Get user's own notifications (paginated)
router.get('/me',
    authenticate,
    getUserNotifications
);

// Get user's unread notification count
router.get('/me/unread-count',
    authenticate,
    getUnreadNotificationCount
);

// Mark all of a user's notifications as read
router.put('/mark-all-read',
    authenticate,
    markAllNotificationsAsRead
);

// Mark a single notification as read
router.put('/:id/read',
    authenticate,
    markNotificationAsRead
);

// The following routes are for admin/system use and can be kept for future internal tools

// Send a single notification (for specific admin tasks)
router.post('/send',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    sendNotification
);

// Send bulk notifications (for announcements or system-wide alerts)
router.post('/send-bulk',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    sendBulkNotifications
);

export default router; 