import { Router } from 'express';
import * as disciplineController from '../controllers/disciplineController';

const router = Router();

// POST /attendance/students - Record student absence/lateness
router.post('/attendance/students', disciplineController.recordStudentAttendance);

// POST /attendance/teachers - Record teacher absence
router.post('/attendance/teachers', disciplineController.recordTeacherAttendance);

// POST /discipline - Record a discipline issue
router.post('/discipline', disciplineController.recordDisciplineIssue);

// GET /discipline/:studentId - Get discipline history for a student
router.get('/discipline/:studentId', disciplineController.getDisciplineHistory);

export default router;
