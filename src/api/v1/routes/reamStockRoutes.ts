// src/api/v1/routes/reamStockRoutes.ts
//
// Central ream (paper) stock ledger.
// GET   /reams/stock      — read totals (Manager, Super Manager, Principal, Bursar, Secretary)
// GET   /reams/ledger     — read history (same as above)
// POST  /reams/receipts   — record stock in (Bursar / Manager / Super Manager)
// POST  /reams/issuances  — issue reams to a person with reason (Bursar / Secretary)

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as reamStockController from '../controllers/reamStockController';

const router = express.Router();
router.use(authenticate);

const READ_ROLES = ['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL', 'BURSAR', 'SECRETARY'];

router.get('/stock', authorize(READ_ROLES), reamStockController.getStockSummary);
router.get('/ledger', authorize(READ_ROLES), reamStockController.listLedger);
router.post(
    '/receipts',
    authorize(['MANAGER', 'SUPER_MANAGER', 'BURSAR']),
    reamStockController.addReceipt
);
router.post(
    '/issuances',
    authorize(['BURSAR', 'SECRETARY']),
    reamStockController.issueReams
);

export default router;
