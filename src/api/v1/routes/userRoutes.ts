import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/userDocs.ts

const router = Router();

// GET /users - List all users
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view all users
router.get('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), userController.getAllUsers);

// POST /users - Create a new user
// Only SUPER_MANAGER can create users
router.post('/', authenticate, authorize(['SUPER_MANAGER']), userController.createUser);

// GET /users/:id - Get user details
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view any user
// Users can view their own profile
router.get('/:id', authenticate, userController.getUserById);

// PUT /users/:id - Update user details
// SUPER_MANAGER can update any user
// Users can update their own profile
router.put('/:id', authenticate, userController.updateUser);

// DELETE /users/:id - Delete a user
// Only SUPER_MANAGER can delete users
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER']), userController.deleteUser);

// POST /users/:id/roles - Assign a role to a user
// Only SUPER_MANAGER can assign roles
router.post('/:id/roles', authenticate, authorize(['SUPER_MANAGER']), userController.assignRole);

// DELETE /users/:id/roles/:roleId - Remove a role from a user
// Only SUPER_MANAGER can remove roles
router.delete('/:id/roles/:roleId', authenticate, authorize(['SUPER_MANAGER']), userController.removeRole);

// POST /users/with-role - Create a new user with role and optional assignments
// Only SUPER_MANAGER can create users with roles
router.post('/with-role', authenticate, authorize(['SUPER_MANAGER']), userController.createUserWithRole);

export default router;
