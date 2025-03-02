import { Router } from 'express';
import * as communicationController from '../controllers/communicationController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /communications/announcements:
 *   get:
 *     summary: Get all announcements
 *     description: Retrieves a list of all announcements with optional filtering
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: audience
 *         schema:
 *           type: string
 *           enum: [ALL, STUDENTS, TEACHERS, PARENTS, STAFF]
 *         description: Filter announcements by target audience
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementListResponse'
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
// GET /announcements - List announcements (optionally filter by audience)
// All authenticated users can view announcements
router.get('/announcements', authenticate, communicationController.getAnnouncements);

/**
 * @swagger
 * /communications/announcements:
 *   post:
 *     summary: Create a new announcement
 *     description: Creates a new announcement to be displayed to the specified audience
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementRequest'
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementCreatedResponse'
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
// POST /announcements - Create an announcement
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can create announcements
router.post('/announcements', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.createAnnouncement);

/**
 * @swagger
 * /communications/notifications:
 *   post:
 *     summary: Send a notification to a user
 *     description: Sends a push notification to a specific user
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationSentResponse'
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
// POST /notifications - Send push notifications
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can send notifications
router.post('/notifications', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), communicationController.sendNotification);

export default router;
