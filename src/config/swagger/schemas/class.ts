/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the class
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the class
 *           example: "Form 1"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was last updated
 *           example: "2023-01-01T12:00:00Z"
 *         subclasses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subclass'
 *           description: List of subclasses in this class
 *       description: Class information
 *     
 *     Subclass:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the subclass
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the subclass
 *           example: "Form 1A"
 *         class_id:
 *           type: integer
 *           description: ID of the parent class
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subclass was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subclass was last updated
 *           example: "2023-01-01T12:00:00Z"
 *       description: Subclass information
 *     
 *     ClassDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the class
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the class
 *           example: "Form 1"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was last updated
 *           example: "2023-01-01T12:00:00Z"
 *         subclasses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subclass'
 *           description: List of subclasses in this class
 *       description: Detailed class information including subclasses
 *     
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the class
 *           example: "Form 1"
 *       description: Information required to create a new class
 *     
 *     CreateSubclassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the subclass
 *           example: "Form 1A"
 *       description: Information required to create a new subclass
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 