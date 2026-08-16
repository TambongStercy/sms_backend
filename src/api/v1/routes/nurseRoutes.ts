import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as nurseController from '../controllers/nurseController';

const router = Router();

// Anyone in this list can see health profiles + visit logs.
const HEALTH_VIEW_ROLES = [
    'SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL',
    'DEAN_OF_DISCIPLINE', 'DISCIPLINE_MASTER', 'SENIOR_DISCIPLINE_MASTER',
    'NURSE',
];
// Only the nurse (and admins above her) can log/edit/delete visits.
const NURSE_AND_ADMIN = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'NURSE'];
const NURSE_DELETE = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL'];

// Student health profile (aggregate: demographics + conditions + notes + recent visits)
router.get(
    '/students/:studentId/health-profile',
    authenticate,
    authorize(HEALTH_VIEW_ROLES),
    nurseController.getStudentHealthProfile,
);

// Nurse-visit CRUD
router.post('/visits', authenticate, authorize(NURSE_AND_ADMIN), nurseController.createNurseVisit);
router.get('/visits', authenticate, authorize(HEALTH_VIEW_ROLES), nurseController.listNurseVisits);
router.get('/visits/:id', authenticate, authorize(HEALTH_VIEW_ROLES), nurseController.getNurseVisitById);
router.put('/visits/:id', authenticate, authorize(NURSE_AND_ADMIN), nurseController.updateNurseVisit);
router.delete('/visits/:id', authenticate, authorize(NURSE_DELETE), nurseController.deleteNurseVisit);

export default router;
