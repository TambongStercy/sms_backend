// src/api/v1/services/communicationService.ts
import prisma, { Announcement, MobileNotification, Audience } from '../../../config/db';

export async function getAnnouncements(query: any): Promise<Announcement[]> {
    const { audience } = query;
    return prisma.announcement.findMany({
        where: audience ? { audience } : {},
    });
}

export async function createAnnouncement(data: {
    title: string;
    message: string;
    audience: Audience;
    academic_year_id?: number;
    created_by_id?: number;
}): Promise<Announcement> {
    return prisma.announcement.create({
        data,
    });
}

export async function sendNotification(data: {
    user_id: number;
    message: string;
}): Promise<MobileNotification> {
    return prisma.mobileNotification.create({
        data,
    });
}
