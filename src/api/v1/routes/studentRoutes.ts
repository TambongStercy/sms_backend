import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieves a list of all students with optional filtering. Access varies by role.
 *     tags: [Students]
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
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort results by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (ascending or descending)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter students by name (case insensitive, supports partial matching)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *         description: Filter students by gender
 *       - in: query
 *         name: matricule
 *         schema:
 *           type: string
 *         description: Filter students by matriculation number
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filter students by ID
 *       - in: query
 *         name: with_enrollment
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include enrollment information with student data
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: integer
 *         description: Filter students by class ID (only works when with_enrollment=true)
 *       - in: query
 *         name: subclass_id
 *         schema:
 *           type: integer
 *         description: Filter students by subclass ID (only works when with_enrollment=true)
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter students by academic year ID (only works when with_enrollment=true, defaults to current academic year)
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of students matching the filters
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
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
// GET /students - List all students (with filters and optional enrollment info)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER can view all students
router.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'DISCIPLINE_MASTER']), studentController.getAllStudents);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     description: Creates a new student record. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *           example:
 *             matricule: "STD20240001"
 *             name: "John Doe"
 *             date_of_birth: "2005-01-15"
 *             place_of_birth: "Douala"
 *             gender: "Male"
 *             residence: "123 Main St, Douala"
 *             former_school: "Primary School XYZ"
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Invalid request data or invalid gender value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidGender:
 *                 value:
 *                   error: "Invalid gender. Choose a valid gender."
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
// POST /students - Create a new student record
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can create students
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.createStudent);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student details
 *     description: Retrieves details of a specific student by ID, including parents and enrollments (either for current academic year or all years). Access varies by role.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Optional academic year ID (defaults to current academic year)
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have permission to view this student
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
// GET /students/:id - Get student details (including parents, sub-classes)
// ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER can view any student
// PARENT can only view their linked students
// STUDENT can only view their own profile
router.get('/:id', authenticate, studentController.getStudentById);

/**
 * @swagger
 * /students/{id}/parents:
 *   post:
 *     summary: Link a parent to a student
 *     description: Links a parent to a specific student. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkParentRequest'
 *           example:
 *             parent_id: 123
 *     responses:
 *       201:
 *         description: Parent linked to student successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 student_id:
 *                   type: integer
 *                 parent_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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
 *         description: Student or parent not found
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
// POST /students/:id/parents - Link a parent to a student
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can link parents
router.post('/:id/parents', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.linkParent);

/**
 * @swagger
 * /students/{id}/enroll:
 *   post:
 *     summary: Enroll student in a sub-class
 *     description: Enrolls a student in a specific sub-class for an academic year. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollStudentRequest'
 *           example:
 *             subclass_id: 123
 *             academic_year_id: 2
 *             photo: "student_photo_url.jpg"
 *             repeater: false
 *     responses:
 *       201:
 *         description: Student enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
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
 *         description: Student, subclass, or academic year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Student is already enrolled in this subclass for this academic year
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
// POST /students/:id/enroll - Enroll student in a sub-class/year
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can enroll students
router.post('/:id/enroll', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), studentController.enrollStudent);

export default router;
