import { Request, Response } from 'express';
import * as bursarService from '../services/bursarService';
import { Gender } from '@prisma/client';

/**
 * Create student with automatic parent account creation
 * POST /api/v1/bursar/create-parent-with-student
 */
export const createStudentWithParent = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            student_name: studentName,
            date_of_birth: dateOfBirth,
            place_of_birth: placeOfBirth,
            gender: gender,
            residence: residence,
            former_school: formerSchool,
            class_id: classId,
            is_new_student: isNewStudent,
            academic_year_id: academicYearId,
            parent_name: parentName,
            parent_phone: parentPhone,
            parent_whatsapp: parentWhatsapp,
            parent_email: parentEmail,
            parent_address: parentAddress,
            relationship: relationship
        } = req.body;

        // Validate required fields
        if (!studentName || !dateOfBirth || !placeOfBirth || !gender || !residence || !classId || !parentName || !parentPhone || !parentAddress) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: studentName, dateOfBirth, placeOfBirth, gender, residence, classId, parentName, parentPhone, parentAddress'
            });
            return;
        }

        const result = await bursarService.createStudentWithParent({
            student_name: studentName,
            date_of_birth: dateOfBirth,
            place_of_birth: placeOfBirth,
            gender: gender.toUpperCase() === 'MALE' ? Gender.Male : Gender.Female,
            residence,
            former_school: formerSchool,
            class_id: parseInt(classId),
            is_new_student: isNewStudent,
            academic_year_id: academicYearId ? parseInt(academicYearId) : undefined,
            parent_name: parentName,
            parent_phone: parentPhone,
            parent_whatsapp: parentWhatsapp,
            parent_email: parentEmail,
            parent_address: parentAddress,
            relationship: relationship
        });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully with parent account created',
            data: result
        });
    } catch (error: any) {
        console.error('Error creating student with parent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get available parents for selection/linking
 * GET /api/v1/bursar/available-parents
 */
export const getAvailableParents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, limit } = req.query;

        const parents = await bursarService.getAvailableParents(
            search as string,
            limit ? parseInt(limit as string) : 20
        );

        res.status(200).json({
            success: true,
            message: 'Available parents retrieved successfully',
            data: parents,
            count: parents.length
        });
    } catch (error: any) {
        console.error('Error fetching available parents:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Link existing parent to a student
 * POST /api/v1/bursar/link-existing-parent
 */
export const linkExistingParent = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            studentId,
            parentId,
            relationship
        } = req.body;

        // Validate required fields
        if (!studentId || !parentId) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: studentId, parentId'
            });
            return;
        }

        const result = await bursarService.linkExistingParent({
            student_id: parseInt(studentId),
            parent_id: parseInt(parentId),
            relationship: relationship
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error: any) {
        console.error('Error linking existing parent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get bursar dashboard with financial overview and statistics
 * GET /api/v1/bursar/dashboard
 */
export const getBursarDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academicYearId } = req.query;

        const dashboard = await bursarService.getBursarDashboard(
            academicYearId ? parseInt(academicYearId as string) : undefined
        );

        res.status(200).json({
            success: true,
            message: 'Bursar dashboard data retrieved successfully',
            data: dashboard
        });
    } catch (error: any) {
        console.error('Error fetching bursar dashboard:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get collection analytics for bursar (monthly trends, payment methods)
 * GET /api/v1/bursar/collection-analytics
 */
export const getCollectionAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academicYearId, startDate, endDate } = req.query;

        // This is a placeholder for future implementation
        // For now, return basic structure
        const analytics = {
            monthly_trends: [],
            payment_methods: [],
            collection_rate: 0,
            target_vs_actual: {
                target: 0,
                actual: 0,
                variance: 0
            }
        };

        res.status(200).json({
            success: true,
            message: 'Collection analytics retrieved successfully',
            data: analytics
        });
    } catch (error: any) {
        console.error('Error fetching collection analytics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get payment trends analysis
 * GET /api/v1/bursar/payment-trends
 */
export const getPaymentTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academicYearId, period } = req.query;

        // This is a placeholder for future implementation
        const trends = {
            daily_collections: [],
            weekly_summary: [],
            payment_methods_breakdown: [],
            peak_collection_days: []
        };

        res.status(200).json({
            success: true,
            message: 'Payment trends retrieved successfully',
            data: trends
        });
    } catch (error: any) {
        console.error('Error fetching payment trends:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get defaulters report (students with outstanding balances)
 * GET /api/v1/bursar/defaulters-report
 */
export const getDefaultersReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academicYearId, minimumAmount, classId } = req.query;

        // This is a placeholder for future implementation
        const defaulters = {
            total_defaulters: 0,
            total_outstanding: 0,
            by_class: [],
            by_amount_range: [],
            students: []
        };

        res.status(200).json({
            success: true,
            message: 'Defaulters report retrieved successfully',
            data: defaulters
        });
    } catch (error: any) {
        console.error('Error fetching defaulters report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 