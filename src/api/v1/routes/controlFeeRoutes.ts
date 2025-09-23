// Swagger documentation can be found in src/config/swagger/docs/controlFeeDocs.ts
import { Router } from 'express';
import * as controlFeeController from '../controllers/controlFeeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /control-fees - List all control fees (with filters)
// All authenticated users can view control fees list
router.get('/', authenticate, controlFeeController.getAllControlFees);

// GET /control-fees/export - Export control fee data (Excel/Word) - Moved before /:id
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can export control fee reports
router.get('/export', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), controlFeeController.exportControlFeeReports);

// GET /control-fees/:id - Get a specific control fee by ID
router.get('/:id', authenticate, controlFeeController.getControlFeeById);

// POST /control-fees - Create a control fee record for a student
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can create control fee records
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), controlFeeController.createControlFee);

// PUT /control-fees/:id - Update a control fee record
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can update control fee records
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), controlFeeController.updateControlFee);

// DELETE /control-fees/:id - Delete a control fee record
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can delete control fee records
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), controlFeeController.deleteControlFee);

// GET /control-fees/student/:studentId - Get all control fees for a specific student
router.get('/student/:studentId', authenticate, controlFeeController.getStudentControlFees);

// GET /control-fees/sub_class/:sub_classId/summary - Get control fee summary for a sub_class
router.get('/sub_class/:id/summary', authenticate, controlFeeController.getSubclassControlFeesSummary);

// GET /control-fees/subclass/:id/summary - Alias for subclass control fees summary (for backward compatibility)
router.get('/subclass/:id/summary', authenticate, controlFeeController.getSubclassControlFeesSummary);

// GET /control-fees/:controlFeeId/payments - List all payments for a control fee
router.get('/:controlFeeId/payments', authenticate, controlFeeController.getControlFeePayments);

// POST /control-fees/:controlFeeId/payments - Record a payment for a specific control fee
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can record control payments
router.post('/:controlFeeId/payments', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), controlFeeController.recordControlPayment);

export default router;