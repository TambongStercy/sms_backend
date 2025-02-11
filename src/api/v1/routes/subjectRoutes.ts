import { Router } from 'express';
import * as subjectController from '../controllers/subjectController';

const router = Router();

// GET /subjects - List all subjects
router.get('/', subjectController.getAllSubjects);

// POST /subjects - Create a new subject
router.post('/', subjectController.createSubject);

// POST /subjects/:id/teachers - Assign a teacher to a subject
router.post('/:id/teachers', subjectController.assignTeacher);

// POST /subjects/:id/sub-classes - Link subject to a sub-class (with coefficient)
router.post('/:id/sub-classes', subjectController.linkSubjectToSubClass);

export default router;
