import { Router } from 'express';
import * as studentController from '../controllers/studentController';

const router = Router();

// GET /students - List all students
router.get('/', studentController.getAllStudents);

// POST /students - Create a new student record
router.post('/', studentController.createStudent);

// GET /students/:id - Get student details (including parents, sub-classes)
router.get('/:id', studentController.getStudentById);

// POST /students/:id/parents - Link a parent to a student
router.post('/:id/parents', studentController.linkParent);

// POST /students/:id/enroll - Enroll student in a sub-class/year
router.post('/:id/enroll', studentController.enrollStudent);

export default router;
