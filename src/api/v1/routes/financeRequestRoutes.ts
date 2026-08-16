import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/financeRequestController';

const router = Router();

// PARENT is included because they can create PAYMENT_CLAIM (submit proof of payment).
// Per-type creator role checks are enforced inside the service (assertCreatorRole).
const CREATE_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR', 'PARENT'];
// View roles include everyone who needs visibility into finance ops:
// - admins (SUPER_MANAGER, MANAGER, PRINCIPAL), finance (BURSAR, FEE_AUDITOR), office (SECRETARY).
// - Anyone else (recipient of a disbursement / parent who filed a claim) can still see their own via /me filter.
const VIEW_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY', 'FEE_AUDITOR', 'PARENT'];
// Action routes use a permissive list and rely on per-type checks inside the service.
// SUPER_MANAGER approves REFUNDs; BURSAR+ approves PAYMENT_CLAIMs; recipients confirm PERSONNEL_DISBURSEMENT.
const ACTION_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY', 'FEE_AUDITOR'];

router.post('/', authenticate, authorize(CREATE_ROLES), ctrl.createFinanceRequest);
router.get('/', authenticate, authorize(VIEW_ROLES), ctrl.listFinanceRequests);
router.get('/:id', authenticate, authorize(VIEW_ROLES), ctrl.getFinanceRequestById);

// Transitions — per-type authorization enforced in the service:
// - FEE_REDUCTION approve/reject: PRINCIPAL+ only
// - PERSONNEL_DISBURSEMENT complete/reject: the recipient (matched by user_id) or PRINCIPAL+
// - BANK_VERIFICATION complete/reject: any role on the view list
router.post('/:id/approve', authenticate, authorize(ACTION_ROLES), ctrl.approveFinanceRequest);
router.post('/:id/reject', authenticate, ctrl.rejectFinanceRequest);    // no authorize() — recipients aren't necessarily admins
router.post('/:id/complete', authenticate, ctrl.completeFinanceRequest); // same reason — recipient may be any role

export default router;
