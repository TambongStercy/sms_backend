// Unified payment route — primary fee side only (BURSAR).
// Control-side payments live at POST /control-fees/payments and are CONTROLLER-only
// to preserve the four-eyes audit.
import { Router } from 'express';
import * as unifiedPaymentController from '../controllers/unifiedPaymentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// POST /payments/primary - Record payment for primary fees (creates fee if doesn't exist)
router.post('/primary', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR']), unifiedPaymentController.recordPrimaryPaymentWithFee);

export default router;
