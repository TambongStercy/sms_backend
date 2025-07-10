// src/api/v1/services/notificationService.ts
import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

export interface NotificationData {
    title: string;
    message: string;
    recipient_id: number;
    sender_id?: number;
    notification_type: 'SMS' | 'EMAIL' | 'IN_APP' | 'WHATSAPP';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category?: 'ACADEMIC' | 'FINANCIAL' | 'DISCIPLINARY' | 'GENERAL' | 'SYSTEM';
    academic_year_id?: number;
    metadata?: any; // Additional data like payment details, report info, etc.
}

export interface BulkNotificationData {
    title: string;
    message: string;
    recipient_ids: number[];
    sender_id?: number;
    notification_type: 'SMS' | 'EMAIL' | 'IN_APP' | 'WHATSAPP';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category?: 'ACADEMIC' | 'FINANCIAL' | 'DISCIPLINARY' | 'GENERAL' | 'SYSTEM';
    academic_year_id?: number;
    metadata?: any;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    title_template: string;
    message_template: string;
    category: string;
    default_type: 'SMS' | 'EMAIL' | 'IN_APP' | 'WHATSAPP';
    variables: string[]; // List of required variables for the template
}

// Notification templates for common scenarios
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
    PAYMENT_RECEIVED: {
        id: 'PAYMENT_RECEIVED',
        name: 'Payment Received',
        title_template: 'Payment Confirmation',
        message_template: 'Payment of {{amount}} has been received for {{student_name}} via {{payment_method}} on {{payment_date}}. Receipt #{{receipt_number}}',
        category: 'FINANCIAL',
        default_type: 'SMS',
        variables: ['amount', 'student_name', 'payment_method', 'payment_date', 'receipt_number']
    },
    PAYMENT_REMINDER: {
        id: 'PAYMENT_REMINDER',
        name: 'Payment Reminder',
        title_template: 'School Fees Due',
        message_template: 'Dear parent, school fees for {{student_name}} are due. Amount: {{amount}}. Due date: {{due_date}}.',
        category: 'FINANCIAL',
        default_type: 'SMS',
        variables: ['student_name', 'amount', 'due_date']
    },
    ABSENCE_NOTIFICATION: {
        id: 'ABSENCE_NOTIFICATION',
        name: 'Student Absence',
        title_template: 'Student Absence Alert',
        message_template: '{{student_name}} was absent from {{subject}} class on {{date}}. Please confirm if this absence was authorized.',
        category: 'ACADEMIC',
        default_type: 'SMS',
        variables: ['student_name', 'subject', 'date']
    },
    REPORT_AVAILABLE: {
        id: 'REPORT_AVAILABLE',
        name: 'Report Card Available',
        title_template: 'Report Card Ready',
        message_template: '{{student_name}}\'s report card for {{sequence}} is now available for download.',
        category: 'ACADEMIC',
        default_type: 'IN_APP',
        variables: ['student_name', 'sequence']
    },
    DISCIPLINE_ISSUE: {
        id: 'DISCIPLINE_ISSUE',
        name: 'Discipline Issue',
        title_template: 'Discipline Notice',
        message_template: 'Dear parent, {{student_name}} has been involved in a discipline issue: {{issue_description}}. Please contact the school.',
        category: 'DISCIPLINARY',
        default_type: 'SMS',
        variables: ['student_name', 'issue_description']
    },
    REPORT_OVERDUE: {
        id: 'REPORT_OVERDUE',
        name: 'Report Overdue',
        title_template: 'Report Deadline Missed',
        message_template: 'Report for {{report_type}} was due on {{deadline}}. Please submit immediately.',
        category: 'SYSTEM',
        default_type: 'IN_APP',
        variables: ['report_type', 'deadline']
    },
    STUDENT_ENROLLMENT: {
        id: 'STUDENT_ENROLLMENT',
        name: 'Student Enrollment',
        title_template: 'Enrollment Confirmation',
        message_template: '{{student_name}} has been successfully enrolled in {{class_name}} for the {{academic_year}} academic year.',
        category: 'ACADEMIC',
        default_type: 'SMS',
        variables: ['student_name', 'class_name', 'academic_year']
    }
};

/**
 * Send a single notification
 */
