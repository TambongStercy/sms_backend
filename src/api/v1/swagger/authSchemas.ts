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
 *           description: User's password (min 8 characters)
 *           example: "password123"
 *       description: Credentials required for user authentication
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authenticating subsequent requests
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 *       description: Successful login response containing authentication token and user information
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
 *           description: Full name of the user
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (min 8 characters)
 *           example: "password123"
 *         gender:
 *           type: string
 *           enum: [Female, Male]
 *           description: User's gender
 *           example: Male
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth in ISO format
 *           example: "1990-01-01"
 *         phone:
 *           type: string
 *           description: User's contact phone number
 *           example: "+237 680123456"
 *         address:
 *           type: string
 *           description: User's physical address
 *           example: "123 Main Street, Yaoundé"
 *         id_card_num:
 *           type: string
 *           description: User's ID card number (optional)
 *           example: "ID12345678"
 *       description: Information required to register a new user
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the user
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
 *           enum: [Female, Male]
 *           description: User's gender
 *           example: Male
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: "1990-01-01"
 *         phone:
 *           type: string
 *           description: User's contact phone number
 *           example: "+237 680123456"
 *         address:
 *           type: string
 *           description: User's physical address
 *           example: "123 Main Street, Yaoundé"
 *         id_card_num:
 *           type: string
 *           description: User's ID card number
 *           example: "ID12345678"
 *         photo:
 *           type: string
 *           description: URL to user's profile photo
 *           example: "https://example.com/profiles/john.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was last updated
 *           example: "2023-01-01T12:00:00Z"
 *       description: User account information
 *     
 *     TokenInfo:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         expiresIn:
 *           type: string
 *           description: Time until token expiration
 *           example: 24h
 *       description: Information about an authentication token
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: Invalid credentials
 *       description: Error response
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token authentication. Provide the token received from the login endpoint.
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing, invalid, or expired
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ForbiddenError:
 *       description: User does not have sufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Forbidden: Insufficient permissions
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 