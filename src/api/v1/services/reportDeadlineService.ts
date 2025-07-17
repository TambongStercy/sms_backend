// src/api/v1/services/reportDeadlineService.ts
import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';
import * as notificationService from './notificationService';

export interface ReportDeadline {
    id: number;
    title: string;
    description: string;
    deadline_date: Date;
    report_type: 'SEQUENCE_REPORT' | 'TERM_REPORT' | 'ANNUAL_REPORT' | 'CUSTOM';
    target_roles: string[]; // Roles that must submit this report
    academic_year_id: number;
    is_active: boolean;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}

export interface ReportSubmission {
    id: number;
    deadline_id: number;
    submitted_by: number;
    submission_date: Date;
    file_path?: string;
    notes?: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
    reviewed_by?: number;
    reviewed_at?: Date;
    review_notes?: string;
}

export interface DeadlineOverview {
    id: number;
    title: string;
    deadline_date: Date;
    report_type: string;
    target_roles: string[];
    total_expected_submissions: number;
    received_submissions: number;
    pending_submissions: number;
    overdue_submissions: number;
    completion_rate: number;
    is_overdue: boolean;
    days_until_deadline: number;
}

/**
 * Create a new report deadline
 */
export async function createReportDeadline(data: {
    title: string;
    description: string;
    deadline_date: string;
    report_type: 'SEQUENCE_REPORT' | 'TERM_REPORT' | 'ANNUAL_REPORT' | 'CUSTOM';
    target_roles: string[];
    academic_year_id?: number;
    created_by: number;
}): Promise<ReportDeadline> {
    try {
        const currentYear = await getCurrentAcademicYear();
        const academicYearId = data.academic_year_id || currentYear?.id;

        if (!academicYearId) {
            throw new Error('Academic year is required');
        }

        // Validate deadline date
        const deadlineDate = new Date(data.deadline_date);
        if (isNaN(deadlineDate.getTime())) {
            throw new Error('Invalid deadline date format');
        }

        if (deadlineDate <= new Date()) {
            throw new Error('Deadline date must be in the future');
        }

        // Validate target roles
        const validRoles = [
            'TEACHER', 'HOD', 'PRINCIPAL', 'VICE_PRINCIPAL',
            'BURSAR', 'DISCIPLINE_MASTER', 'MANAGER'
        ];

        const invalidRoles = data.target_roles.filter(role => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
            throw new Error(`Invalid target roles: ${invalidRoles.join(', ')}`);
        }

        // Create the deadline
        const deadline = await prisma.$executeRaw`
            INSERT INTO report_deadlines (
                title, description, deadline_date, report_type, 
                target_roles, academic_year_id, is_active, created_by
            ) VALUES (
                ${data.title}, ${data.description}, ${deadlineDate}, ${data.report_type},
                ${JSON.stringify(data.target_roles)}, ${academicYearId}, true, ${data.created_by}
            )
            RETURNING *
        `;

        // Get the created deadline
        const createdDeadline = await prisma.$queryRaw<ReportDeadline[]>`
            SELECT * FROM report_deadlines 
            WHERE title = ${data.title} AND created_by = ${data.created_by}
            ORDER BY created_at DESC LIMIT 1
        `;

        if (createdDeadline.length === 0) {
            throw new Error('Failed to create deadline');
        }

        // Send notifications to target roles
        await notifyTargetRolesOfNewDeadline(createdDeadline[0], data.target_roles);

        return createdDeadline[0];
    } catch (error: any) {
        console.error('Error creating report deadline:', error);
        throw new Error(`Failed to create report deadline: ${error.message}`);
    }
}

/**
 * Get all report deadlines with submission statistics
 */
