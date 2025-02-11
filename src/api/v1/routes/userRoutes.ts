import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// GET /users - List all users
router.get('/', userController.getAllUsers);

// POST /users - Create a new user
router.post('/', userController.createUser);

// GET /users/:id - Get user details
router.get('/:id', userController.getUserById);

// PUT /users/:id - Update user details
router.put('/:id', userController.updateUser);

// DELETE /users/:id - Delete a user
router.delete('/:id', userController.deleteUser);

// POST /users/:id/roles - Assign a role to a user
router.post('/:id/roles', userController.assignRole);

// DELETE /users/:id/roles/:roleId - Remove a role from a user
router.delete('/:id/roles/:roleId', userController.removeRole);

export default router;
