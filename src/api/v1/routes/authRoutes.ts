import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// POST /auth/login - User login (JWT token generation)
router.post('/login', authController.login);

// POST /auth/register - Register a new user
router.post('/register', authController.register);

// GET /auth/me - Get current user’s profile
router.get('/me', authController.getProfile);

export default router;
