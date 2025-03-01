// src/api/v1/controllers/authController.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { blacklistToken } from '../services/tokenBlacklistService';

/**
 * Handle user login
 * 
 * @param req - Express request object containing email and password in the body
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
};

/**
 * Register a new user
 * 
 * @param req - Express request object containing user details in the body
 * @param res - Express response object
 */
export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get the profile of the currently authenticated user
 * 
 * @param req - Express request object with authenticated user info
 * @param res - Express response object
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        // The user object is set by the authentication middleware
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await authService.getProfile(userId);
        res.json(user);
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle user logout - invalidates the current token
 * 
 * @param req - Express request object with authenticated user info
 * @param res - Express response object
 */
export const logout = (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if auth header exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(400).json({ message: 'No token provided' });
            return;
        }

        // Extract token from header
        const token = authHeader.split(' ')[1];

        // Add token to blacklist
        blacklistToken(token);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: error.message || 'Error during logout' });
    }
};
