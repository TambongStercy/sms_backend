// src/api/v1/controllers/mobileController.ts
import { Request, Response } from 'express';
import * as mobileService from '../services/mobileService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

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

        res.json({
            success: true,
            data: dashboard
        });
    } catch (error: any) {
        console.error('Error fetching mobile dashboard:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const registerDevice = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { device_token, device_type } = req.body;

        if (!device_token || !device_type) {
            return res.status(400).json({
                success: false,
                error: 'Device token and type are required'
            });
        }

        // For now, simply acknowledge the registration
        // In a real implementation, you would store this in the database
        res.json({
            success: true,
            message: 'Device registered successfully',
            data: {
                userId: req.user?.id,
                device_token,
                device_type
            }
        });
    } catch (error: any) {
        console.error('Error registering device:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized - User not authenticated properly'
            });
            return;
        }

        // Parse finalQuery parameters
        const page = req.finalQuery.page ? parseInt(req.finalQuery.page as string) : 1;
        const limit = req.finalQuery.limit ? parseInt(req.finalQuery.limit as string) : 20;
        const status = req.finalQuery.status as string || 'all';

        // Use empty array as fallback if user has no notifications
        let notifications: any[] = [];

        try {
            notifications = await mobileService.getNotifications(Number(req.user.id), status);

            // Note: Actual pagination and filtering is not fully implemented in the service
            // This is a placeholder for future implementation
        } catch (notifError) {
            console.warn('Error fetching notifications, using empty array:', notifError);
        }

        // For now, return all notifications with pagination metadata
        // In a real implementation, you would apply actual pagination and filtering
        res.json({
            success: true,
            data: notifications,
            meta: {
                total: notifications.length,
                page: page,
                limit: limit,
                totalPages: Math.ceil(notifications.length / limit) || 1
            }
        });
    } catch (error: any) {
        console.error('Error fetching mobile notifications:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const syncData = async (req: Request, res: Response) => {
    try {
        const syncResult = await mobileService.syncData(req.body);
        res.json({
            success: true,
            data: syncResult
        });
    } catch (error: any) {
        console.error('Error syncing data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
