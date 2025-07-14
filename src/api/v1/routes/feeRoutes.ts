// Swagger documentation can be found in src/config/swagger/docs/feeDocs.ts
import { Router } from 'express';
import * as feeController from '../controllers/feeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /fees - List all fees (with filters)
// All authenticated users can view fees list
router.get('/', authenticate, feeController.getAllFees);

// GET /fees/export - Export fee data (Excel/Word) - Moved before /:id
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can export fee reports
router.get('/export', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), feeController.exportFeeReports);

// GET /fees/:id - Get a specific fee by ID
router.get('/:id', authenticate, feeController.getFeeById);

// POST /fees - Create a fee record for a student
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can create fee records
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), feeController.createFee);

// PUT /fees/:id - Update a fee record
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can update fee records
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), feeController.updateFee);

// DELETE /fees/:id - Delete a fee record
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can delete fee records
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), feeController.deleteFee);

// GET /fees/student/:studentId - Get all fees for a specific student
router.get('/student/:studentId', authenticate, feeController.getStudentFees);

// GET /fees/sub_class/:sub_classId/summary - Get fee summary for a sub_class
router.get('/sub_class/:id/summary', authenticate, feeController.getSubclassFeesSummary);

// GET /fees/subclass/:id/summary - Alias for subclass fees summary (for backward compatibility)
router.get('/subclass/:id/summary', authenticate, feeController.getSubclassFeesSummary);

// GET /fees/:feeId/payments - List all payments for a fee
router.get('/:feeId/payments', authenticate, feeController.getFeePayments);

// POST /fees/:feeId/payments - Record a payment for a specific fee
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can record payments
router.post('/:feeId/payments', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), feeController.recordPayment);

export default router;
