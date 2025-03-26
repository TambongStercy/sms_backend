import { Router } from 'express';
import * as examController from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/examDocs.ts

// Main exams router
const router = Router();

// GET /exams - List all exams
// All authenticated users can view exams list
router.get('/', authenticate, examController.getAllExams);

// GET /exams/papers - List all exam papers
// All authenticated users can view exam papers
router.get('/papers', authenticate, examController.getAllExamPapers);

// POST /exams - Create a new exam sequence
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can create exam sequences
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), examController.createExam);

// POST /exams/papers - Create a new exam paper
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can create exam papers
router.post('/papers', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), examController.createExamPaper);

// GET /exams/:id - Get exam details
// All authenticated users can view exam details
router.get('/:id', authenticate, examController.getExamById);

// DELETE /exams/:id - Delete an exam
// Only SUPER_MANAGER, PRINCIPAL can delete exams
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), examController.deleteExam);

// GET /exams/papers/:examId/with-questions - Get a specific exam paper with its questions
router.get('/papers/:examId/with-questions', authenticate, examController.getExamPaperWithQuestions);

// POST /exams/papers/:id/questions - Add questions to an exam paper
router.post('/papers/:id/questions', authenticate, examController.addQuestionsToExam);

// POST /exams/papers/:id/generate - Generate exam paper (randomize/manual)
router.post('/papers/:id/generate', authenticate, examController.generateExam);

export const reportCardsRouter = Router();

// GET /report-cards/student/:studentId - Generate report card for a student
reportCardsRouter.get('/student/:studentId', authenticate, examController.generateStudentReportCard);

// GET /report-cards/subclass/:subclassId - Generate report cards for a subclass
reportCardsRouter.get('/subclass/:subclassId', authenticate, examController.generateSubclassReportCards);

// Marks router (will be mounted at /marks)
export const marksRouter = Router();

// GET /marks - List all marks (with filters)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view all marks
marksRouter.get('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.getAllMarks);

// POST /marks - Create a new mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can create marks
marksRouter.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.createMark);

// PUT /marks/:id - Update a mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can update marks
marksRouter.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.updateMark);

// DELETE /marks/:id - Delete a mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can delete marks
marksRouter.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.deleteMark);

export default router;
