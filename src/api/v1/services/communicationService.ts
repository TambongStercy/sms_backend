// src/api/v1/services/communicationService.ts
import prisma, { Announcement, MobileNotification, Audience } from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination'; // Import pagination utilities
import { getAcademicYearId } from '../../../utils/academicYear'; // Import academic year utility
import { sendNotification as sendNotificationService, sendBulkNotifications } from './notificationService'; // Import notification service

export async function getAnnouncements(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Announcement>> {

    const where: any = {};
    const processedFilters: any = { ...filterOptions };

    // Determine Academic Year ID
    let yearId: number | null | undefined = undefined;
    if (processedFilters.academicYearId) {
        const parsedId = parseInt(processedFilters.academicYearId as string);
        yearId = isNaN(parsedId) ? undefined : parsedId;
        delete processedFilters.academicYearId; // Remove from filters passed to paginate
    }

    // If no valid ID provided, get the current default
    if (yearId === undefined) {
        yearId = await getAcademicYearId();
        // Note: getAcademicYearId() might return null if no current year exists
    }

    // Apply academic year filter (handles number or null)
    // Announcements might be global (null) or year-specific
    where.academic_year_id = yearId;

    // Apply other filters (e.g., audience, title)
    if (processedFilters.audience) {
        where.audience = processedFilters.audience;
    }
    if (processedFilters.title) {
        where.title = { contains: processedFilters.title, mode: 'insensitive' };
    }

    // Define includes if needed (e.g., created_by user)
    const include: any = {
        created_by: true // Example: include the user who created it
    };

    // Use the paginate utility
    return paginate<Announcement>(
        prisma.announcement,
        paginationOptions,
        where, // Pass the constructed where clause
        include // Pass includes
    );
}

/**
 * Get users by audience type for notifications
 */
async function getUsersByAudience(audience: Audience, academicYearId?: number): Promise<number[]> {
    let roleFilter: any = {};

    switch (audience) {
        case 'INTERNAL':
            // All staff members (non-parent roles)
            roleFilter = {
                role: {
                    in: ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'TEACHER', 'DISCIPLINE_MASTER', 'GUIDANCE_COUNSELOR', 'HOD']
                }
            };
            break;
        case 'EXTERNAL':
            // Only parents
            roleFilter = {
                role: 'PARENT'
            };
            break;
        case 'BOTH':
            // All users
            roleFilter = {};
            break;
        default:
            return [];
    }

    const whereClause: any = {
        user_roles: {
            some: roleFilter
        }
    };

    // If academic year is specified, include both global roles and year-specific roles
    if (academicYearId && roleFilter.role) {
        whereClause.user_roles.some.OR = [
            { ...roleFilter, academic_year_id: academicYearId },
            { ...roleFilter, academic_year_id: null }
        ];
        delete whereClause.user_roles.some.role;
    }

    const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
    });

    return users.map(user => user.id);
}

export async function createAnnouncement(data: {
    title: string;
    message: string;
    audience: Audience;
    academic_year_id?: number;
    created_by_id?: number;
}): Promise<Announcement> {
    // Create the announcement
    const announcement = await prisma.announcement.create({
        data,
    });

    try {
        // Get target users for notifications
        const targetUserIds = await getUsersByAudience(data.audience, data.academic_year_id);

        if (targetUserIds.length > 0) {
            // Send in-app notifications to all targeted users
            await sendBulkNotifications({
                title: `New Announcement: ${data.title}`,
                message: data.message,
                recipient_ids: targetUserIds,
                sender_id: data.created_by_id
            });

            console.log(`✅ Announcement created and notifications sent to ${targetUserIds.length} users`);
        } else {
            console.log('⚠️ No target users found for announcement notifications');
        }

    } catch (notificationError) {
        console.error('❌ Error sending announcement notifications:', notificationError);
        // Don't fail the announcement creation if notifications fail
    }

    return announcement;
}

export async function updateAnnouncement(
    id: number,
    data: Partial<{ title: string; message: string; audience: Audience; academic_year_id: number | null; }>
): Promise<Announcement | null> {
    try {
        return await prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                message: data.message,
                audience: data.audience,
                // Handle possibility of setting academic_year_id to null or a specific ID
                academic_year_id: data.academic_year_id === null ? null : data.academic_year_id
            },
        });
    } catch (error: any) {
        if (error.code === 'P2025') { // Record to update not found
            return null;
        }
        throw error; // Re-throw other errors
    }
}

export async function deleteAnnouncement(id: number): Promise<Announcement | null> {
    try {
        return await prisma.announcement.delete({
            where: { id },
        });
    } catch (error: any) {
        if (error.code === 'P2025') { // Record to delete not found
            return null;
        }
        throw error; // Re-throw other errors
    }
}

export async function sendNotification(data: {
    user_id: number;
    message: string;
}): Promise<MobileNotification> {
    return prisma.mobileNotification.create({
        data,
    });
}
