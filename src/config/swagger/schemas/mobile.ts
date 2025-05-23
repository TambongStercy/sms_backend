/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Notification ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID of the user the notification belongs to
 *           example: 10
 *         message:
 *           type: string
 *           description: Notification message content
 *           example: New announcement posted
 *         dateSent:
 *           type: string
 *           format: date-time
 *           description: Date and time the notification was sent
 *           example: 2023-01-01T12:00:00.000Z
 *         status:
 *           type: string
 *           enum: [SENT, DELIVERED, READ]
 *           description: Current status of the notification
 *           example: SENT
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         statistics:
 *           type: object
 *           properties:
 *             attendance:
 *               type: integer
 *               description: Attendance percentage
 *               example: 95
 *             assignments:
 *               type: integer
 *               description: Number of pending assignments
 *               example: 3
 *             fees:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: number
 *                   description: Total fee amount
 *                   example: 50000
 *                 amountPaid:
 *                   type: number
 *                   description: Amount already paid
 *                   example: 30000
 *                 amountDue:
 *                   type: number
 *                   description: Amount still due
 *                   example: 20000
 *                 deadline:
 *                   type: string
 *                   format: date
 *                   description: Payment deadline
 *                   example: 2023-09-30
 *
 *     DeviceRegistrationRequest:
 *       type: object
 *       required:
 *         - deviceToken
 *         - deviceType
 *       properties:
 *         deviceToken:
 *           type: string
 *           description: Device token for push notifications
 *           example: fcm-token-example-123456789
 *         deviceType:
 *           type: string
 *           enum: [android, ios, web]
 *           description: Type of the device
 *           example: android
 *
 *     DeviceRegistrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Success or error message
 *           example: Device registered successfully
 *         deviceInfo:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               description: User ID
 *               example: 1
 *             deviceToken:
 *               type: string
 *               description: Device token
 *               example: fcm-token-example-123456789
 *             deviceType:
 *               type: string
 *               description: Device type
 *               example: android
 *
 *     Dashboard:
 *       type: object
 *       properties:
 *         announcements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: School Closed Tomorrow
 *               message:
 *                 type: string
 *                 example: Due to weather conditions, school will be closed tomorrow
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-01-01T10:00:00.000Z
 *         upcomingEvents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Parent-Teacher Conference
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-01-15T14:00:00.000Z
 *               location:
 *                 type: string
 *                 example: School Auditorium
 *         statistics:
 *           type: object
 *           properties:
 *             attendance:
 *               type: integer
 *               description: Attendance percentage
 *               example: 95
 *             assignments:
 *               type: integer
 *               description: Number of pending assignments
 *               example: 3
 *             fees:
 *               type: object
 *               properties:
 *                 paid:
 *                   type: number
 *                   description: Amount of fees paid
 *                   example: 5000
 *                 pending:
 *                   type: number
 *                   description: Amount of fees pending
 *                   example: 2000
 *         quickLinks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: View Timetable
 *               url:
 *                 type: string
 *                 example: /timetable
 *               icon:
 *                 type: string
 *                 example: calendar
 *
 *     SyncRequest:
 *       type: object
 *       required:
 *         - lastSyncTimestamp
 *       properties:
 *         lastSyncTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last sync
 *           example: 2023-01-01T12:00:00.000Z
 *         data:
 *           type: object
 *           properties:
 *             attendanceRecords:
 *               type: array
 *               items:
 *                 type: object
 *             markEntries:
 *               type: array
 *               items:
 *                 type: object
 *             formSubmissions:
 *               type: array
 *               items:
 *                 type: object
 *
 *     SyncResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         syncTimestamp:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T12:00:00.000Z
 *         updates:
 *           type: object
 *           properties:
 *             students:
 *               type: array
 *               items:
 *                 type: object
 *             classes:
 *               type: array
 *               items:
 *                 type: object
 *             subjects:
 *               type: array
 *               items:
 *                 type: object
 *             announcements:
 *               type: array
 *               items:
 *                 type: object
 * 
 *     # Standardized Response Schemas
 *     MobileDashboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Dashboard'
 *       description: Response for a successful request to retrieve mobile dashboard data
 *
 *     DeviceRegisteredResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Device registered successfully
 *         data:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               example: 1
 *             deviceToken:
 *               type: string
 *               example: fcm-token-example-123456789
 *             deviceType:
 *               type: string
 *               example: android
 *       description: Response for a successful device registration request
 *
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 25
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             totalPages:
 *               type: integer
 *               example: 2
 *       description: Response for a successful request to retrieve user notifications
 *
 *     DataSyncResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Data synced successfully
 *       description: Response for a successful data synchronization request
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: An error occurred
 *       description: Response for an unsuccessful request
 */

export { }; 
