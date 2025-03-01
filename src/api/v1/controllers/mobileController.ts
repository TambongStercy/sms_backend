// src/api/v1/controllers/mobileController.ts
import { Request, Response } from 'express';
import * as mobileService from '../services/mobileService';

interface AuthenticatedRequest extends Request {
    user?: { id: any }; // Adjust this based on your actual user object
}

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // For now, return a basic dashboard structure
        // You can enhance this to fetch real data from various services
        const dashboard = {
            announcements: [],
            upcomingEvents: [],
            statistics: {
                attendance: 0,
                assignments: 0,
                fees: { paid: 0, pending: 0 }
            },
            quickLinks: []
        };

        res.json(dashboard);
    } catch (error: any) {
        console.error('Error fetching mobile dashboard:', error);
        res.status(500).json({ error: error.message });
    }
};

export const registerDevice = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { deviceToken, deviceType } = req.body;

        if (!deviceToken || !deviceType) {
            return res.status(400).json({ error: 'Device token and type are required' });
        }

        // For now, simply acknowledge the registration
        // In a real implementation, you would store this in the database
        res.json({
            success: true,
            message: 'Device registered successfully',
            deviceInfo: {
                userId: req.user?.id,
                deviceToken,
                deviceType
            }
        });
    } catch (error: any) {
        console.error('Error registering device:', error);
        res.status(500).json({ error: error.message });
    }
};

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
