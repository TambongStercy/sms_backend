import { Router } from 'express';
import * as examController from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Main exams router
const router = Router();

/**
 * @swagger
 * /api/v1/exams:
 *   get:
 *     summary: Get all exams
 *     description: Retrieve a list of all exams with optional filtering and pagination
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter exams by name
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *         description: Filter exams by subject ID
 *       - in: query
 *         name: term_id
 *         schema:
 *           type: integer
 *         description: Filter exams by term ID
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter exams by academic year ID
 *       - in: query
 *         name: subclass_id
 *         schema:
 *           type: integer
 *         description: Filter exams by subclass ID
 *     responses:
 *       200:
 *         description: A list of exams with pagination information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamListResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /exams - List all exams
// All authenticated users can view exams list
router.get('/', authenticate, examController.getAllExams);

/**
 * @swagger
 * /api/v1/exams:
 *   post:
 *     summary: Create a new exam
 *     description: Create a new exam with the provided information
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamRequest'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamCreatedResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /exams - Create a new exam
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can create exams
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), examController.createExam);

/**
 * @swagger
 * /api/v1/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     description: Retrieve detailed information about a specific exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Detailed exam information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamDetailResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /exams/:id - Get exam details
// All authenticated users can view exam details
router.get('/:id', authenticate, examController.getExamById);

/**
 * @swagger
 * /api/v1/exams/{id}:
 *   delete:
 *     summary: Delete an exam
 *     description: Delete an existing exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamDeletedResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// DELETE /exams/:id - Delete an exam
// Only ADMIN, PRINCIPAL can delete exams
router.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), examController.deleteExam);

/**
 * @swagger
 * /exams/{examId}:
 *   get:
 *     summary: Get exam paper with questions
 *     description: Retrieves a specific exam paper with its questions
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam paper with questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examPaper:
 *                   $ref: '#/components/schemas/ExamPaper'
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Exam paper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /exams/:examId - Get a specific exam paper with its questions
router.get('/:examId', examController.getExamPaperWithQuestions);

/**
 * @swagger
 * /exams/{id}/questions:
 *   post:
 *     summary: Add questions to an exam
 *     description: Adds questions to a specific exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionIds
 *             properties:
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of question IDs to add to the exam
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Questions added to exam successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 examPaper:
 *                   $ref: '#/components/schemas/ExamPaper'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Exam or questions not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /exams/:id/questions - Add questions to an exam
router.post('/:id/questions', examController.addQuestionsToExam);

/**
 * @swagger
 * /exams/{id}/generate:
 *   post:
 *     summary: Generate exam paper
 *     description: Generates an exam paper by randomizing questions or manually selecting them
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [random, manual]
 *                 description: Method to generate the exam paper
 *                 example: "random"
 *               count:
 *                 type: integer
 *                 description: Number of questions to randomly select (for random method)
 *                 example: 20
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of question IDs to include (for manual method)
 *                 example: [1, 2, 3, 4, 5]
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of topics to filter questions by (for random method)
 *                 example: ["Algebra", "Geometry"]
 *     responses:
 *       200:
 *         description: Exam paper generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 examPaper:
 *                   $ref: '#/components/schemas/ExamPaper'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /exams/:id/generate - Generate exam paper (randomize/manual)
router.post('/:id/generate', examController.generateExam);

export const reportCardsRouter = Router();

/**
 * @swagger
 * /report-cards/student/{studentId}:
 *   get:
 *     summary: Generate report card for a student
 *     description: Generate report card for a specific student
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: examSequenceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam Sequence ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Academic Year ID (defaults to current academic year)
 *     responses:
 *       200:
 *         description: Report card generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student, term, or academic year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// reportCardsRouter.get('/student/:studentId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT']), examController.generateStudentReportCard);
reportCardsRouter.get('/student/:studentId', examController.generateStudentReportCard);

/**
 * @swagger
 * /report-cards/subclass/{subclassId}:
 *   get:
 *     summary: Generate report cards for a subclass
 *     description: Generate report cards for all students in a subclass
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subclassId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subclass ID
 *       - in: query
 *         name: examSequenceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam Sequence ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Academic Year ID (defaults to current academic year)
 *     responses:
 *       200:
 *         description: Report cards generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Subclass, term, or academic year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// reportCardsRouter.get('/subclass/:subclassId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.generateSubclassReportCards);
reportCardsRouter.get('/subclass/:subclassId', examController.generateSubclassReportCards);


// Marks router (will be mounted at /marks)
export const marksRouter = Router();

/**
 * @swagger
 * /marks:
 *   get:
 *     summary: Get all marks
 *     description: Retrieves a list of all marks with optional filtering
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: exam_id
 *         schema:
 *           type: integer
 *         description: Filter marks by exam ID
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter marks by student ID
 *     responses:
 *       200:
 *         description: List of marks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarkListResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /marks - List all marks (with filters)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view all marks
marksRouter.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.getAllMarks);

/**
 * @swagger
 * /marks:
 *   post:
 *     summary: Create a new mark
 *     description: Create a new exam mark for a student
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exam_id
 *               - student_id
 *               - subject_id
 *               - mark
 *             properties:
 *               exam_id:
 *                 type: integer
 *                 description: ID of the exam
 *               student_id:
 *                 type: integer
 *                 description: ID of the student
 *               subject_id:
 *                 type: integer
 *                 description: ID of the subject
 *               mark:
 *                 type: number
 *                 description: Exam mark (score)
 *               comment:
 *                 type: string
 *                 description: Optional comment on the mark
 *     responses:
 *       201:
 *         description: Mark created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mark'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /marks - Create a new mark
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can create marks
marksRouter.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.createMark);

/**
 * @swagger
 * /marks/{id}:
 *   put:
 *     summary: Update a mark
 *     description: Update an existing exam mark
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mark ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mark:
 *                 type: number
 *                 description: Updated exam mark (score)
 *               comment:
 *                 type: string
 *                 description: Updated comment on the mark
 *     responses:
 *       200:
 *         description: Mark updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mark'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mark not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// PUT /marks/:id - Update a mark
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can update marks
marksRouter.put('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.updateMark);

/**
 * @swagger
 * /marks/{id}:
 *   delete:
 *     summary: Delete a mark
 *     description: Delete an existing exam mark
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mark ID
 *     responses:
 *       200:
 *         description: Mark deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User is not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mark not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// DELETE /marks/:id - Delete a mark
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can delete marks
marksRouter.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.deleteMark);

export default router;
