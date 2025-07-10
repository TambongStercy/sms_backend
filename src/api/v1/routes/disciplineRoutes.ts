// Swagger documentation can be found in src/config/swagger/docs/disciplineDocs.ts
import { Router } from 'express';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /discipline - List all discipline records (with filters)
// All authenticated users can view discipline records list
router.get('/', authenticate, disciplineController.getAllDisciplineIssues);

// GET /discipline/:studentId - Get discipline records for a specific student
router.get('/:studentId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.getDisciplineHistory);

// POST /discipline - Record a discipline issue
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record discipline issues
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordDisciplineIssue);

// === SDM LATENESS TRACKING ROUTES ===

// POST /discipline/lateness - Record morning lateness for a single student
// Primarily for DISCIPLINE_MASTER (SDM) but also accessible by admin roles
router.post('/lateness',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']),
    disciplineController.recordMorningLateness
);

// POST /discipline/lateness/bulk - Record bulk morning lateness for multiple students
// Primarily for DISCIPLINE_MASTER (SDM) daily use
router.post('/lateness/bulk',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']),
    disciplineController.recordBulkMorningLateness
);

// GET /discipline/lateness/statistics - Get lateness statistics for SDM dashboard
// For DISCIPLINE_MASTER dashboard and admin monitoring
router.get('/lateness/statistics',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']),
    disciplineController.getLatenessStatistics
);

// GET /discipline/lateness/daily-report - Get daily lateness report
// For DISCIPLINE_MASTER and admin oversight
router.get('/lateness/daily-report',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']),
    disciplineController.getDailyLatenessReport
);

export default router;