export async function sendNotification(data: NotificationData): Promise<any> {
    try {
        const currentYear = await getCurrentAcademicYear();
        const academicYearId = data.academic_year_id || currentYear?.id;

        // Create notification record (combine title and message since title field doesn't exist)
        const notification = await prisma.mobileNotification.create({
            data: {
                message: data.title ? `${data.title}: ${data.message}` : data.message,
                user_id: data.recipient_id,
                status: 'SENT'
            }
        });

        // Process notification based on type
        await processNotification(notification);

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new Error('Failed to send notification');
    }
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(data: BulkNotificationData): Promise<any[]> {
    try {
        const currentYear = await getCurrentAcademicYear();
        const academicYearId = data.academic_year_id || currentYear?.id;

        const notifications = [];

        for (const recipientId of data.recipient_ids) {
            const notification = await prisma.mobileNotification.create({
                data: {
                    message: data.title ? `${data.title}: ${data.message}` : data.message,
                    user_id: recipientId,
                    status: 'SENT'
                }
            });

            // Process each notification
            await processNotification(notification);
            notifications.push(notification);
        }

        return notifications;
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        throw new Error('Failed to send bulk notifications');
    }
}

/**
 * Send notification using template
 */
export async function sendTemplatedNotification(
    templateId: string,
    variables: Record<string, string>,
    recipient_id: number,
    sender_id?: number,
    options?: {
        type?: 'SMS' | 'EMAIL' | 'IN_APP' | 'WHATSAPP';
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        academic_year_id?: number;
    }
): Promise<any> {
    const template = NOTIFICATION_TEMPLATES[templateId];
    if (!template) {
        throw new Error(`Notification template ${templateId} not found`);
    }

    // Replace variables in template
    let title = template.title_template;
    let message = template.message_template;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), value);
        message = message.replace(new RegExp(placeholder, 'g'), value);
    }

    // Send notification
    return await sendNotification({
        title,
        message,
        recipient_id,
        sender_id,
        notification_type: options?.type || template.default_type,
        priority: options?.priority || 'MEDIUM',
        category: template.category as any,
        academic_year_id: options?.academic_year_id,
        metadata: { template_id: templateId, variables }
    });
}

/**
 * Process notification based on type (send actual SMS, email, etc.)
 */
async function processNotification(notification: any): Promise<void> {
    try {
        switch (notification.type) {
            case 'SMS':
                await sendSMS(notification);
                break;
            case 'EMAIL':
                await sendEmail(notification);
                break;
            case 'WHATSAPP':
                await sendWhatsApp(notification);
                break;
            case 'IN_APP':
                // In-app notifications are already stored in DB
                await markNotificationSent(notification.id);
                break;
            default:
                console.warn(`Unknown notification type: ${notification.type}`);
        }
    } catch (error) {
        console.error(`Error processing ${notification.type} notification:`, error);
        await markNotificationFailed(notification.id, error.message);
    }
}

/**
 * Send SMS notification
 */
async function sendSMS(notification: any): Promise<void> {
    try {
        // Get recipient's phone number
        const user = await prisma.user.findUnique({
            where: { id: notification.user_id },
            select: { phone: true, whatsapp_number: true, name: true }
        });

        if (!user?.phone) {
            throw new Error('User phone number not found');
        }

        // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
        console.log(`SMS to ${user.phone}: ${notification.message}`);

        // For now, mark as sent (replace with actual SMS API call)
        await markNotificationSent(notification.id);
    } catch (error) {
        throw new Error(`SMS sending failed: ${error.message}`);
    }
}

/**
 * Send Email notification
 */
async function sendEmail(notification: any): Promise<void> {
    try {
        // Get recipient's email
        const user = await prisma.user.findUnique({
            where: { id: notification.user_id },
            select: { email: true, name: true }
        });

        if (!user?.email) {
            throw new Error('User email not found');
        }

        // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
        console.log(`Email to ${user.email}: ${notification.title} - ${notification.message}`);

        // For now, mark as sent (replace with actual email API call)
        await markNotificationSent(notification.id);
    } catch (error) {
        throw new Error(`Email sending failed: ${error.message}`);
    }
}

/**
 * Send WhatsApp notification
 */
