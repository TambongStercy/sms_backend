// src/api/v1/controllers/authController.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { blacklistToken } from '../services/tokenBlacklistService';

/**
 * Handle user login
 * 
 * @param req - Express request object containing email/matricule and password in the body
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, matricule, password } = req.body;

        if ((!email && !matricule) || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email/matricule and password are required'
            });
        }

        const result = await authService.login(req.body);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
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
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }

        const user = await authService.getProfile(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(400).json({
                success: false,
                error: 'No token provided'
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        blacklistToken(token);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error during logout'
        });
    }
};
