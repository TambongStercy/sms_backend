// src/api/v1/controllers/communicationController.ts
import { Request, Response } from 'express';
import * as communicationService from '../services/communicationService';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await communicationService.getAnnouncements(req.query);
        res.json({
            success: true,
            data: announcements
        });
    } catch (error: any) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        // Add the authenticated user's ID as the creator
        const announcementData = {
            ...req.body,
            created_by_id: req.user.id
        };

        const newAnnouncement = await communicationService.createAnnouncement(announcementData);
        res.status(201).json({
            success: true,
            data: newAnnouncement
        });
    } catch (error: any) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const sendNotification = async (req: Request, res: Response) => {
    try {
        const notification = await communicationService.sendNotification(req.body);
        res.status(201).json({
            success: true,
            message: 'Notification sent successfully',
            data: notification
        });
    } catch (error: any) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
