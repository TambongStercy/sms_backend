/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: securePassword123
 * 
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 * 
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - gender
 *         - date_of_birth
 *         - phone
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: securePassword123
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *           description: User's gender
 *           example: MALE
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: 1990-01-01
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: +1234567890
 *         address:
 *           type: string
 *           description: User's physical address
 *           example: 123 Main St, City, Country
 *         id_card_num:
 *           type: string
 *           description: User's ID card number (optional)
 *           example: ID12345678
 * 
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User's unique identifier
 *           example: 1
 *         name:
 *           type: string
 *           description: User's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *           description: User's gender
 *           example: MALE
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: 1990-01-01
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: +1234567890
 *         address:
 *           type: string
 *           description: User's physical address
 *           example: 123 Main St, City, Country
 *         id_card_num:
 *           type: string
 *           description: User's ID card number
 *           example: ID12345678
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 *           example: 2023-01-01T00:00:00Z
 */

// This file is for Swagger documentation only and doesn't export anything
export { }; 