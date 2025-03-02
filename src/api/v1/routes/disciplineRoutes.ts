import { Router } from 'express';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /discipline:
 *   get:
 *     summary: Get all discipline records
 *     description: Retrieves a list of all discipline records with optional filtering
 *     tags: [Discipline]
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
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter discipline records by student ID
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: integer
 *         description: Filter discipline records by class ID
 *       - in: query
 *         name: subclass_id
 *         schema:
 *           type: integer
 *         description: Filter discipline records by subclass ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discipline records from this date (inclusive)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discipline records until this date (inclusive)
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter discipline records by description text (case insensitive)
 *       - in: query
 *         name: include_assigned_by
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include information about who assigned the discipline record
 *       - in: query
 *         name: include_reviewed_by
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include information about who reviewed the discipline record
 *       - in: query
 *         name: include_student
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed student information with each record
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter discipline records by academic year ID (defaults to current academic year if not provided)
 *     responses:
 *       200:
 *         description: List of discipline records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineListResponse'
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
// GET /discipline - List all discipline records (with filters)
// All authenticated users can view discipline records list
router.get('/', authenticate, disciplineController.getAllDisciplineIssues);

/**
 * @swagger
 * /discipline/{studentId}:
 *   get:
 *     summary: Get discipline records for a student
 *     description: Retrieves all discipline records for a specific student
 *     tags: [Discipline]
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
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter by academic year ID (defaults to current academic year if not provided)
 *     responses:
 *       200:
 *         description: Discipline records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineHistoryResponse'
 *       400:
 *         description: Invalid student ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid student ID"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
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
// GET /discipline/:studentId - Get discipline records for a specific student
router.get('/:studentId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.getDisciplineHistory);

/**
 * @swagger
 * /attendance/students:
 *   post:
 *     summary: Record student attendance
 *     description: Records student absence or lateness. Accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordStudentAttendanceRequest'
 *     responses:
 *       201:
 *         description: Student attendance recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentAttendanceResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
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
 *         description: Student enrollment or teacher period not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Student with ID 5 is not enrolled in the specified academic year"
 *       409:
 *         description: Attendance record already exists for this student in this period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Attendance record already exists for this student in this period"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /attendance/students - Record student absence/lateness
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record student attendance
router.post('/attendance/students', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordStudentAttendance);

/**
 * @swagger
 * /attendance/teachers:
 *   post:
 *     summary: Record teacher attendance
 *     description: Records teacher absence. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordTeacherAttendanceRequest'
 *     responses:
 *       201:
 *         description: Teacher attendance recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherAttendanceResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
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
 *         description: Teacher or teacher period not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Teacher with ID 5 not found"
 *       409:
 *         description: Attendance record already exists for this teacher in this period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Attendance record already exists for this teacher in this period"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /attendance/teachers - Record teacher absence
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can record teacher attendance
router.post('/attendance/teachers', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), disciplineController.recordTeacherAttendance);

/**
 * @swagger
 * /discipline:
 *   post:
 *     summary: Record a discipline issue
 *     description: Records a discipline issue for a student. Accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordDisciplineIssueRequest'
 *     responses:
 *       201:
 *         description: Discipline issue recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
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
 *         description: Student enrollment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Student with ID 5 is not enrolled in the specified academic year"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /discipline - Record a discipline issue
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER can record discipline issues
router.post('/discipline', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordDisciplineIssue);

export default router;
