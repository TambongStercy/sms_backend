import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /users - List all users
// Only ADMIN, PRINCIPAL, VICE_PRINCIPAL can view all users
router.get('/', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), userController.getAllUsers);

// POST /users - Create a new user
// Only ADMIN can create users
router.post('/', authenticate, authorize(['ADMIN']), userController.createUser);

// GET /users/:id - Get user details
// ADMIN, PRINCIPAL, VICE_PRINCIPAL can view any user
// Users can view their own profile
router.get('/:id', authenticate, userController.getUserById);

// PUT /users/:id - Update user details
// ADMIN can update any user
// Users can update their own profile
router.put('/:id', authenticate, userController.updateUser);

// DELETE /users/:id - Delete a user
// Only ADMIN can delete users
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deleteUser);

// POST /users/:id/roles - Assign a role to a user
// Only ADMIN can assign roles
router.post('/:id/roles', authenticate, authorize(['ADMIN']), userController.assignRole);

// DELETE /users/:id/roles/:roleId - Remove a role from a user
// Only ADMIN can remove roles
router.delete('/:id/roles/:roleId', authenticate, authorize(['ADMIN']), userController.removeRole);

export default router;
