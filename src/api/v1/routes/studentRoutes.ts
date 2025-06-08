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

// PUT /students/:id - Update student details
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update students
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.updateStudent);

// POST /students/:id/parents - Link a parent to a student
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can link parents
router.post('/:id/parents', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.linkParent);

// DELETE /students/:studentId/parents/:parentId - Unlink a parent from a student
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can unlink parents
router.delete('/:studentId/parents/:parentId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.unlinkParent);

// GET /students/:studentId/parents - Get all parents linked to a student
// Authenticated users who can view student can view their parents
router.get('/:studentId/parents', authenticate, studentController.getParentsByStudentId);

// POST /students/:id/enroll - Enroll student in a sub-class/year
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can enroll students
router.post('/:id/enroll', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.enrollStudent);

// GET /students/:id/status - Get student status information (new/old/repeater)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, BURSAR can view student status
router.get('/:id/status', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']), studentController.getStudentStatusInfo);

// GET /students/status/summary - Get all students with status information
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, BURSAR can view student status summary
router.get('/status/summary', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']), studentController.getStudentsWithStatusInfo);

export default router;
