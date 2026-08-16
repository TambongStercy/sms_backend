// src/api/v1/services/pushService.ts
//
// Higher-level push helpers built on top of config/onesignal.
// Kept separate from notificationService so callers can send pushes without
// creating an in-app notification row when that's what they want.

import prisma from '../../../config/db';
import { sendPush, PushResult, PushPayload } from '../../../config/onesignal';

export interface PushContent {
    title: string;
    body: string;
    data?: Record<string, any>;
    url?: string;
    /** When true, requests a heads-up push. The mobile / web client should
     *  also render an in-app modal (see `data.popup`). */
    highPriority?: boolean;
}

/** Build the standard `data` payload the mobile app uses for deep-linking. */
export function buildDeepLinkData(opts: {
    category?: string | null;
    entityType?: string | null;
    entityId?: number | null;
    actionUrl?: string | null;
    notificationId?: number | null;
    extra?: Record<string, any>;
}): Record<string, any> {
    const data: Record<string, any> = {};
    if (opts.category) data.category = opts.category;
    if (opts.entityType) data.entityType = opts.entityType;
    if (opts.entityId != null) data.entityId = opts.entityId;
    if (opts.actionUrl) data.actionUrl = opts.actionUrl;
    if (opts.notificationId != null) data.notificationId = opts.notificationId;
    if (opts.extra) Object.assign(data, opts.extra);
    return data;
}

export async function sendPushToUsers(
    userIds: number[],
    content: PushContent
): Promise<PushResult> {
    const payload: PushPayload = {
        userIds,
        title: content.title,
        body: content.body,
        data: content.data,
        url: content.url,
        highPriority: content.highPriority,
    };
    return sendPush(payload);
}

export async function sendPushToUser(userId: number, content: PushContent): Promise<PushResult> {
    return sendPushToUsers([userId], content);
}

/** Fan-out to every user holding any of the given roles (year-scoped or global). */
export async function sendPushToRoles(
    roles: string[],
    content: PushContent,
    opts: { academicYearId?: number } = {}
): Promise<PushResult & { targeted: number }> {
    if (!roles.length) return { sent: false, skipped: 'no_recipients', targeted: 0 };
    const userRoles = await prisma.userRole.findMany({
        where: {
            role: { in: roles as any },
            ...(opts.academicYearId !== undefined
                ? { academic_year_id: { in: [opts.academicYearId, null] } }
                : {}),
        },
        select: { user_id: true },
    });
    const recipientIds = Array.from(new Set(userRoles.map((r) => r.user_id)));
    const result = await sendPushToUsers(recipientIds, content);
    return { ...result, targeted: recipientIds.length };
}

/** Notify every parent linked to a given student. */
export async function sendPushToParentsOfStudent(
    studentId: number,
    content: PushContent
): Promise<PushResult & { targeted: number }> {
    const links = await prisma.parentStudent.findMany({
        where: { student_id: studentId },
        select: { parent_id: true },
    });
    const parentIds = Array.from(new Set(links.map((l) => l.parent_id)));
    const result = await sendPushToUsers(parentIds, content);
    return { ...result, targeted: parentIds.length };
}