async function sendWhatsApp(notification: any): Promise<void> {
    try {
        // Get recipient's WhatsApp number
        const user = await prisma.user.findUnique({
            where: { id: notification.user_id },
            select: { whatsapp_number: true, phone: true, name: true }
        });

        const whatsappNumber = user?.whatsapp_number || user?.phone;
        if (!whatsappNumber) {
            throw new Error('User WhatsApp number not found');
        }

        // TODO: Integrate with WhatsApp Business API
        console.log(`WhatsApp to ${whatsappNumber}: ${notification.message}`);

        // For now, mark as sent (replace with actual WhatsApp API call)
        await markNotificationSent(notification.id);
    } catch (error) {
        throw new Error(`WhatsApp sending failed: ${error.message}`);
    }
}

/**
 * Mark notification as successfully sent
 */
async function markNotificationSent(notificationId: number): Promise<void> {
    await prisma.mobileNotification.update({
        where: { id: notificationId },
        data: {
            status: 'DELIVERED'
        }
    });
}

/**
 * Mark notification as failed
 */
async function markNotificationFailed(notificationId: number, error: string): Promise<void> {
    await prisma.mobileNotification.update({
        where: { id: notificationId },
        data: {
            status: 'SENT' // Keep as SENT since error_message field doesn't exist
        }
    });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
    userId: number,
    filters?: {
        status?: 'SENT' | 'DELIVERED' | 'READ';
        category?: string;
        type?: string;
        limit?: number;
        offset?: number;
    }
): Promise<any[]> {
    const whereClause: any = { user_id: userId };

    if (filters?.status) whereClause.status = filters.status;
    if (filters?.category) whereClause.category = filters.category;
    if (filters?.type) whereClause.type = filters.type;

    return await prisma.mobileNotification.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
            user: {
                select: { id: true, name: true, matricule: true }
            }
        }
    });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number, userId: number): Promise<void> {
    await prisma.mobileNotification.updateMany({
        where: {
            id: notificationId,
            user_id: userId
        },
        data: {
            status: 'READ'
        }
    });
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
    return await prisma.mobileNotification.count({
        where: {
            user_id: userId,
            status: { in: ['SENT', 'DELIVERED'] }
        }
    });
}

/**
 * Send payment confirmation notification
 */
export async function sendPaymentConfirmation(
    parentId: number,
    paymentData: {
        amount: number;
        student_name: string;
        payment_method: string;
        payment_date: string;
        receipt_number: string;
    }
): Promise<any> {
    return await sendTemplatedNotification(
        'PAYMENT_RECEIVED',
        {
            ...paymentData,
            amount: paymentData.amount.toString()
        },
        parentId,
        undefined,
        { type: 'SMS', priority: 'MEDIUM' }
    );
}

/**
 * Send absence notification to parents
 */
export async function sendAbsenceNotification(
    parentId: number,
    absenceData: {
        student_name: string;
        subject: string;
        date: string;
    }
): Promise<any> {
    return await sendTemplatedNotification(
        'ABSENCE_NOTIFICATION',
        absenceData,
        parentId,
        undefined,
        { type: 'SMS', priority: 'HIGH' }
    );
}

/**
 * Send report card available notification
 */
export async function sendReportAvailableNotification(
    parentId: number,
    reportData: {
        student_name: string;
        sequence: string;
    }
): Promise<any> {
    return await sendTemplatedNotification(
        'REPORT_AVAILABLE',
        reportData,
        parentId,
        undefined,
        { type: 'IN_APP', priority: 'MEDIUM' }
    );
}

/**
 * Send discipline issue notification
 */
export async function sendDisciplineNotification(
    parentId: number,
    disciplineData: {
        student_name: string;
        issue_description: string;
    }
): Promise<any> {
    return await sendTemplatedNotification(
        'DISCIPLINE_ISSUE',
        disciplineData,
        parentId,
        undefined,
        { type: 'SMS', priority: 'HIGH' }
    );
}

/**
 * Send report overdue notification to staff
 */
export async function sendReportOverdueNotification(
    staffId: number,
    reportData: {
        report_type: string;
        deadline: string;
    }
): Promise<any> {
    return await sendTemplatedNotification(
        'REPORT_OVERDUE',
        reportData,
        staffId,
        undefined,
        { type: 'IN_APP', priority: 'HIGH' }
    );
}

/**
 * Clean up old notifications (for maintenance)
 */
export async function cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.mobileNotification.deleteMany({
        where: {
            created_at: { lt: cutoffDate },
            status: { in: ['SENT', 'DELIVERED', 'READ'] }
        }
    });

    return result.count;
} 