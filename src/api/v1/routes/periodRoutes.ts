// src/api/v1/routes/periodRoutes.ts
import { Router } from 'express';
import * as periodController from '../controllers/periodController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ---------- Period Sets (bell schedules) ----------
// Mounted first so /period-sets/:id doesn't collide with /:id below.

router.get('/period-sets', authenticate, periodController.listPeriodSets);

router.post('/period-sets',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.createPeriodSet
);

router.get('/period-sets/:id', authenticate, periodController.getPeriodSetById);

router.put('/period-sets/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.updatePeriodSet
);

router.delete('/period-sets/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.deletePeriodSet
);

// ---------- Individual periods ----------

// GET /periods - accepts ?periodSetId= | ?subClassId= | ?classId= to scope
router.get('/', authenticate, periodController.getAllPeriods);

router.post('/',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.createPeriod
);

router.get('/:id', authenticate, periodController.getPeriodById);

router.put('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.updatePeriod
);

router.delete('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'DEAN_OF_STUDIES']),
    periodController.deletePeriod
);

export default router;
