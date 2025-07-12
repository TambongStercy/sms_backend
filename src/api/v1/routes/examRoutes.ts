import { Router } from 'express';
import * as examController from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateTeacherMarksAccess, validateTeacherSubjectAccess } from '../middleware/teacherAuth.middleware';
import { Role } from '@prisma/client';

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

// DELETE /exams/papers/:id - Delete an exam paper
// Only SUPER_MANAGER, PRINCIPAL can delete exam papers
router.delete('/papers/:id', authenticate, authorize([Role.SUPER_MANAGER, Role.PRINCIPAL]), examController.deleteExamPaper);

// GET /exams/:id - Get exam details
// All authenticated users can view exam details
router.get('/:id', authenticate, examController.getExamById);

// PATCH /exams/:id/status - Update exam sequence status (New Route)
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can finalize
router.patch(
    '/:id/status',
    authenticate,
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL]),
    examController.updateExamSequenceStatusController
);

// DELETE /exams/:id - Delete an exam
// Only SUPER_MANAGER, PRINCIPAL can delete exams
router.delete('/:id', authenticate, authorize([Role.SUPER_MANAGER, Role.PRINCIPAL]), examController.deleteExam);

// GET /exams/papers/:examId/with-questions - Get a specific exam paper with its questions
router.get('/papers/:examId/with-questions', authenticate, examController.getExamPaperWithQuestions);

// POST /exams/papers/:id/questions - Add questions to an exam paper
router.post('/papers/:id/questions', authenticate, examController.addQuestionsToExam);

// POST /exams/papers/:id/generate - Generate exam paper (randomize/manual)
router.post('/papers/:id/generate', authenticate, examController.generateExam);

export const reportCardsRouter = Router();

// GET /report-cards/student/:studentId - Downloads a generated report card for a student
reportCardsRouter.get('/student/:studentId', authenticate, examController.generateStudentReportCard);

// GET /report-cards/student/:studentId/availability - Check if a student's report card is available
reportCardsRouter.get('/student/:studentId/availability', authenticate, examController.checkStudentReportCardAvailability);

// POST /report-cards/student/:studentId/generate - Triggers the regeneration of a student's report card
reportCardsRouter.post(
    '/student/:studentId/generate',
    authenticate,
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL]),
    examController.regenerateStudentReportCard
);

// GET /report-cards/subclass/:subClassId - Downloads a generated combined report for a sub_class
reportCardsRouter.get('/subclass/:subClassId', authenticate, examController.generateSubclassReportCards);

// GET /report-cards/subclass/:subClassId/availability - Check if a subclass's report cards are available
reportCardsRouter.get('/subclass/:subClassId/availability', authenticate, examController.checkSubclassReportCardAvailability);

// POST /report-cards/subclass/:subClassId/generate - Triggers the regeneration of a subclass's combined report
reportCardsRouter.post(
    '/subclass/:subClassId/generate',
    authenticate,
    authorize([Role.SUPER_MANAGER, Role.PRINCIPAL, Role.VICE_PRINCIPAL]),
    examController.regenerateSubclassReportCards
);

// Marks router (will be mounted at /marks)
export const marksRouter = Router();

// GET /marks - List all marks (with filters)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view all marks
// TEACHER can only view marks for their assigned subjects/subclasses
marksRouter.get('/',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']),
    // Add teacher access validation for TEACHER role only
    (req: any, res: any, next: any) => {
        // Check if user has TEACHER role
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        // If user is TEACHER only (no higher roles), apply subject access validation
        if (isTeacher && !hasHigherRole) {
            return validateTeacherSubjectAccess(req, res, next);
        }

        next();
    },
    examController.getAllMarks
);

// POST /marks - Create a new mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can create marks
// TEACHER can only create marks for their assigned subjects/subclasses
marksRouter.post('/',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']),
    // Add teacher marks access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherMarksAccess(req, res, next);
        }

        next();
    },
    examController.createMark
);

// PUT /marks/:id - Update a mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can update marks
// TEACHER can only update marks for their assigned subjects/subclasses
marksRouter.put('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']),
    // Add teacher marks access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherMarksAccess(req, res, next);
        }

        next();
    },
    examController.updateMark
);

// DELETE /marks/:id - Delete a mark
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER can delete marks
// TEACHER can only delete marks for their assigned subjects/subclasses
marksRouter.delete('/:id',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']),
    // Add teacher marks access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherMarksAccess(req, res, next);
        }

        next();
    },
    examController.deleteMark
);

export default router;
