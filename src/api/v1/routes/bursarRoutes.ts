import { Router } from 'express';
import * as bursarController from '../controllers/bursarController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// POST /bursar/create-parent-with-student - Create student with automatic parent account creation
// This is the main Bursar function for student registration with parent creation
// Only BURSAR and SUPER_MANAGER can create students with parent accounts
router.post('/create-parent-with-student',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER']),
    bursarController.createStudentWithParent
);

// GET /bursar/available-parents - Get available parents for selection/linking
// BURSAR and SUPER_MANAGER can browse/search existing parents
router.get('/available-parents',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER']),
    bursarController.getAvailableParents
);

// POST /bursar/link-existing-parent - Link existing parent to a student
// BURSAR and SUPER_MANAGER can link existing parents to students
router.post('/link-existing-parent',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER']),
    bursarController.linkExistingParent
);

// GET /bursar/dashboard - Get bursar dashboard with financial overview
// BURSAR and management roles can view dashboard
router.get('/dashboard',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER', 'PRINCIPAL', 'MANAGER']),
    bursarController.getBursarDashboard
);

// GET /bursar/collection-analytics - Get collection analytics (monthly trends, payment methods)
// BURSAR and management roles can view collection analytics
router.get('/collection-analytics',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER', 'PRINCIPAL', 'MANAGER']),
    bursarController.getCollectionAnalytics
);

// GET /bursar/payment-trends - Get payment trends analysis
// BURSAR and management roles can view payment trends
router.get('/payment-trends',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER', 'PRINCIPAL', 'MANAGER']),
    bursarController.getPaymentTrends
);

// GET /bursar/defaulters-report - Get defaulters report (students with outstanding balances)
// BURSAR and management roles can view defaulters report
router.get('/defaulters-report',
    authenticate,
    authorize(['BURSAR', 'SUPER_MANAGER', 'PRINCIPAL', 'MANAGER']),
    bursarController.getDefaultersReport
);

export default router; 