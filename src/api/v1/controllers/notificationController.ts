// src/api/v1/controllers/notificationController.ts
import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Send a single notification
 */
export const sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const senderId = authReq.user?.id;

        const {
            title,
            message,
            recipient_id,
            notification_type,
            priority,
            category,
            academic_year_id,
            metadata
        } = req.body;

        // Validate required fields
        if (!title || !message || !recipient_id || !notification_type) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: title, message, recipient_id, and notification_type are required'
            });
            return;
        }

        // Validate notification type
        const validTypes = ['SMS', 'EMAIL', 'IN_APP', 'WHATSAPP'];
        if (!validTypes.includes(notification_type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid notification type. Must be SMS, EMAIL, IN_APP, or WHATSAPP'
            });
            return;
        }

        // Validate priority
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        if (priority && !validPriorities.includes(priority)) {
            res.status(400).json({
                success: false,
                error: 'Invalid priority. Must be LOW, MEDIUM, HIGH, or URGENT'
            });
            return;
        }

        const notification = await notificationService.sendNotification({
            title,
            message,
            recipient_id: parseInt(recipient_id),
            sender_id: senderId,
            notification_type,
            priority: priority || 'MEDIUM',
            category,
            academic_year_id: academic_year_id ? parseInt(academic_year_id) : undefined,
            metadata
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
        const authReq = req as AuthenticatedRequest;
        const senderId = authReq.user?.id;

        const {
            title,
            message,
            recipient_ids,
            notification_type,
            priority,
            category,
            academic_year_id,
            metadata
        } = req.body;

        // Validate required fields
        if (!title || !message || !recipient_ids || !Array.isArray(recipient_ids) || !notification_type) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: title, message, recipient_ids (array), and notification_type are required'
            });
            return;
        }

        // Validate recipient_ids array
        if (recipient_ids.length === 0) {
            res.status(400).json({
                success: false,
                error: 'recipient_ids array cannot be empty'
            });
            return;
        }

        // Validate notification type
        const validTypes = ['SMS', 'EMAIL', 'IN_APP', 'WHATSAPP'];
        if (!validTypes.includes(notification_type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid notification type. Must be SMS, EMAIL, IN_APP, or WHATSAPP'
            });
            return;
        }

        const notifications = await notificationService.sendBulkNotifications({
            title,
            message,
            recipient_ids: recipient_ids.map((id: string) => parseInt(id)),
            sender_id: senderId,
            notification_type,
            priority: priority || 'MEDIUM',
            category,
            academic_year_id: academic_year_id ? parseInt(academic_year_id) : undefined,
            metadata
        });

        res.status(201).json({
            success: true,
            data: {
                notifications_sent: notifications.length,
                notifications: notifications
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
 * Send templated notification
 */
export const sendTemplatedNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const senderId = authReq.user?.id;

        const {
            template_id,
            variables,
            recipient_id,
            options
        } = req.body;

        // Validate required fields
        if (!template_id || !variables || !recipient_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: template_id, variables, and recipient_id are required'
            });
            return;
        }

        const notification = await notificationService.sendTemplatedNotification(
            template_id,
            variables,
            parseInt(recipient_id),
            senderId,
            options
        );

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        console.error('Error sending templated notification:', error);
        if (error.message.includes('template') && error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
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
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const {
            status,
            category,
            type,
            limit,
            offset
        } = req.query;

        const filters: any = {};
        if (status) filters.status = status as string;
        if (category) filters.category = category as string;
        if (type) filters.type = type as string;
        if (limit) filters.limit = parseInt(limit as string);
        if (offset) filters.offset = parseInt(offset as string);

        const notifications = await notificationService.getUserNotifications(userId, filters);

        res.json({
            success: true,
            data: notifications
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
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
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

        const notificationId = parseInt(req.params.id);
        if (isNaN(notificationId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid notification ID'
            });
            return;
        }

        await notificationService.markNotificationRead(notificationId, userId);

        res.json({
            success: true,
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
 * Get available notification templates
 */
export const getNotificationTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        const templates = Object.values(notificationService.NOTIFICATION_TEMPLATES);

        res.json({
            success: true,
            data: templates
        });
    } catch (error: any) {
        console.error('Error fetching notification templates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Send payment confirmation (helper endpoint)
 */
export const sendPaymentConfirmation = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            parent_id,
            amount,
            student_name,
            payment_method,
            payment_date,
            receipt_number
        } = req.body;

        // Validate required fields
        if (!parent_id || !amount || !student_name || !payment_method || !payment_date) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: parent_id, amount, student_name, payment_method, and payment_date are required'
            });
            return;
        }

        const notification = await notificationService.sendPaymentConfirmation(
            parseInt(parent_id),
            {
                amount: parseFloat(amount),
                student_name,
                payment_method,
                payment_date,
                receipt_number: receipt_number || 'N/A'
            }
        );

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        console.error('Error sending payment confirmation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Send absence notification (helper endpoint)
 */
export const sendAbsenceNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            parent_id,
            student_name,
            subject,
            date
        } = req.body;

        // Validate required fields
        if (!parent_id || !student_name || !subject || !date) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: parent_id, student_name, subject, and date are required'
            });
            return;
        }

        const notification = await notificationService.sendAbsenceNotification(
            parseInt(parent_id),
            {
                student_name,
                subject,
                date
            }
        );

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        console.error('Error sending absence notification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 