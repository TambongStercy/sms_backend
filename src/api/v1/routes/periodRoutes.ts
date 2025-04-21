// src/api/v1/routes/periodRoutes.ts
import { Router } from 'express';
import * as periodController from '../controllers/periodController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /periods - List all periods
router.get('/', authenticate, periodController.getAllPeriods);

// POST /periods - Create a new period
router.post('/',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL']),
    periodController.createPeriod
);

// GET /periods/:id - Get a specific period
router.get('/:id', authenticate, periodController.getPeriodById);

// PUT /periods/:id - Update a period
router.put('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL']),
    periodController.updatePeriod
);

// DELETE /periods/:id - Delete a period
router.delete('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL']),
    periodController.deletePeriod
);

export default router; 