export async function getAllReportDeadlines(
    academicYearId?: number,
    filters?: {
        is_active?: boolean;
        report_type?: string;
        overdue_only?: boolean;
    }
): Promise<DeadlineOverview[]> {
    try {
        const currentYear = await getCurrentAcademicYear();
        const yearId = academicYearId || currentYear?.id;

        if (!yearId) {
            throw new Error('Academic year is required');
        }

        // Build where clause
        let whereClause = `academic_year_id = ${yearId}`;

        if (filters?.is_active !== undefined) {
            whereClause += ` AND is_active = ${filters.is_active}`;
        }

        if (filters?.report_type) {
            whereClause += ` AND report_type = '${filters.report_type}'`;
        }

        if (filters?.overdue_only) {
            whereClause += ` AND deadline_date < NOW()`;
        }

        // Get deadlines with submission statistics
        const deadlines = await prisma.$queryRaw<any[]>`
            SELECT 
                rd.*,
                COALESCE(submission_stats.total_expected, 0) as total_expected_submissions,
                COALESCE(submission_stats.received, 0) as received_submissions,
                COALESCE(submission_stats.pending, 0) as pending_submissions,
                COALESCE(submission_stats.overdue, 0) as overdue_submissions,
                CASE 
                    WHEN COALESCE(submission_stats.total_expected, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(submission_stats.received, 0) * 100.0 / submission_stats.total_expected), 2)
                END as completion_rate,
                CASE WHEN rd.deadline_date < NOW() THEN true ELSE false END as is_overdue,
                EXTRACT(DAY FROM (rd.deadline_date - NOW())) as days_until_deadline
            FROM report_deadlines rd
            LEFT JOIN (
                SELECT 
                    deadline_id,
                    COUNT(*) as total_expected,
                    COUNT(CASE WHEN rs.id IS NOT NULL THEN 1 END) as received,
                    COUNT(CASE WHEN rs.id IS NULL THEN 1 END) as pending,
                    COUNT(CASE WHEN rs.id IS NULL AND rd.deadline_date < NOW() THEN 1 END) as overdue
                FROM report_deadlines rd
                CROSS JOIN LATERAL (
                    SELECT u.id as user_id 
                    FROM users u 
                    JOIN user_roles ur ON u.id = ur.user_id 
                    WHERE ur.role = ANY(rd.target_roles::text[])
                ) expected_users
                LEFT JOIN report_submissions rs ON rs.deadline_id = rd.id AND rs.submitted_by = expected_users.user_id
                GROUP BY deadline_id
            ) submission_stats ON rd.id = submission_stats.deadline_id
            WHERE ${whereClause}
            ORDER BY rd.deadline_date ASC
        `;

        return deadlines.map(deadline => ({
            id: deadline.id,
            title: deadline.title,
            deadline_date: deadline.deadline_date,
            report_type: deadline.report_type,
            target_roles: Array.isArray(deadline.target_roles) ? deadline.target_roles : JSON.parse(deadline.target_roles || '[]'),
            total_expected_submissions: parseInt(deadline.total_expected_submissions) || 0,
            received_submissions: parseInt(deadline.received_submissions) || 0,
            pending_submissions: parseInt(deadline.pending_submissions) || 0,
            overdue_submissions: parseInt(deadline.overdue_submissions) || 0,
            completion_rate: parseFloat(deadline.completion_rate) || 0,
            is_overdue: deadline.is_overdue,
            days_until_deadline: parseInt(deadline.days_until_deadline) || 0
        }));
    } catch (error: any) {
        console.error('Error fetching report deadlines:', error);
        throw new Error(`Failed to fetch report deadlines: ${error.message}`);
    }
}

/**
 * Submit a report for a deadline
 */
export async function submitReport(data: {
    deadline_id: number;
    submitted_by: number;
    file_path?: string;
    notes?: string;
}): Promise<ReportSubmission> {
    try {
        // Check if deadline exists and is active
        const deadline = await prisma.$queryRaw<ReportDeadline[]>`
            SELECT * FROM report_deadlines 
            WHERE id = ${data.deadline_id} AND is_active = true
        `;

        if (deadline.length === 0) {
            throw new Error('Deadline not found or not active');
        }

        // Check if user already submitted for this deadline
        const existingSubmission = await prisma.$queryRaw<ReportSubmission[]>`
            SELECT * FROM report_submissions 
            WHERE deadline_id = ${data.deadline_id} AND submitted_by = ${data.submitted_by}
        `;

        if (existingSubmission.length > 0) {
            throw new Error('Report already submitted for this deadline');
        }

        // Create submission
        await prisma.$executeRaw`
            INSERT INTO report_submissions (
                deadline_id, submitted_by, submission_date, file_path, notes, status
            ) VALUES (
                ${data.deadline_id}, ${data.submitted_by}, NOW(), 
                ${data.file_path || null}, ${data.notes || null}, 'SUBMITTED'
            )
        `;

        // Get the created submission
        const submission = await prisma.$queryRaw<ReportSubmission[]>`
            SELECT * FROM report_submissions 
            WHERE deadline_id = ${data.deadline_id} AND submitted_by = ${data.submitted_by}
            ORDER BY submission_date DESC LIMIT 1
        `;

        // Notify Super Manager of submission
        await notifyManagerOfSubmission(deadline[0], submission[0]);

        return submission[0];
    } catch (error: any) {
        console.error('Error submitting report:', error);
        throw new Error(`Failed to submit report: ${error.message}`);
    }
}

