// Unified payment routes that auto-create fees if needed
import { Router } from 'express';
import * as unifiedPaymentController from '../controllers/unifiedPaymentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// POST /payments/primary - Record payment for primary fees (creates fee if doesn't exist)
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can record payments
router.post('/primary', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), unifiedPaymentController.recordPrimaryPaymentWithFee);

// POST /payments/control - Record payment for control fees (creates fee if doesn't exist)
// Only SUPER_MANAGER, PRINCIPAL, BURSAR can record control payments
router.post('/control', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), unifiedPaymentController.recordControlPaymentWithFee);

export default router;