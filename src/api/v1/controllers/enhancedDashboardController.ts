// Enhanced Dashboard Controller for Advanced Role-Specific Features
import { Request, Response } from 'express';
import * as enhancedDashboardService from '../services/enhancedDashboardService';

/**
 * GET /api/v1/dashboard/super-manager/enhanced
 * Enhanced Super Manager Dashboard with comprehensive analytics
 */
export const getEnhancedSuperManagerDashboard = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedSuperManagerDashboard(academicYearId);

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching enhanced Super Manager dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enhanced dashboard data'
        });
    }
};

/**
 * GET /api/v1/dashboard/bursar/enhanced
 * Enhanced Bursar Dashboard with student registration and payment analytics
 */
export const getEnhancedBursarDashboard = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedBursarDashboard(academicYearId);

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching enhanced Bursar dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enhanced Bursar dashboard data'
        });
    }
};

/**
 * GET /api/v1/dashboard/vp/enhanced
 * Enhanced VP Dashboard with interview management and student assignment
 */
export const getEnhancedVPDashboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedVPDashboard(userId, academicYearId);

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching enhanced VP dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enhanced VP dashboard data'
        });
    }
};

/**
 * GET /api/v1/dashboard/teacher-analytics
 * Teacher Analytics for Super Manager and Managers
 */
export const getTeacherAnalytics = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        // This would be part of the enhanced dashboard, extracting teacher analytics specifically
        const dashboardData = await enhancedDashboardService.getEnhancedSuperManagerDashboard(academicYearId);

        res.json({
            success: true,
            data: {
                teacherAnalytics: dashboardData.teacherAnalytics,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching teacher analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch teacher analytics data'
        });
    }
};

/**
 * GET /api/v1/dashboard/class-profiles
 * Class Profiles for Super Manager oversight
 */
export const getClassProfiles = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedSuperManagerDashboard(academicYearId);

        res.json({
            success: true,
            data: {
                classProfiles: dashboardData.systemStatistics.classUtilization,
                averageUtilization: dashboardData.systemStatistics.averageClassUtilization,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching class profiles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch class profiles data'
        });
    }
};

/**
 * GET /api/v1/dashboard/reports-analytics
 * Reports Analytics for deadline management and tracking
 */
export const getReportsAnalytics = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedSuperManagerDashboard(academicYearId);

        res.json({
            success: true,
            data: {
                reportAnalytics: dashboardData.reportAnalytics,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching reports analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports analytics data'
        });
    }
};

/**
 * GET /api/v1/dashboard/audit-trail
 * System Audit Trail for tracking modifications
 */
export const getAuditTrail = async (req: Request, res: Response) => {
    try {
        const dashboardData = await enhancedDashboardService.getEnhancedSuperManagerDashboard();

        res.json({
            success: true,
            data: {
                auditTrail: dashboardData.auditTrail,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching audit trail:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit trail data'
        });
    }
};

/**
 * GET /api/v1/dashboard/financial-overview
 * Financial Overview for Super Manager and Bursar
 */
export const getFinancialOverview = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const [superManagerData, bursarData] = await Promise.all([
            enhancedDashboardService.getEnhancedSuperManagerDashboard(academicYearId),
            enhancedDashboardService.getEnhancedBursarDashboard(academicYearId)
        ]);

        res.json({
            success: true,
            data: {
                schoolOverview: superManagerData.schoolOverview.finance,
                detailedFinancials: bursarData.financialOverview,
                paymentAnalytics: bursarData.paymentAnalytics,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching financial overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch financial overview data'
        });
    }
};

/**
 * GET /api/v1/dashboard/student-registration
 * Student Registration Analytics for Bursar
 */
export const getStudentRegistrationAnalytics = async (req: Request, res: Response) => {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedBursarDashboard(academicYearId);

        res.json({
            success: true,
            data: {
                studentRegistration: dashboardData.studentRegistration,
                parentManagement: dashboardData.parentManagement,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching student registration analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch student registration analytics'
        });
    }
};

/**
 * GET /api/v1/dashboard/interview-management
 * Interview Management for VP
 */
export const getInterviewManagement = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboardData = await enhancedDashboardService.getEnhancedVPDashboard(userId, academicYearId);

        res.json({
            success: true,
            data: {
                studentManagement: dashboardData.studentManagement,
                interviewStats: dashboardData.interviewStats,
                lastUpdated: dashboardData.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching interview management data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch interview management data'
        });
    }
}; 