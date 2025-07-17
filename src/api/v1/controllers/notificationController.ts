// src/api/v1/controllers/notificationController.ts
import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { extractPaginationAndFilters } from '../../../utils/pagination';

/**
 * Send a single notification. This is deprecated in favor of bulk notifications or context-specific triggers.
 * It remains for simple, direct notification needs.
 */
export const sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, message, recipient_id } = req.body;

        // Basic validation
        if (!message || !recipient_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: message and recipient_id are required'
            });
            return;
        }

        // The service layer now only needs a user_id and a combined message.
        const fullMessage = title ? `${title}: ${message}` : message;

        const notification = await notificationService.sendNotification({
            user_id: parseInt(recipient_id),
            message: fullMessage,
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, message, recipient_ids } = req.body;

        // Validate required fields
        if (!title || !message || !recipient_ids || !Array.isArray(recipient_ids)) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: title, message, and recipient_ids (array) are required'
            });
            return;
        }

        await notificationService.sendBulkNotifications({
            title,
            message,
            recipient_ids: recipient_ids.map((id: string) => parseInt(id)),
        });

        res.status(201).json({
            success: true,
            data: {
                message: `Bulk notifications sent to ${recipient_ids.length} users.`
            }
        });
    } catch (error: any) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const { paginationOptions, filterOptions } = extractPaginationAndFilters(
            req.query,
            ['status'] // Only allow filtering by status for now
        );

        const result = await notificationService.getUserNotifications(
            userId,
            paginationOptions,
            filterOptions
        );

        res.json({
            success: true,
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const notificationId = parseInt(req.params.id);
        if (isNaN(notificationId)) {
            res.status(400).json({ success: false, error: 'Invalid notification ID' });
            return;
        }

        // We can add a check here to ensure the user owns the notification before marking as read
        const notification = await notificationService.markNotificationAsRead(notificationId);

        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const count = await notificationService.getUnreadNotificationCount(userId);

        res.json({
            success: true,
            data: { unread_count: count }
        });
    } catch (error: any) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Mark all of a user's notifications as read
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const result = await notificationService.markAllNotificationsAsRead(userId);

        res.status(200).json({
            success: true,
            data: {
                markedCount: result.count,
                message: "All notifications marked as read"
            }
        });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 