/**
 * Review a submitted report
 */
export async function reviewReportSubmission(
    submissionId: number,
    reviewData: {
        status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
        review_notes?: string;
        reviewed_by: number;
    }
): Promise<ReportSubmission> {
    try {
        // Update submission with review
        await prisma.$executeRaw`
            UPDATE report_submissions 
            SET status = ${reviewData.status}, 
                review_notes = ${reviewData.review_notes || null}, 
                reviewed_by = ${reviewData.reviewed_by}, 
                reviewed_at = NOW()
            WHERE id = ${submissionId}
        `;

        // Get updated submission
        const submission = await prisma.$queryRaw<ReportSubmission[]>`
            SELECT * FROM report_submissions WHERE id = ${submissionId}
        `;

        if (submission.length === 0) {
            throw new Error('Submission not found');
        }

        // Notify submitter of review
        await notifySubmitterOfReview(submission[0], reviewData.status);

        return submission[0];
    } catch (error: any) {
        console.error('Error reviewing report submission:', error);
        throw new Error(`Failed to review report submission: ${error.message}`);
    }
}

/**
 * Get overdue reports and send notifications
 */
export async function processOverdueReports(): Promise<void> {
    try {
        // Get all overdue deadlines
        const overdueDeadlines = await prisma.$queryRaw<any[]>`
            SELECT rd.*, 
                   array_agg(DISTINCT expected_users.user_id) as expected_user_ids,
                   array_agg(DISTINCT rs.submitted_by) FILTER (WHERE rs.submitted_by IS NOT NULL) as submitted_user_ids
            FROM report_deadlines rd
            CROSS JOIN LATERAL (
                SELECT u.id as user_id 
                FROM users u 
                JOIN user_roles ur ON u.id = ur.user_id 
                WHERE ur.role = ANY(rd.target_roles::text[])
            ) expected_users
            LEFT JOIN report_submissions rs ON rs.deadline_id = rd.id AND rs.submitted_by = expected_users.user_id
            WHERE rd.deadline_date < NOW() AND rd.is_active = true
            GROUP BY rd.id
        `;

        for (const deadline of overdueDeadlines) {
            const expectedUserIds = deadline.expected_user_ids || [];
            const submittedUserIds = deadline.submitted_user_ids || [];
            const overdueUserIds = expectedUserIds.filter((id: number) => !submittedUserIds.includes(id));

            // Send overdue notifications
            for (const userId of overdueUserIds) {
                await notificationService.sendNotification({
                    user_id: userId,
                    message: `Report Overdue: Your ${deadline.title} report was due on ${deadline.deadline_date.toISOString().split('T')[0]}. Please submit it as soon as possible.`
                });
            }

            // Notify Super Manager of overdue reports
            const superManagers = await prisma.user.findMany({
                where: {
                    user_roles: {
                        some: { role: 'SUPER_MANAGER' }
                    }
                },
                select: { id: true }
            });

            for (const manager of superManagers) {
                await notificationService.sendNotification({
                    user_id: manager.id,
                    message: `Overdue Reports Alert: ${overdueUserIds.length} staff members have not submitted their ${deadline.title} reports. Deadline was ${deadline.deadline_date.toISOString().split('T')[0]}.`
                });
            }
        }
    } catch (error: any) {
        console.error('Error processing overdue reports:', error);
        throw new Error(`Failed to process overdue reports: ${error.message}`);
    }
}

/**
 * Send notifications to target roles about new deadline
 */
