/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Announcement ID
 *           example: 1
 *         title:
 *           type: string
 *           description: Announcement title
 *           example: School Closed Tomorrow
 *         message:
 *           type: string
 *           description: Announcement content
 *           example: Due to weather conditions, school will be closed tomorrow
 *         audience:
 *           $ref: '#/components/schemas/Audience'
 *           description: Target audience for the announcement
 *           example: INTERNAL
 *         createdById:
 *           type: integer
 *           description: ID of the user who created the announcement
 *           example: 1
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID
 *           example: 1
 *         datePosted:
 *           type: string
 *           format: date-time
 *           description: Date when the announcement was posted
 *           example: 2023-09-15T08:00:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     CreateAnnouncementRequest:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - audience
 *       properties:
 *         title:
 *           type: string
 *           description: Announcement title
 *           example: School Closed Tomorrow
 *         message:
 *           type: string
 *           description: Announcement content
 *           example: Due to weather conditions, school will be closed tomorrow
 *         audience:
 *           $ref: '#/components/schemas/Audience'
 *           description: Target audience for the announcement
 *           example: INTERNAL
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year this announcement belongs to (optional)
 *           example: 2
 *
 *     SendNotificationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - message
 *       properties:
 *         userId:
 *           type: integer
 *           description: ID of the user to send the notification to
 *           example: 10
 *         message:
 *           type: string
 *           description: Notification message content
 *           example: Please check your child's attendance record
 *
 *     # Standardized Response Schemas
 *     AnnouncementListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Announcement'
 *       description: Response for a successful request to retrieve a list of announcements
 *
 *     AnnouncementCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Announcement'
 *       description: Response for a successful request to create a new announcement
 *
 *     NotificationSentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Notification sent successfully
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             userId:
 *               type: integer
 *               example: 10
 *             message:
 *               type: string
 *               example: Please check your child's attendance record
 *             dateSent:
 *               type: string
 *               format: date-time
 *               example: 2023-01-01T12:00:00.000Z
 *             status:
 *               $ref: '#/components/schemas/NotificationStatus'
 *               example: SENT
 *       description: Response for a successful request to send a notification
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
