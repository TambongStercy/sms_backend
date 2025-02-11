// src/api/v1/controllers/mobileController.ts
import { Request, Response } from 'express';
import * as mobileService from '../services/mobileService';

interface AuthenticatedRequest extends Request {
    user?: { id: any }; // Adjust this based on your actual user object
}

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notifications = await mobileService.getNotifications(req.user?.id);
        res.json(notifications);
    } catch (error: any) {
        console.error('Error fetching mobile notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

export const syncData = async (req: Request, res: Response) => {
    try {
        const result = await mobileService.syncData(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Error syncing data:', error);
        res.status(500).json({ error: error.message });
    }
};
