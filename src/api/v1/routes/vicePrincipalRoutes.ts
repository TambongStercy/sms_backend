import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
    getVPDashboard,
    getStudentManagement,
    getInterviewData,
    getSubclassOptimizationData,
    getStudentProgress,
    scheduleBulkInterviews,
    getEnrollmentAnalyticsData,
    getStudentsRequiringAttention,
    getClassCapacityAnalysis,
    getQuickStats
} from '../controllers/vicePrincipalController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply Vice Principal authorization to all routes
router.use(authorize(['VICE_PRINCIPAL']));

/**
 * @route GET /api/v1/vice-principal/dashboard
 * @desc Get comprehensive Vice Principal dashboard
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/dashboard', getVPDashboard);

/**
 * @route GET /api/v1/vice-principal/student-management
 * @desc Get detailed student management overview with analytics
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/student-management', getStudentManagement);

/**
 * @route GET /api/v1/vice-principal/interviews
 * @desc Get interview management data with tracking
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number, status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'
 */
router.get('/interviews', getInterviewData);

/**
 * @route GET /api/v1/vice-principal/subclass-optimization
 * @desc Get subclass optimization recommendations and capacity analysis
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/subclass-optimization', getSubclassOptimizationData);

/**
 * @route GET /api/v1/vice-principal/student-progress/:studentId
 * @desc Get detailed student progress tracking for enrollment journey
 * @access Private (VICE_PRINCIPAL only)
 * @params studentId: number
 * @query academicYearId?: number
 */
router.get('/student-progress/:studentId', getStudentProgress);

/**
 * @route POST /api/v1/vice-principal/bulk-schedule-interviews
 * @desc Bulk schedule interviews for multiple students
 * @access Private (VICE_PRINCIPAL only)
 * @body { studentIds: number[], scheduledDate: string, academicYearId?: number }
 */
router.post('/bulk-schedule-interviews', scheduleBulkInterviews);

/**
 * @route GET /api/v1/vice-principal/enrollment-analytics
 * @desc Get enrollment analytics and trends
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/enrollment-analytics', getEnrollmentAnalyticsData);

/**
 * @route GET /api/v1/vice-principal/students-requiring-attention
 * @desc Get students requiring immediate attention (pending interviews, overdue assignments)
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/students-requiring-attention', getStudentsRequiringAttention);

/**
 * @route GET /api/v1/vice-principal/class-capacity-analysis
 * @desc Get detailed class capacity analysis
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/class-capacity-analysis', getClassCapacityAnalysis);

/**
 * @route GET /api/v1/vice-principal/quick-stats
 * @desc Get quick statistics for Vice Principal overview
 * @access Private (VICE_PRINCIPAL only)
 * @query academicYearId?: number
 */
router.get('/quick-stats', getQuickStats);

export default router; 