/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication, registration, and session management endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     description: |
 *       Authenticates a user with email and password credentials.
 *       On successful login, returns a JWT token valid for 24 hours along with user information.
 *       This token must be included in the Authorization header of subsequent requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             valid:
 *               summary: Valid login credentials
 *               value:
 *                 email: user@example.com
 *                 password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             examples:
 *               success:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   data:
 *                     token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE1MjQ1NTY1LCJleHAiOjE2MTUzMzE5NjV9.8tUTQM6q7J_5oxlAb-mGjNPNBg9T5WvEYW8RSBvKAiQ
 *                     expiresIn: "24h"
 *                     user:
 *                       id: 1
 *                       name: John Doe
 *                       email: user@example.com
 *                       gender: MALE
 *                       dateOfBirth: "1990-01-01"
 *                       phone: "+237 680123456"
 *                       address: "123 Main Street, Yaoundé"
 *                       photo: "https://example.com/profiles/john.jpg"
 *                       userRoles: [
 *                         {
 *                           id: 1,
 *                           role: "ADMIN",
 *                           description: "Administrator with full access"
 *                         }
 *                       ]
 *                       createdAt: "2023-01-01T12:00:00Z"
 *                       updatedAt: "2023-01-01T12:00:00Z"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials provided
 *                 value:
 *                   success: false
 *                   error: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: |
 *       Creates a new user account with the provided information.
 *       Passwords are securely hashed before storage.
 *       After registration, users must login to access protected endpoints.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             valid:
 *               summary: Valid registration information
 *               value:
 *                 name: John Doe
 *                 email: john.doe@example.com
 *                 password: SecurePass123
 *                 gender: MALE
 *                 dateOfBirth: "1990-01-01"
 *                 phone: "+237 680123456"
 *                 address: "123 Main Street, Yaoundé"
 *                 idCardNum: "ID12345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             examples:
 *               success:
 *                 summary: User registered successfully
 *                 value:
 *                   success: true
 *                   message: User registered successfully
 *                   data:
 *                     id: 1
 *                     name: John Doe
 *                     email: john.doe@example.com
 *                     gender: MALE
 *                     dateOfBirth: "1990-01-01"
 *                     phone: "+237 680123456"
 *                     address: "123 Main Street, Yaoundé"
 *                     idCardNum: "ID12345678"
 *                     createdAt: "2023-01-01T12:00:00Z"
 *                     updatedAt: "2023-01-01T12:00:00Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidGender:
 *                 summary: Invalid gender value
 *                 value:
 *                   success: false
 *                   error: Invalid gender. Choose a valid gender.
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicateEmail:
 *                 summary: Email already in use
 *                 value:
 *                   success: false
 *                   error: Email already in use
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     description: |
 *       Invalidates the user's JWT token by adding it to a blacklist.
 *       Once logged out, the token can no longer be used for authentication,
 *       even if it hasn't yet expired. This endpoint requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *             examples:
 *               success:
 *                 summary: Successful logout
 *                 value:
 *                   success: true
 *                   message: Logged out successfully
 *       400:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: No token provided
 *                 value:
 *                   success: false
 *                   error: No token provided
 *       401:
 *         description: Unauthorized - Invalid token
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Authentication]
 *     description: |
 *       Retrieves the profile information of the currently authenticated user.
 *       This endpoint requires a valid JWT token from a previous login.
 *       The user's ID is extracted from the token, and their profile is fetched from the database.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *             examples:
 *               success:
 *                 summary: Complete user profile
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 1
 *                     name: John Doe
 *                     email: john.doe@example.com
 *                     gender: MALE
 *                     dateOfBirth: "1990-01-01"
 *                     phone: "+237 680123456"
 *                     address: "123 Main Street, Yaoundé"
 *                     idCardNum: "ID12345678"
 *                     photo: "https://example.com/profiles/john.jpg"
 *                     userRoles: [
 *                       {
 *                         id: 1,
 *                         role: "ADMIN",
 *                         description: "Administrator with full access"
 *                       }
 *                     ]
 *                     createdAt: "2023-01-01T12:00:00Z"
 *                     updatedAt: "2023-01-01T12:00:00Z"
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export { }; 