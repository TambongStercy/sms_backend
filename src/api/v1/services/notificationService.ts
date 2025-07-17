// src/api/v1/services/notificationService.ts
import prisma, { MobileNotification, NotificationStatus } from '../../../config/db';

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
 * Get user notifications
 */
export async function getUserNotifications(userId: number, limit = 50): Promise<MobileNotification[]> {
    return await prisma.mobileNotification.findMany({
        where: { user_id: userId },
        orderBy: { date_sent: 'desc' },
        take: limit,
    });
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