// Fee comparison routes — Principal-level oversight of the BURSAR vs CONTROLLER ledgers
import { Router } from 'express';
import * as feeComparisonController from '../controllers/feeComparisonController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /fee-comparison/discrepancies - Get all fee discrepancies
// SUPER_MANAGER, MANAGER, PRINCIPAL can view fee discrepancies
router.get('/discrepancies', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), feeComparisonController.getFeeDiscrepancies);

// GET /fee-comparison/summary - Get comparison summary statistics
// SUPER_MANAGER, MANAGER, PRINCIPAL can view comparison summary
router.get('/summary', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), feeComparisonController.getComparisonSummary);

// GET /fee-comparison/student/:studentId - Get fee comparison for a specific student
// SUPER_MANAGER, MANAGER, PRINCIPAL can view student fee comparisons
router.get('/student/:studentId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), feeComparisonController.getStudentFeeComparison);

// GET /fee-comparison/students - Full roster of enrolled students with primary + control totals side-by-side
// SUPER_MANAGER, MANAGER, PRINCIPAL only
router.get('/students', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), feeComparisonController.getEnrolledStudentsFeeStatus);

// GET /fee-comparison/export - Export discrepancy reports
// SUPER_MANAGER, MANAGER, PRINCIPAL can export discrepancy reports
router.get('/export', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), feeComparisonController.exportDiscrepancyReports);

export default router;