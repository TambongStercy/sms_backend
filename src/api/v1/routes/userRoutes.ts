import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users with optional filtering. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Users]
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
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort results by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (ascending or descending)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter users by name (case insensitive, supports partial matching)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter users by email
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *         description: Filter users by gender
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER, BURSAR, STUDENT, PARENT]
 *         description: Filter users by role
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter users by phone number
 *       - in: query
 *         name: include_roles
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include user roles in the response
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of users matching the filters
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
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
// GET /users - List all users
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can view all users
router.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), userController.getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user. Only accessible by ADMIN.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - gender
 *               - date_of_birth
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed)
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 description: User's gender
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (YYYY-MM-DD)
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's physical address
 *           example:
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             password: "securepassword123"
 *             gender: "Male"
 *             date_of_birth: "1980-01-15"
 *             phone: "+123456789"
 *             address: "123 Main St, Douala"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *       409:
 *         description: Conflict - Email already exists
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
// POST /users - Create a new user
// Only ADMIN can create users
// router.post('/', authenticate, authorize(['ADMIN']), userController.createUser);
router.post('/', userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details
 *     description: Retrieves details of a specific user by ID. ADMIN, PRINCIPAL, VICE_PRINCIPAL can view any user. Users can view their own profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have permission to view this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
// GET /users/:id - Get user details
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can view any user
// Users can view their own profile
router.get('/:id', authenticate, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Updates details of a specific user by ID. ADMIN can update any user. Users can update their own profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed)
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 description: User's gender
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (YYYY-MM-DD)
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's physical address
 *           example:
 *             name: "John Doe"
 *             phone: "+234567890"
 *             address: "456 New St, Douala"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *         description: Forbidden - User does not have permission to update this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Email already exists
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
// PUT /users/:id - Update user details
// ADMIN can update any user
// Users can update their own profile
router.put('/:id', authenticate, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a specific user by ID. Only accessible by ADMIN.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
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
 *         description: User not found
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
// DELETE /users/:id - Delete a user
// Only ADMIN can delete users
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deleteUser);

/**
 * @swagger
 * /users/{id}/roles:
 *   post:
 *     summary: Assign a role to a user
 *     description: Assigns a specific role to a user. Only accessible by ADMIN.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER, BURSAR, STUDENT, PARENT]
 *                 description: Role to assign to the user
 *               academic_year_id:
 *                 type: integer
 *                 description: Academic year ID (optional, used for roles tied to an academic year)
 *           example:
 *             role: "TEACHER"
 *             academic_year_id: 1
 *     responses:
 *       201:
 *         description: Role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 academic_year_id:
 *                   type: integer
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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
 *         description: User or academic year not found
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
// POST /users/:id/roles - Assign a role to a user
// Only ADMIN can assign roles
// router.post('/:id/roles', authenticate, authorize(['ADMIN']), userController.assignRole);
router.post('/:id/roles', userController.assignRole);

/**
 * @swagger
 * /users/{id}/roles/{roleId}:
 *   delete:
 *     summary: Remove a role from a user
 *     description: Removes a specific role from a user. Only accessible by ADMIN.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER, BURSAR, STUDENT, PARENT]
 *         description: Role to remove (enum value)
 *     responses:
 *       200:
 *         description: Role removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role removed successfully"
 *                 removedCount:
 *                   type: integer
 *                   description: Number of role assignments removed
 *                   example: 1
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
 *         description: User or role not found
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
// DELETE /users/:id/roles/:roleId - Remove a role from a user
// Only ADMIN can remove roles
// router.delete('/:id/roles/:roleId', authenticate, authorize(['ADMIN']), userController.removeRole);
router.delete('/:id/roles/:roleId', userController.removeRole);

export default router;
