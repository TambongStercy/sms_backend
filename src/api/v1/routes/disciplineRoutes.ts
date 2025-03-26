// Swagger documentation can be found in src/config/swagger/docs/disciplineDocs.ts
import { Router } from 'express';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /discipline - List all discipline records (with filters)
// All authenticated users can view discipline records list
router.get('/', authenticate, disciplineController.getAllDisciplineIssues);

// GET /discipline/:studentId - Get discipline records for a specific student
router.get('/:studentId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.getDisciplineHistory);

// POST /discipline - Record a discipline issue
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record discipline issues
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordDisciplineIssue);

export default router;
