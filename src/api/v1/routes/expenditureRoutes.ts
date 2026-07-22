import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { receiptUpload } from '../../../utils/fileUpload';
import * as ctrl from '../controllers/expenditureController';

const router = Router();

const CREATE_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'BURSAR'];
const VIEW_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY', 'FEE_AUDITOR'];
const DELETE_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL'];

// Static path routes BEFORE /:id to avoid param capture
router.get('/summary', authenticate, authorize(VIEW_ROLES), ctrl.getMonthlySummary);
router.get('/export', authenticate, authorize(VIEW_ROLES), ctrl.exportExpenditures);

router.post('/', authenticate, authorize(CREATE_ROLES), receiptUpload.single('receipt'), ctrl.createExpenditure);
router.get('/', authenticate, authorize(VIEW_ROLES), ctrl.listExpenditures);
router.get('/:id', authenticate, authorize(VIEW_ROLES), ctrl.getExpenditureById);
router.put('/:id', authenticate, authorize(CREATE_ROLES), receiptUpload.single('receipt'), ctrl.updateExpenditure);
router.delete('/:id', authenticate, authorize(DELETE_ROLES), ctrl.deleteExpenditure);

export default router;
