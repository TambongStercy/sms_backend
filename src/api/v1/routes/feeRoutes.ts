import { Router } from 'express';
import * as feeController from '../controllers/feeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /fees:
 *   get:
 *     summary: Get all fees
 *     description: Retrieves a list of all fees with optional filtering
 *     tags: [Fees]
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
 *         description: Filter fees by student ID
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter fees by academic year ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PAID, PARTIAL, UNPAID]
 *         description: Filter fees by payment status
 *     responses:
 *       200:
 *         description: List of fees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fee'
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
// GET /fees - List all fees (with filters)
// All authenticated users can view fees list
router.get('/', authenticate, feeController.getAllFees);

/**
 * @swagger
 * /fees:
 *   post:
 *     summary: Create a fee record
 *     description: Creates a new fee record for a student. Only accessible by ADMIN, PRINCIPAL, BURSAR.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeeRequest'
 *     responses:
 *       201:
 *         description: Fee record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolFee'
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
 *         description: Student enrollment or academic year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Fee record already exists for this student in this academic year
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
// POST /fees - Create a fee record for a student
// Only ADMIN, PRINCIPAL, BURSAR can create fee records
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'BURSAR']), feeController.createFee);

/**
 * @swagger
 * /fees/{feeId}/payments:
 *   get:
 *     summary: Get all payments for a fee
 *     description: Retrieves a list of all payments for a specific fee
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: List of payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Fee not found
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
// GET /fees/:feeId/payments - List all payments for a fee
router.get('/:feeId/payments', authenticate, feeController.getFeePayments);

/**
 * @swagger
 * /fees/reports:
 *   get:
 *     summary: Export fee data
 *     description: Exports fee data in Excel/Word format. Only accessible by ADMIN, PRINCIPAL, BURSAR.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, word]
 *           default: excel
 *         description: Export format
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filter by academic year ID
 *       - in: query
 *         name: subclass_id
 *         schema:
 *           type: integer
 *         description: Filter by subclass ID
 *     responses:
 *       200:
 *         description: Fee data exported successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
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
// GET /fees/reports - Export fee data (Excel/Word)
// Only ADMIN, PRINCIPAL, BURSAR can export fee reports
router.get('/reports', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'BURSAR']), feeController.exportFeeReports);

export default router;
