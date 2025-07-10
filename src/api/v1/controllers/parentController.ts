// src/api/v1/controllers/parentController.ts
import { Request, Response } from 'express';
import * as parentService from '../services/parentService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import * as quizService from '../services/quizService';

const prisma = new PrismaClient();

/**
 * Get parent dashboard data
 */
export const getParentDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const dashboardData = await parentService.getParentDashboard(parentId, academicYearId);

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error: any) {
        console.error('Error fetching parent dashboard:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get detailed information about a specific child
 */
export const getChildDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const studentId = parseInt(req.params.studentId);
        if (isNaN(studentId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid student ID'
            });
            return;
        }

        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const childDetails = await parentService.getChildDetails(parentId, studentId, academicYearId);

        res.json({
            success: true,
            data: childDetails
        });
    } catch (error: any) {
        console.error('Error fetching child details:', error);
        if (error.message.includes('relationship not found')) {
            res.status(403).json({
                success: false,
                error: 'Access denied: Not your child or relationship not found'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Send message to school staff
 */
export const sendMessageToStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const { recipient_id, subject, message, priority, student_id } = req.body;

        // Validate required fields
        if (!recipient_id || !subject || !message) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: recipient_id, subject, and message are required'
            });
            return;
        }

        // Validate recipient_id
        const parsedRecipientId = parseInt(recipient_id);
        if (isNaN(parsedRecipientId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid recipient ID'
            });
            return;
        }

        // Validate priority if provided
        if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
            res.status(400).json({
                success: false,
                error: 'Invalid priority. Must be LOW, MEDIUM, or HIGH'
            });
            return;
        }

        // Validate student_id if provided
        let parsedStudentId = undefined;
        if (student_id) {
            parsedStudentId = parseInt(student_id);
            if (isNaN(parsedStudentId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid student ID'
                });
                return;
            }
        }

        const notification = await parentService.sendMessageToStaff(parentId, {
            recipient_id: parsedRecipientId,
            subject,
            message,
            priority,
            student_id: parsedStudentId
        });

        res.status(201).json({
            success: true,
            data: {
                message: 'Message sent successfully',
                notification
            }
        });
    } catch (error: any) {
        console.error('Error sending message to staff:', error);
        if (error.message.includes('relationship not found')) {
            res.status(403).json({
                success: false,
                error: 'Access denied: Not your child or relationship not found'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get quiz results for parent's children
 */
export const getChildrenQuizResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const quizResults = await parentService.getChildrenQuizResults(parentId, academicYearId);

        res.json({
            success: true,
            data: quizResults
        });
    } catch (error: any) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get quiz results for a specific child
 */
export const getChildQuizResults = async (req: Request, res: Response): Promise<any> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const studentId = parseInt(req.params.studentId);
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        if (isNaN(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid student ID'
            });
        }

        // Get quiz results for this specific child
        const results = await parentService.getChildQuizResults(parentId, studentId, academicYearId);

        res.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Error fetching child quiz results:', error);

        let statusCode = 500;
        if (error.message.includes('relationship not found')) {
            statusCode = 403;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get school announcements for parents
 */
export const getSchoolAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // Validate limit
        if (limit < 1 || limit > 50) {
            res.status(400).json({
                success: false,
                error: 'Limit must be between 1 and 50'
            });
            return;
        }

        const announcements = await parentService.getSchoolAnnouncements(parentId, limit);

        res.json({
            success: true,
            data: announcements
        });
    } catch (error: any) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get comprehensive analytics for a child's performance
 */
export const getChildAnalytics = async (req: Request, res: Response): Promise<any> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;

        if (!parentId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const studentId = parseInt(req.params.studentId);
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const analytics = await parentService.getChildAnalytics(parentId, studentId, academicYearId);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error: any) {
        console.error('Error fetching child analytics:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('not enrolled')) statusCode = 404;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}; 