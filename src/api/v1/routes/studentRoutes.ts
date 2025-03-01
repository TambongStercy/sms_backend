import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /students - List all students
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER can view all students
router.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'DISCIPLINE_MASTER']), studentController.getAllStudents);

// POST /students - Create a new student record
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can create students
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.createStudent);

// GET /students/:id - Get student details (including parents, sub-classes)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view any student
// PARENT can only view their linked students
// STUDENT can only view their own profile
router.get('/:id', authenticate, studentController.getStudentById);

// POST /students/:id/parents - Link a parent to a student
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can link parents
router.post('/:id/parents', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.linkParent);

// POST /students/:id/enroll - Enroll student in a sub-class/year
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can enroll students
router.post('/:id/enroll', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.enrollStudent);

export default router;
