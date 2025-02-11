// src/api/v1/services/mobileService.ts
import { MobileNotification } from '@prisma/client';
import prisma from '../../../config/db';

export async function getNotifications(user_id: number): Promise<MobileNotification[]> {
    return prisma.mobileNotification.findMany({
        where: { user_id },
    });
}

export async function syncData(data: any): Promise<any> {
    // Logic for syncing offline data with the server
    return { message: 'Data synced successfully' };
}
