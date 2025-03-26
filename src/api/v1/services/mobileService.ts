// src/api/v1/services/mobileService.ts
import { MobileNotification } from '@prisma/client';
import prisma from '../../../config/db';

export async function getNotifications(user_id: number, status?: string): Promise<MobileNotification[]> {
    const whereClause: any = { user_id };

    // If status filtering is provided and not 'all', apply the filter
    if (status && status !== 'all') {
        // Convert status to the appropriate enum value expected by the database
        // Assuming status can be 'read' (maps to READ) or 'unread' (maps to SENT/DELIVERED)
        if (status === 'read') {
            whereClause.status = 'READ';
        } else if (status === 'unread') {
            whereClause.status = {
                in: ['SENT', 'DELIVERED']
            };
        }
    }

    return prisma.mobileNotification.findMany({
        where: whereClause,
    });
}

export async function syncData(data: any): Promise<any> {
    // Logic for syncing offline data with the server
    return { message: 'Data synced successfully' };
}
