import express from 'express';
import * as studentAverageController from '../controllers/studentAverageController';
import { authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
    '/calculate/:examSequenceId',
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL, Role.TEACHER]),
    studentAverageController.calculateStudentAverages
);

router.get(
    '/sequence/:examSequenceId',
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL, Role.TEACHER, Role.PARENT]),
    studentAverageController.getSequenceAverages
);

router.get(
    '/:enrollmentId/:examSequenceId',
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL, Role.TEACHER, Role.PARENT]),
    studentAverageController.getStudentAverage
);

router.patch(
    '/:id/decision',
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL]),
    studentAverageController.updateDecision,
);

export default router;