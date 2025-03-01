import { Router } from 'express';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /discipline - Get all discipline issues (with pagination and filtering)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER can view all issues
router.get('/discipline', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']), disciplineController.getAllDisciplineIssues);

// POST /attendance/students - Record student absence/lateness
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record student attendance
router.post('/attendance/students', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordStudentAttendance);

// POST /attendance/teachers - Record teacher absence
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can record teacher attendance
router.post('/attendance/teachers', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), disciplineController.recordTeacherAttendance);

// POST /discipline - Record a discipline issue
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record discipline issues
router.post('/discipline', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordDisciplineIssue);

// GET /discipline/:studentId - Get discipline history for a student
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can view discipline history
router.get('/discipline/:studentId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.getDisciplineHistory);

export default router;
