import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';
import { authAuditMiddleware } from '../middleware/auditTrail.middleware';

// Swagger documentation can be found in src/config/swagger/docs/authDocs.ts

const router = Router();

// POST /auth/login - Authenticate user and get token
router.post('/login', authAuditMiddleware, authController.login);

// POST /auth/register - Register a new user
router.post('/register', authController.register);

// POST /auth/logout - Invalidate a user's token
router.post('/logout', authenticate, authAuditMiddleware, authController.logout);

// POST /auth/change-password - Change the authenticated user's password
router.post('/change-password', authenticate, authAuditMiddleware, authController.changePassword);

// GET /auth/me - Get current user's profile
router.get('/me', authenticate, authController.getProfile);

export default router;
