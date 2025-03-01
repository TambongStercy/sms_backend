import { Router } from 'express';
import * as feeController from '../controllers/feeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /fees - List fee records (optionally filter by student/year)
// ADMIN, PRINCIPAL, BURSAR can view all fees
// TEACHER can view fees for their students
// PARENT can view fees for their children
// STUDENT can view their own fees
router.get('/', authenticate, feeController.getAllFees);

// POST /fees - Create a fee record for a student
// Only ADMIN, PRINCIPAL, BURSAR can create fee records
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'BURSAR']), feeController.createFee);

// POST /fees/:id/payments - Record a payment transaction
// Only ADMIN, PRINCIPAL, BURSAR can record payments
router.post('/:id/payments', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'BURSAR']), feeController.recordPayment);

// GET /fees/reports - Export fee data (Excel/Word)
// Only ADMIN, PRINCIPAL, BURSAR can export fee reports
router.get('/reports', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'BURSAR']), feeController.exportFeeReports);

export default router;
