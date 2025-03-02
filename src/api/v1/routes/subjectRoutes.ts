import { Router } from 'express';
import * as subjectController from '../controllers/subjectController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Retrieves a list of all subjects with optional filtering and pagination
 *     tags: [Subjects]
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
 *         description: Filter subjects by name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *         description: Filter subjects by category
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filter subjects by ID
 *       - in: query
 *         name: include_teachers
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include teacher information with subject data
 *       - in: query
 *         name: include_subclasses
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include subclass information with subject data
 *     responses:
 *       200:
 *         description: List of subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
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
// GET /subjects - List all subjects
// All authenticated users can view subjects
router.get('/', authenticate, subjectController.getAllSubjects);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     description: Creates a new subject with the provided details
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectRequest'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
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
// POST /subjects - Create a new subject
// Only ADMIN, PRINCIPAL can create subjects
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL']), subjectController.createSubject);

/**
 * @swagger
 * /subjects/{subjectId}:
 *   get:
 *     summary: Get subject details
 *     description: Retrieves details of a specific subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectDetail'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subject not found
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
// GET /subjects/:id - Get subject details
// All authenticated users can view subject details
router.get('/:id', authenticate, subjectController.getSubjectById);

/**
 * @swagger
 * /subjects/{subjectId}:
 *   put:
 *     summary: Update subject details
 *     description: Updates an existing subject with the provided details
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubjectRequest'
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
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
 *         description: Subject not found
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
// PUT /subjects/:id - Update subject details
// Only ADMIN, PRINCIPAL can update subjects
router.put('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), subjectController.updateSubject);

/**
 * @swagger
 * /subjects/{subjectId}:
 *   delete:
 *     summary: Delete a subject
 *     description: Deletes a specific subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
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
 *         description: Subject not found
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
// DELETE /subjects/:id - Delete a subject
// Only ADMIN, PRINCIPAL can delete subjects
router.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), subjectController.deleteSubject);

/**
 * @swagger
 * /subjects/{subjectId}/teachers:
 *   post:
 *     summary: Assign a teacher to a subject
 *     description: Assigns a teacher to a specific subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTeacherRequest'
 *     responses:
 *       200:
 *         description: Teacher assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 subject:
 *                   $ref: '#/components/schemas/SubjectDetail'
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
 *         description: Subject or teacher not found
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
// POST /subjects/:id/teachers - Assign a teacher to a subject
// Only ADMIN, PRINCIPAL can assign teachers
router.post('/:id/teachers', authenticate, authorize(['ADMIN', 'PRINCIPAL']), subjectController.assignTeacher);

/**
 * @swagger
 * /subjects/{subjectId}/sub-classes:
 *   post:
 *     summary: Link subject to a sub-class
 *     description: Links a subject to a sub-class with a specified coefficient and main teacher
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subclass_id
 *               - coefficient
 *               - main_teacher_id
 *             properties:
 *               subclass_id:
 *                 type: integer
 *                 description: ID of the subclass to link the subject to
 *               coefficient:
 *                 type: number
 *                 description: Coefficient for the subject in this subclass
 *               main_teacher_id:
 *                 type: integer
 *                 description: ID of the main teacher for this subject-subclass combination
 *     responses:
 *       201:
 *         description: Subject linked to subclass successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 subject_id:
 *                   type: integer
 *                 subclass_id:
 *                   type: integer
 *                 coefficient:
 *                   type: number
 *                 main_teacher_id:
 *                   type: integer
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
 *         description: Subject, subclass, or teacher not found
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
// POST /subjects/:id/sub-classes - Link subject to a sub-class (with coefficient)
// Only ADMIN, PRINCIPAL can link subjects to sub-classes
router.post('/:id/sub-classes', authenticate, authorize(['ADMIN', 'PRINCIPAL']), subjectController.linkSubjectToSubClass);

export default router;
