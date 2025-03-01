import { Router } from 'express';
import * as examController from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Main exams router
const router = Router();

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Get all exams
 *     description: Retrieves a list of all exams
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
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Filter exams by subject ID
 *       - in: query
 *         name: termId
 *         schema:
 *           type: integer
 *         description: Filter exams by term ID
 *     responses:
 *       200:
 *         description: List of exams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized - User is not authenticated
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
// GET /exams - List all exams
// All authenticated users can view exams list
router.get('/', authenticate, examController.getAllExams);

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Create a new exam
 *     description: Creates a new exam with the provided details
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
 *               $ref: '#/components/schemas/Exam'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /exams - Create a new exam
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can create exams
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), examController.createExam);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Get exam details
 *     description: Retrieves details of a specific exam by ID
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
 *         description: Exam details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamDetail'
 *       401:
 *         description: Unauthorized - User is not authenticated
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
// GET /exams/:id - Get exam details
// All authenticated users can view exam details
router.get('/:id', authenticate, examController.getExamById);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Delete an exam
 *     description: Deletes a specific exam by ID
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
// DELETE /exams/:id - Delete an exam
// Only ADMIN, PRINCIPAL can delete exams
router.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), examController.deleteExam);

// GET /exams/:id - Get a specific exam paper with its questions
router.get('/:examId', examController.getExamPaperWithQuestions);

// POST /exams/:id/questions - Add questions to an exam
router.post('/:id/questions', examController.addQuestionsToExam);

// POST /exams/:id/generate - Generate exam paper (randomize/manual)
router.post('/:id/generate', examController.generateExam);

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
 *         name: examId
 *         schema:
 *           type: integer
 *         description: Filter marks by exam ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter marks by student ID
 *     responses:
 *       200:
 *         description: List of marks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 marks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mark'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /marks - List all marks (with filters)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view all marks
marksRouter.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.getAllMarks);

/**
 * @swagger
 * /marks:
 *   post:
 *     summary: Create a new mark entry
 *     description: Creates a new mark for a student's exam
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMarkRequest'
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
 *         description: Exam or student not found
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
// POST /marks - Create a new mark entry
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can create marks
marksRouter.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.createMark);

/**
 * @swagger
 * /marks/{id}:
 *   put:
 *     summary: Update a mark
 *     description: Updates an existing mark with the provided details
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
 *             $ref: '#/components/schemas/UpdateMarkRequest'
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
 *         description: Mark not found
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
// PUT /marks/:id - Update a mark
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can update marks
marksRouter.put('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.updateMark);

/**
 * @swagger
 * /marks/{id}:
 *   delete:
 *     summary: Delete a mark
 *     description: Deletes a specific mark by ID
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
 *         description: Mark not found
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
// DELETE /marks/:id - Delete a mark
// Only ADMIN, PRINCIPAL can delete marks
marksRouter.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), examController.deleteMark);

// Report cards router (will be mounted at /report-cards)
export const reportCardsRouter = Router();

// GET /report-cards - Generate report cards (with filters)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can generate report cards
reportCardsRouter.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), examController.generateReportCards);

// GET /report-cards/:studentId - Generate report card for a specific student
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can generate any report card
// STUDENT can only view their own report card
// PARENT can only view their children's report cards
reportCardsRouter.get('/:studentId', authenticate, examController.getStudentReportCard);

export default router;
