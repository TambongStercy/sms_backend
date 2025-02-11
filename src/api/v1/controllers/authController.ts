// src/api/v1/controllers/authController.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';

interface AuthenticatedRequest extends Request {
    user?: { id: any }; // Adjust this based on your actual user object
}

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

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        // Assuming an authentication middleware sets req.user with the authenticated user's details.
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await authService.getProfile(userId);
        res.json(user);
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message });
    }
};
