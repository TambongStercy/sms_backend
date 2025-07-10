import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as teacherAttendanceAnalyticsController from '../controllers/teacherAttendanceAnalyticsController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get teacher attendance overview (admin only)
router.get('/overview',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getTeacherAttendanceOverview
);

// Get detailed teacher attendance analytics (admin only)
router.get('/details',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getTeacherAttendanceDetails
);

// Get attendance trends (admin only)
router.get('/trends',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getAttendanceTrends
);

// Get teacher attendance alerts (admin only)
router.get('/alerts',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getTeacherAttendanceAlerts
);

// Get department attendance summary (admin only)
router.get('/departments',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getDepartmentAttendanceSummary
);

// Get individual teacher attendance analytics (admin only)
router.get('/teacher/:teacherId',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getTeacherAttendanceAnalytics
);

// Get attendance comparison between periods (admin only)
router.get('/comparison',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.getAttendanceComparison
);

// Export attendance report (admin only)
router.get('/export',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    teacherAttendanceAnalyticsController.exportAttendanceReport
);

// Record teacher attendance (admin and discipline master)
router.post('/record',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']),
    teacherAttendanceAnalyticsController.recordTeacherAttendance
);

export default router; 