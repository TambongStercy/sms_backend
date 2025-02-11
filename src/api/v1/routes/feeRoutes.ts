import { Router } from 'express';
import * as feeController from '../controllers/feeController';

const router = Router();

// GET /fees - List fee records (optionally filter by student/year)
router.get('/', feeController.getAllFees);

// POST /fees - Create a fee record for a student
router.post('/', feeController.createFee);

// POST /fees/:id/payments - Record a payment transaction
router.post('/:id/payments', feeController.recordPayment);

// GET /fees/reports - Export fee data (Excel/Word)
router.get('/reports', feeController.exportFeeReports);

export default router;
