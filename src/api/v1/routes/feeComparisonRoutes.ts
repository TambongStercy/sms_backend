// Fee comparison routes for Super Admin only
import { Router } from 'express';
import * as feeComparisonController from '../controllers/feeComparisonController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /fee-comparison/discrepancies - Get all fee discrepancies
// Only SUPER_MANAGER can view fee discrepancies
router.get('/discrepancies', authenticate, authorize(['SUPER_MANAGER']), feeComparisonController.getFeeDiscrepancies);

// GET /fee-comparison/summary - Get comparison summary statistics
// Only SUPER_MANAGER can view comparison summary
router.get('/summary', authenticate, authorize(['SUPER_MANAGER']), feeComparisonController.getComparisonSummary);

// GET /fee-comparison/student/:studentId - Get fee comparison for a specific student
// Only SUPER_MANAGER can view student fee comparisons
router.get('/student/:studentId', authenticate, authorize(['SUPER_MANAGER']), feeComparisonController.getStudentFeeComparison);

// GET /fee-comparison/export - Export discrepancy reports
// Only SUPER_MANAGER can export discrepancy reports
router.get('/export', authenticate, authorize(['SUPER_MANAGER']), feeComparisonController.exportDiscrepancyReports);

export default router;