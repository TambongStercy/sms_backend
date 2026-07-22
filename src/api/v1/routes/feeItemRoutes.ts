import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/feeItemController';

const router = Router();

const BURSAR_AND_ABOVE = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR'];
const VIEW_FEE_ITEMS = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY', 'FEE_AUDITOR'];

// CRUD on fee items
router.post('/', authenticate, authorize(BURSAR_AND_ABOVE), ctrl.createFeeItem);
router.get('/', authenticate, authorize(VIEW_FEE_ITEMS), ctrl.listFeeItems);
router.put('/:id', authenticate, authorize(BURSAR_AND_ABOVE), ctrl.updateFeeItem);
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), ctrl.deleteFeeItem);

// Payments
router.post('/:id/payments', authenticate, authorize(BURSAR_AND_ABOVE), ctrl.recordFeeItemPayment);
router.get('/:id/payments', authenticate, authorize(VIEW_FEE_ITEMS), ctrl.getFeeItemPayments);

// Applicable items + balances per enrollment
router.get('/enrollment/:enrollmentId', authenticate, authorize(VIEW_FEE_ITEMS), ctrl.getFeeItemsForEnrollment);

export default router;
