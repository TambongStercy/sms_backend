import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as classProfileAnalyticsController from '../controllers/classProfileAnalyticsController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all classes overview (admin only)
router.get('/overview',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getAllClassesOverview
);

// Get class rankings (admin only)
router.get('/rankings',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getClassRankings
);

// Get comprehensive class profile analytics (admin only)
router.get('/class/:classId',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getClassProfileAnalytics
);

// Get class dashboard summary (admin only)
router.get('/class/:classId/summary',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getClassDashboardSummary
);

// Get class performance insights (admin only)
router.get('/class/:classId/insights',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getClassInsights
);

// Get class performance trends (admin only)
router.get('/class/:classId/trends',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.getClassTrends
);

// Compare two classes (admin only)
router.get('/compare/:class1Id/:class2Id',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.compareClasses
);

// Export class analytics report (admin only)
router.get('/class/:classId/export',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classProfileAnalyticsController.exportClassReport
);

export default router; 