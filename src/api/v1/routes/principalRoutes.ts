import express from 'express';
import * as principalController from '../controllers/principalController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as examController from '../controllers/examController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply PRINCIPAL authorization to all routes
router.use(authorize(['PRINCIPAL', 'SUPER_MANAGER']));

/**
 * @route GET /api/v1/principal/dashboard
 * @desc Get comprehensive Principal dashboard with all school data
 * @access PRINCIPAL only
 */
router.get('/dashboard', principalController.getPrincipalDashboard);

/**
 * @route GET /api/v1/principal/analytics/school
 * @desc Get comprehensive school analytics and key metrics
 * @access PRINCIPAL only
 */
router.get('/analytics/school', principalController.getSchoolAnalytics);

/**
 * @route GET /api/v1/principal/analytics/performance
 * @desc Get detailed academic and teacher performance metrics
 * @access PRINCIPAL only
 */
router.get('/analytics/performance', principalController.getPerformanceMetrics);

/**
 * @route GET /api/v1/principal/analytics/financial
 * @desc Get financial overview and collection analytics
 * @access PRINCIPAL only
 */
router.get('/analytics/financial', principalController.getFinancialOverview);

/**
 * @route GET /api/v1/principal/analytics/discipline
 * @desc Get discipline overview and behavioral analytics
 * @access PRINCIPAL only
 */
router.get('/analytics/discipline', principalController.getDisciplineOverview);

/**
 * @route GET /api/v1/principal/analytics/staff
 * @desc Get staff overview and utilization metrics
 * @access PRINCIPAL only
 */
router.get('/analytics/staff', principalController.getStaffOverview);

/**
 * @route GET /api/v1/principal/reports/academic-performance
 * @desc Generate detailed academic performance report with filtering
 * @access PRINCIPAL only
 * @query academicYearId, classId, subjectId
 */
router.get('/reports/academic-performance', principalController.getAcademicPerformanceReport);

/**
 * @route GET /api/v1/principal/reports/attendance-analysis
 * @desc Generate attendance analysis report with date filtering
 * @access PRINCIPAL only
 * @query academicYearId, startDate, endDate, classId
 */
router.get('/reports/attendance-analysis', principalController.getAttendanceAnalysis);

/**
 * @route GET /api/v1/principal/reports/teacher-performance
 * @desc Generate teacher performance analysis with thresholds
 * @access PRINCIPAL only
 * @query academicYearId, departmentId, performanceThreshold
 */
router.get('/reports/teacher-performance', principalController.getTeacherPerformanceAnalysis);

/**
 * @route GET /api/v1/principal/reports/financial-performance
 * @desc Generate enhanced financial performance analysis
 * @access PRINCIPAL only
 * @query academicYearId
 */
router.get('/reports/financial-performance', principalController.getFinancialPerformanceAnalysis);

/**
 * @route GET /api/v1/principal/overview/summary
 * @desc Get quick school overview summary with key insights and alerts
 * @access PRINCIPAL only
 * @query academicYearId
 */
router.get('/overview/summary', principalController.getSchoolOverviewSummary);

/**
 * @route GET /api/v1/principal/report-cards/student/:studentId/availability
 * @desc Check if a student's report card is available
 * @access PRINCIPAL only
 */
router.get('/report-cards/student/:studentId/availability', examController.checkStudentReportCardAvailability);

/**
 * @route GET /api/v1/principal/report-cards/subclass/:subClassId/availability
 * @desc Check if a subclass's report cards are available
 * @access PRINCIPAL only
 */
router.get('/report-cards/subclass/:subClassId/availability', examController.checkSubclassReportCardAvailability);

export default router; 