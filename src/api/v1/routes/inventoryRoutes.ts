import { Router } from 'express';
import * as ctrl from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Anyone authenticated who is not a parent can read the catalog and their own
// inventory / ledger / transfers. Parents are gated at the service layer for
// mutations, but they simply have no holdings to read.

const MANAGER = ['SUPER_MANAGER', 'MANAGER'];

// ---------- Catalog ----------
router.get('/items', ctrl.listItems);
router.post('/items', authorize(MANAGER), ctrl.createItem);
router.patch('/items/:id', authorize(MANAGER), ctrl.updateItem);
router.delete('/items/:id', authorize(MANAGER), ctrl.deactivateItem);

// ---------- Manager stock ops ----------
router.post('/holdings/grant', authorize(MANAGER), ctrl.grantStock);
router.post('/holdings/adjust', authorize(MANAGER), ctrl.adjustStock);
// Managers can query any user with ?user_id=; anyone else is restricted to themselves.
router.get('/holdings', ctrl.listHoldings);

// ---------- Personal ----------
router.get('/me', ctrl.myHoldings);
router.get('/me/ledger', ctrl.myLedger);
router.get('/me/transfers', ctrl.myTransfers);

// ---------- Transfers ----------
router.post('/transfers', ctrl.initiateTransfer);
router.get('/transfers/:id', ctrl.getTransfer);
router.post('/transfers/:id/accept', ctrl.acceptTransfer);
router.post('/transfers/:id/reject', ctrl.rejectTransfer);
router.post('/transfers/:id/cancel', ctrl.cancelTransfer);

export default router;
