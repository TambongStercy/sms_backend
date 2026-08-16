// src/api/v1/services/notificationService.ts
//
// Notification system. Each MobileNotification has:
//   - user_id  (recipient)
//   - sender_id (actor, optional)
//   - title / message
//   - category (GENERAL, TASK_ASSIGNED, APPROVAL_NEEDED, ...)
//   - entity_type / entity_id / action_url (deep link back to the source object)
//   - status (SENT / DELIVERED / READ) + read_at
//
// The `sendToRolesInAcademicYear` + `notifySuperManagers` helpers make it easy
// for workflow services (salary, tasks, ...) to fan out approval / task alerts.

import prisma, {
    MobileNotification,
    NotificationStatus,
    NotificationCategory,
    NotificationPriority,
} from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import { sendPushToUsers, buildDeepLinkData } from './pushService';

/** Every notification surfaces as a modal on the frontend and a heads-up
 *  notification on mobile — the backend no longer gates popup on priority. */

/** Fire an OneSignal push for a persisted notification. Fire-and-forget: any
 *  push failure is logged but never affects the DB write or the API response. */
function firePushForNotification(n: MobileNotification): void {
    sendPushToUsers([n.user_id], {
        title: n.title || 'Notification',
        body: n.message,
        data: buildDeepLinkData({
            category: n.category,
            entityType: n.entity_type,
            entityId: n.entity_id,
            actionUrl: n.action_url,
            notificationId: n.id,
            extra: { priority: n.priority, popup: true },
        }),
        url: n.action_url || undefined,
        highPriority: true,
    }).catch((err) => console.error('[push] send failed for notif', n.id, err));
}

function firePushForBulk(rows: MobileNotification[]): void {
    if (!rows.length) return;
    // All rows share title/message/entity/priority — group by user_ids in one push call.
    const first = rows[0];
    sendPushToUsers(
        rows.map((r) => r.user_id),
        {
            title: first.title || 'Notification',
            body: first.message,
            data: buildDeepLinkData({
                category: first.category,
                entityType: first.entity_type,
                entityId: first.entity_id,
                actionUrl: first.action_url,
                extra: { priority: first.priority, popup: true },
            }),
            url: first.action_url || undefined,
            highPriority: true,
        }
    ).catch((err) => console.error('[push] bulk send failed:', err));
}

export interface NotificationData {
    user_id: number;
    message: string;
    title?: string;
    sender_id?: number;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    entity_type?: string;
    entity_id?: number;
    action_url?: string;
    status?: NotificationStatus;
    date_sent?: Date;
}

export interface BulkNotificationData {
    title: string;
    message: string;
    recipient_ids: number[];
    sender_id?: number;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    entity_type?: string;
    entity_id?: number;
    action_url?: string;
}

/** Send notification to a single user. */
export async function sendNotification(data: NotificationData): Promise<MobileNotification> {
    const notification = await prisma.mobileNotification.create({
        data: {
            user_id: data.user_id,
            sender_id: data.sender_id ?? null,
            title: data.title?.trim() || null,
            message: data.message,
            category: data.category ?? 'GENERAL',
            priority: data.priority ?? 'NORMAL',
            entity_type: data.entity_type ?? null,
            entity_id: data.entity_id ?? null,
            action_url: data.action_url ?? null,
            status: data.status ?? NotificationStatus.SENT,
            date_sent: data.date_sent ?? new Date(),
        },
    });
    firePushForNotification(notification);
    return notification;
}

/** Send the same notification to many users. */
export async function sendBulkNotifications(data: BulkNotificationData): Promise<void> {
    if (!Array.isArray(data.recipient_ids) || data.recipient_ids.length === 0) return;
    const now = new Date();
    const rows = data.recipient_ids.map((uid) => ({
        user_id: uid,
        sender_id: data.sender_id ?? null,
        title: data.title?.trim() || null,
        message: data.message,
        category: data.category ?? 'GENERAL',
        priority: data.priority ?? 'NORMAL',
        entity_type: data.entity_type ?? null,
        entity_id: data.entity_id ?? null,
        action_url: data.action_url ?? null,
        status: NotificationStatus.SENT,
        date_sent: now,
    }));
    await prisma.mobileNotification.createMany({
        data: rows,
        skipDuplicates: true,
    });
    firePushForBulk(rows as MobileNotification[]);
}