async function notifyTargetRolesOfNewDeadline(deadline: ReportDeadline, targetRoles: string[]): Promise<void> {
    try {
        // Get users with target roles
        const targetUsers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: {
                        role: { in: targetRoles as any[] }
                    }
                }
            },
            select: { id: true, name: true }
        });

        // Send notification to each user
        for (const user of targetUsers) {
            await notificationService.sendNotification({
                user_id: user.id,
                message: `New Report Deadline: A new report deadline has been set: ${deadline.title}. Due date: ${deadline.deadline_date.toISOString().split('T')[0]}. ${deadline.description}`
            });
        }
    } catch (error) {
        console.error('Error notifying target roles:', error);
    }
}

/**
 * Notify manager of new submission
 */
async function notifyManagerOfSubmission(deadline: ReportDeadline, submission: ReportSubmission): Promise<void> {
    try {
        // Get Super Managers
        const managers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: { role: 'SUPER_MANAGER' }
                }
            },
            select: { id: true }
        });

        // Get submitter name
        const submitter = await prisma.user.findUnique({
            where: { id: submission.submitted_by },
            select: { name: true }
        });

        for (const manager of managers) {
            await notificationService.sendNotification({
                user_id: manager.id,
                message: `Report Submitted: ${submitter?.name} has submitted their report for "${deadline.title}".`
            });
        }
    } catch (error) {
        console.error('Error notifying manager of submission:', error);
    }
}

/**
 * Notify submitter of review result
 */
async function notifySubmitterOfReview(submission: ReportSubmission, status: string): Promise<void> {
    try {
        const statusMessages = {
            'APPROVED': 'Your report has been approved.',
            'REJECTED': 'Your report has been rejected. Please check the review notes.',
            'NEEDS_REVISION': 'Your report needs revision. Please check the review notes and resubmit.'
        };

        await notificationService.sendNotification({
            user_id: submission.submitted_by,
            message: `Report Review Complete: ${statusMessages[status as keyof typeof statusMessages] || 'Your report has been reviewed.'}`
        });
    } catch (error) {
        console.error('Error notifying submitter of review:', error);
    }
}

/**
 * Get deadline statistics for dashboard
 */
export async function getDeadlineStatistics(academicYearId?: number): Promise<any> {
    try {
        const currentYear = await getCurrentAcademicYear();
        const yearId = academicYearId || currentYear?.id;

        if (!yearId) {
            return {
                total_deadlines: 0,
                active_deadlines: 0,
                overdue_deadlines: 0,
                completion_rate: 0
            };
        }

        const stats = await prisma.$queryRaw<any[]>`
            SELECT 
                COUNT(*) as total_deadlines,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_deadlines,
                COUNT(CASE WHEN deadline_date < NOW() AND is_active = true THEN 1 END) as overdue_deadlines,
                COALESCE(AVG(
                    CASE 
                        WHEN submission_stats.total_expected = 0 THEN 0
                        ELSE (submission_stats.received * 100.0 / submission_stats.total_expected)
                    END
                ), 0) as avg_completion_rate
            FROM report_deadlines rd
            LEFT JOIN (
                SELECT 
                    deadline_id,
                    COUNT(*) as total_expected,
                    COUNT(CASE WHEN rs.id IS NOT NULL THEN 1 END) as received
                FROM report_deadlines rd2
                CROSS JOIN LATERAL (
                    SELECT u.id as user_id 
                    FROM users u 
                    JOIN user_roles ur ON u.id = ur.user_id 
                    WHERE ur.role = ANY(rd2.target_roles::text[])
                ) expected_users
                LEFT JOIN report_submissions rs ON rs.deadline_id = rd2.id AND rs.submitted_by = expected_users.user_id
                GROUP BY deadline_id
            ) submission_stats ON rd.id = submission_stats.deadline_id
            WHERE rd.academic_year_id = ${yearId}
        `;

        const result = stats[0] || {};
        return {
            total_deadlines: parseInt(result.total_deadlines) || 0,
            active_deadlines: parseInt(result.active_deadlines) || 0,
            overdue_deadlines: parseInt(result.overdue_deadlines) || 0,
            completion_rate: parseFloat(result.avg_completion_rate) || 0
        };
    } catch (error: any) {
        console.error('Error getting deadline statistics:', error);
        throw new Error(`Failed to get deadline statistics: ${error.message}`);
    }
} 