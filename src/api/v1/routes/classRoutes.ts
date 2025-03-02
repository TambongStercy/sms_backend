import { Router } from 'express';
import * as classController from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     description: Retrieves a list of all classes. Accessible by all authenticated users.
 *     tags: [Classes]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter classes by name
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filter classes by ID
 *       - in: query
 *         name: legacy
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Use legacy format (non-paginated) if set to true
 *     responses:
 *       200:
 *         description: List of classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
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
// GET /classes - List all classes
// All authenticated users can view classes
router.get('/', authenticate, classController.getAllClasses);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     description: Creates a new class. Only accessible by ADMIN, PRINCIPAL.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
// POST /classes - Create a new class
// Only ADMIN, PRINCIPAL can create classes
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.createClass);

/**
 * @swagger
 * /classes/{classId}:
 *   get:
 *     summary: Get class details
 *     description: Retrieves details of a specific class by ID, including its sub-classes. Accessible by all authenticated users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDetail'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Class not found
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
// GET /classes/:classId - Get class details with sub-classes
// All authenticated users can view class details
router.get('/:id', authenticate, classController.getClassById);

/**
 * @swagger
 * /classes/{classId}/sub-classes:
 *   post:
 *     summary: Add a sub-class to a class
 *     description: Adds a new sub-class to a specific class. Only accessible by ADMIN, PRINCIPAL.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubclassRequest'
 *     responses:
 *       201:
 *         description: Sub-class added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subclass'
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
 *         description: Class not found
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
// POST /classes/:classId/sub-classes - Add a sub-class to a class
// Only ADMIN, PRINCIPAL can add sub-classes
router.post('/:id/sub-classes', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.addSubClass);

/**
 * @swagger
 * /classes/{classId}/sub-classes/{subclassId}:
 *   delete:
 *     summary: Delete a sub-class
 *     description: Deletes a specific sub-class from a class. Only accessible by ADMIN, PRINCIPAL.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
 *       - in: path
 *         name: subclassId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sub-class ID
 *     responses:
 *       200:
 *         description: Sub-class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-class deleted successfully"
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
 *         description: Class or sub-class not found
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
// DELETE /classes/:classId/sub-classes/:subclassId - Delete a sub-class
// Only ADMIN, PRINCIPAL can delete sub-classes
router.delete('/:id/sub-classes/:subClassId', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.deleteSubClass);

export default router;
