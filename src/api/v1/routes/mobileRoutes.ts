import { Router } from 'express';
import * as mobileController from '../controllers/mobileController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /mobile/dashboard:
 *   get:
 *     summary: Get mobile dashboard data
 *     description: Retrieves personalized dashboard data for the authenticated user's mobile app
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileDashboardResponse'
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
// GET /mobile/dashboard - Get mobile dashboard data
// All authenticated users can access their dashboard
router.get('/dashboard', authenticate, mobileController.getDashboard);

/**
 * @swagger
 * /mobile/register-device:
 *   post:
 *     summary: Register a mobile device for push notifications
 *     description: Registers a mobile device to receive push notifications
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceRegistrationRequest'
 *     responses:
 *       200:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceRegisteredResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /mobile/register-device - Register a mobile device for push notifications
// All authenticated users can register their devices
router.post('/register-device', authenticate, mobileController.registerDevice);

/**
 * @swagger
 * /mobile/notifications:
 *   get:
 *     summary: Get user-specific notifications
 *     description: Retrieves all notifications for the authenticated user
 *     tags: [Mobile]
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
 *         description: Number of notifications per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [read, unread, all]
 *           default: all
 *         description: Filter notifications by status
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
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
// GET /mobile/notifications - Get user-specific notifications
// All authenticated users can access their notifications
router.get('/notifications', authenticate, mobileController.getNotifications);

/**
 * @swagger
 * /mobile/data/sync:
 *   post:
 *     summary: Sync offline data
 *     description: Synchronizes data between the mobile app and server
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncRequest'
 *     responses:
 *       200:
 *         description: Data synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSyncResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /mobile/data/sync - Sync offline data (if implemented)
// All authenticated users can sync their data
router.post('/data/sync', authenticate, mobileController.syncData);

export default router;
