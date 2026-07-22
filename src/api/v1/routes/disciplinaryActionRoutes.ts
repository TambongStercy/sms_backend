import { Router } from 'express';
import * as ctrl from '../controllers/disciplinaryActionController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

const DECIDERS = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DEAN_OF_DISCIPLINE'];
const VIEWERS = [...DECIDERS, 'DISCIPLINE_MASTER', 'SENIOR_DISCIPLINE_MASTER'];
const ADMIN_DELETE = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL'];

router.post('/', authenticate, authorize(DECIDERS), ctrl.createDisciplinaryAction);
router.get('/', authenticate, authorize(VIEWERS), ctrl.listDisciplinaryActions);
router.get('/:id', authenticate, authorize(VIEWERS), ctrl.getDisciplinaryActionById);
router.put('/:id', authenticate, authorize(DECIDERS), ctrl.updateDisciplinaryAction);
router.delete('/:id', authenticate, authorize(ADMIN_DELETE), ctrl.deleteDisciplinaryAction);

export default router;
