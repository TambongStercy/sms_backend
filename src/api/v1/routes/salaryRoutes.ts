// src/api/v1/routes/salaryRoutes.ts
//
// Mounted at /api/v1/salary. Manager proposes; Super Manager validates.
// Fine-grained role checks live in the service (via caller.roles).

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as salaryController from '../controllers/salaryController';

const router = express.Router();
router.use(authenticate);

// --- Bursar cash summary + injections ---
// Only manager-tier roles may view the summary; both can add cash.
router.get(
    '/bursar-cash/summary',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.getBursarCashSummary
);
router.get(
    '/bursar-cash/injections',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listCashInjections
);
router.post(
    '/bursar-cash/injections',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createCashInjection
);

// --- Salary profiles ---
router.get(
    '/profiles',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listProfiles
);
router.post(
    '/profiles',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createProfile
);
router.get(
    '/profiles/:id',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.getProfile
);
router.post(
    '/profiles/:id/approve',
    authorize(['SUPER_MANAGER']),
    salaryController.approveProfile
);
router.post(
    '/profiles/:id/reject',
    authorize(['SUPER_MANAGER']),
    salaryController.rejectProfile
);
router.patch(
    '/profiles/:id/status',
    authorize(['SUPER_MANAGER']),
    salaryController.setProfileStatus
);

// --- Change requests ---
router.get(
    '/change-requests',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listChangeRequests
);
router.post(
    '/change-requests',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createChangeRequest
);
router.post(
    '/change-requests/:id/approve',
    authorize(['SUPER_MANAGER']),
    salaryController.approveChangeRequest
);
router.post(
    '/change-requests/:id/reject',
    authorize(['SUPER_MANAGER']),
    salaryController.rejectChangeRequest
);

// --- Allowances / Bonuses ---
router.get(
    '/allowances',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listAllowances
);
router.post(
    '/allowances',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createAllowance
);
router.post(
    '/allowances/:id/approve',
    authorize(['SUPER_MANAGER']),
    salaryController.approveAllowance
);
router.post(
    '/allowances/:id/reject',
    authorize(['SUPER_MANAGER']),
    salaryController.rejectAllowance
);

// --- Pay periods ---
router.get(
    '/pay-periods',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listPayPeriods
);
router.post(
    '/pay-periods',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createPayPeriod
);
router.get(
    '/pay-periods/:id',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.getPayPeriod
);
router.patch(
    '/pay-periods/:id/weeks',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.updatePayPeriodWeeks
);
router.post(
    '/pay-periods/:id/generate',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.generatePayPeriodPayments
);
router.post(
    '/pay-periods/:id/lock',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.lockPayPeriod
);
router.post(
    '/pay-periods/:id/mark-paid',
    authorize(['SUPER_MANAGER']),
    salaryController.markPayPeriodPaid
);
router.get(
    '/pay-periods/:id/payments',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listPayPeriodPayments
);

// --- Salary payments ---
router.get(
    '/payments/:id',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.getSalaryPayment
);

// --- Withholdings ---
router.get(
    '/withholdings',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    salaryController.listWithholdings
);
router.post(
    '/withholdings',
    authorize(['MANAGER', 'SUPER_MANAGER']),
    salaryController.createWithholding
);
router.post(
    '/withholdings/:id/approve',
    authorize(['SUPER_MANAGER']),
    salaryController.approveWithholding
);
router.post(
    '/withholdings/:id/reject',
    authorize(['SUPER_MANAGER']),
    salaryController.rejectWithholding
);

export default router;
