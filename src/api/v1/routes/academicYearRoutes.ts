import { Router } from 'express';
import * as academicYearController from '../controllers/academicYearController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /academic-years:
 *   get:
 *     summary: Get all academic years
 *     description: Retrieves a list of all academic years
 *     tags: [Academic Years]
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
 *     responses:
 *       200:
 *         description: List of academic years retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearListResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
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
// GET /academic-years - List all academic years
// All authenticated users can view academic years
router.get('/', authenticate, academicYearController.getAllAcademicYears);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create a new academic year
 *     description: Creates a new academic year with the provided details
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicYearRequest'
 *     responses:
 *       201:
 *         description: Academic year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearCreatedResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
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
// POST /academic-years - Create a new academic year
// Only ADMIN, PRINCIPAL can create academic years
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL']), academicYearController.createAcademicYear);

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     summary: Get academic year details
 *     description: Retrieves details of a specific academic year by ID
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearDetailResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Academic year not found
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
// GET /academic-years/:id - Get academic year details
// All authenticated users can view academic year details
router.get('/:id', authenticate, academicYearController.getAcademicYearById);

/**
 * @swagger
 * /academic-years/{id}/default:
 *   post:
 *     summary: Set an academic year as default
 *     description: Sets a specific academic year as the default
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year set as default successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearDefaultResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Academic year not found
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
// POST /academic-years/:id/default - Set an academic year as default
// Only ADMIN, PRINCIPAL can set default academic year
router.post('/:id/default', authenticate, authorize(['ADMIN', 'PRINCIPAL']), academicYearController.setDefaultAcademicYear);

/**
 * @swagger
 * /academic-years/{id}/terms:
 *   post:
 *     summary: Add a term to an academic year
 *     description: Adds a new term to a specific academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermRequest'
 *     responses:
 *       201:
 *         description: Term added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermCreatedResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Academic year not found
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
// POST /academic-years/:id/terms - Add a term to an academic year
router.post('/:id/terms', authenticate, authorize(['ADMIN', 'PRINCIPAL']), academicYearController.addTerm);

/**
 * @swagger
 * /academic-years/{id}:
 *   put:
 *     summary: Update an academic year
 *     description: Updates an existing academic year with the provided details
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAcademicYearRequest'
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearUpdatedResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Academic year not found
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
// PUT /academic-years/:id - Update an academic year
router.put('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), academicYearController.updateAcademicYear);

/**
 * @swagger
 * /academic-years/{id}:
 *   delete:
 *     summary: Delete an academic year
 *     description: Deletes a specific academic year by ID
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearDeletedResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Academic year not found
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
// DELETE /academic-years/:id - Delete an academic year
router.delete('/:id', authenticate, authorize(['ADMIN', 'PRINCIPAL']), academicYearController.deleteAcademicYear);

export default router;
