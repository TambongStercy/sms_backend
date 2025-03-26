// Swagger documentation can be found in src/config/swagger/docs/studentDocs.ts
import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /students - List all students (with filters and optional enrollment info)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER can view all students
router.get('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'DISCIPLINE_MASTER']), studentController.getAllStudents);

// POST /students - Create a new student record
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can create students
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.createStudent);

// GET /students/:id - Get student details (including parents, sub-classes)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view any student
// PARENT can only view their linked students
// STUDENT can only view their own profile
router.get('/:id', authenticate, studentController.getStudentById);

// POST /students/:id/parents - Link a parent to a student
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can link parents
router.post('/:id/parents', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.linkParent);

// POST /students/:id/enroll - Enroll student in a sub-class/year
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can enroll students
router.post('/:id/enroll', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.enrollStudent);

export default router;
