// src/api/v1/services/notificationService.ts
import prisma, { MobileNotification, NotificationStatus } from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export interface NotificationData {
    user_id: number;
    message: string;
    status?: NotificationStatus;
    date_sent?: Date;
}

export interface BulkNotificationData {
    title: string;
    message: string;
    recipient_ids: number[];
    sender_id?: number;
}

/**
 * Send notification to a single user
 */
export async function sendNotification(data: NotificationData): Promise<MobileNotification> {
    return await prisma.mobileNotification.create({
        data: {
            user_id: data.user_id,
            message: data.message,
            status: data.status || NotificationStatus.SENT,
            date_sent: data.date_sent || new Date(),
        },
    });
}

/**
 * Send bulk notifications to multiple users (in-app only)
 */
export async function sendBulkNotifications(data: BulkNotificationData): Promise<void> {
    try {
        // Create notification message
        const notificationMessage = `${data.title}\n\n${data.message}`;

        // Create in-app notifications for all recipients
        const notifications = data.recipient_ids.map(userId => ({
            user_id: userId,
            message: notificationMessage,
            status: NotificationStatus.SENT,
            date_sent: new Date(),
        }));

        // Insert all notifications
        await prisma.mobileNotification.createMany({
            data: notifications,
            skipDuplicates: true
        });

        //TODO: Send notifications to all recipients using firebase messaging

        console.log(`✅ Sent in-app notifications to ${data.recipient_ids.length} users for: ${data.title}`);

    } catch (error) {
        console.error('❌ Error sending bulk notifications:', error);
        throw error;
    }
}

/**
 * Get user notifications with pagination and filtering
 */
export async function getUserNotifications(
    userId: number,
    paginationOptions: PaginationOptions,
    filterOptions: FilterOptions
): Promise<PaginatedResult<MobileNotification>> {
    const query = {
        where: {
            user_id: userId,
            ...filterOptions,
        },
        orderBy: {
            date_sent: 'desc'
        }
    };
    return await paginate<MobileNotification>(prisma.mobileNotification, paginationOptions, query.where);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<MobileNotification> {
    return await prisma.mobileNotification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.READ },
    });
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
    return await prisma.mobileNotification.count({
        where: {
            user_id: userId,
            status: { not: NotificationStatus.READ }
        },
    });
}

/**
 * Mark all of a user's notifications as read
 * @param userId - The ID of the user
 * @returns The number of notifications updated
 */
export async function markAllNotificationsAsRead(userId: number): Promise<{ count: number }> {
    const result = await prisma.mobileNotification.updateMany({
        where: {
            user_id: userId,
            status: { not: NotificationStatus.READ }
        },
        data: {
            status: NotificationStatus.READ,
        },
    });
    return { count: result.count };
}

/**
 * Deletes a notification for a specific user.
 * Ensures that a user can only delete their own notifications.
 * @param notificationId - The ID of the notification to delete.
 * @param userId - The ID of the user requesting the deletion.
 * @returns An object indicating success or failure.
 */
export async function deleteNotificationForUser(notificationId: number, userId: number) {
    try {
        const notification = await prisma.mobileNotification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            return { success: false, error: "Notification not found", statusCode: 404 };
        }

        // Security check: ensure the user owns this notification
        if (notification.user_id !== userId) {
            return { success: false, error: "You are not authorized to delete this notification", statusCode: 403 };
        }

        await prisma.mobileNotification.delete({
            where: { id: notificationId },
        });

        return { success: true, message: "Notification deleted successfully." };
    } catch (error: any) {
        console.error(`Failed to delete notification ${notificationId} for user ${userId}:`, error);
        return { success: false, error: "An error occurred while deleting the notification.", statusCode: 500 };
    }
} 