/**
 * Fan-out helper: notify every user holding any of the given roles.
 * `academic_year_id` is optional — omit to include global (null year) roles.
 */
export async function sendToRoles(
    roles: string[],
    payload: Omit<NotificationData, 'user_id'>,
    opts: { academic_year_id?: number } = {}
): Promise<{ notified: number }> {
    if (!roles.length) return { notified: 0 };
    const userRoles = await prisma.userRole.findMany({
        where: {
            role: { in: roles as any },
            ...(opts.academic_year_id !== undefined
                ? { academic_year_id: { in: [opts.academic_year_id, null] } }
                : {}),
        },
        select: { user_id: true },
    });
    const recipientIds = Array.from(new Set(userRoles.map((r) => r.user_id)));
    if (recipientIds.length === 0) return { notified: 0 };
    await sendBulkNotifications({
        title: payload.title ?? 'Notification',
        message: payload.message,
        recipient_ids: recipientIds,
        sender_id: payload.sender_id,
        category: payload.category,
        priority: payload.priority,
        entity_type: payload.entity_type,
        entity_id: payload.entity_id,
        action_url: payload.action_url,
    });
    return { notified: recipientIds.length };
}

/** Convenience: broadcast an APPROVAL_NEEDED alert to every SUPER_MANAGER. */
export async function notifySuperManagers(payload: Omit<NotificationData, 'user_id' | 'category'>) {
    return sendToRoles(['SUPER_MANAGER'], { ...payload, category: 'APPROVAL_NEEDED' });
}

/** Paginated list of a user's own notifications (with filtering). */
export async function getUserNotifications(
    userId: number,
    paginationOptions: PaginationOptions,
    filterOptions: FilterOptions & {
        category?: NotificationCategory;
        priority?: NotificationPriority;
        entity_type?: string;
        unread_only?: boolean;
    }
): Promise<PaginatedResult<MobileNotification>> {
    const { unread_only, category, priority, entity_type, ...rest } = filterOptions ?? {};
    const where: any = {
        user_id: userId,
        ...(category ? { category } : {}),
        ...(priority ? { priority } : {}),
        ...(entity_type ? { entity_type } : {}),
        ...(unread_only ? { status: { not: NotificationStatus.READ } } : {}),
        ...rest,
    };
    return paginate<MobileNotification>(prisma.mobileNotification, paginationOptions, where);
}

export async function markNotificationAsRead(
    notificationId: number,
    userId: number
): Promise<MobileNotification> {
    const existing = await prisma.mobileNotification.findUnique({ where: { id: notificationId } });
    if (!existing) throw new Error('Notification not found');
    if (existing.user_id !== userId) throw new Error('Forbidden: not your notification');
    return prisma.mobileNotification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.READ, read_at: new Date() },
    });
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
    return prisma.mobileNotification.count({
        where: { user_id: userId, status: { not: NotificationStatus.READ } },
    });
}

/**
 * Grouped unread breakdown so the frontend can show badge counts per category
 * (e.g. Approvals: 3 · Tasks: 2 · Other: 1).
 */
export async function getUnreadBreakdown(userId: number) {
    const grouped = await prisma.mobileNotification.groupBy({
        by: ['category'],
        _count: { _all: true },
        where: { user_id: userId, status: { not: NotificationStatus.READ } },
    });
    const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
    return {
        total,
        by_category: grouped.map((g) => ({ category: g.category, count: g._count._all })),
    };
}

export async function markAllNotificationsAsRead(userId: number): Promise<{ count: number }> {
    const result = await prisma.mobileNotification.updateMany({
        where: { user_id: userId, status: { not: NotificationStatus.READ } },
        data: { status: NotificationStatus.READ, read_at: new Date() },
    });
    return { count: result.count };
}

export async function deleteNotificationForUser(notificationId: number, userId: number) {
    const notification = await prisma.mobileNotification.findUnique({ where: { id: notificationId } });
    if (!notification) return { success: false, error: 'Notification not found', statusCode: 404 };
    if (notification.user_id !== userId) {
        return { success: false, error: 'You are not authorized to delete this notification', statusCode: 403 };
    }
    await prisma.mobileNotification.delete({ where: { id: notificationId } });
    return { success: true, message: 'Notification deleted successfully.' };
}
