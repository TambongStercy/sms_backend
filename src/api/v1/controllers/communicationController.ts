// src/api/v1/controllers/communicationController.ts
import { Request, Response } from 'express';
import * as communicationService from '../services/communicationService';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await communicationService.getAnnouncements(req.query);
        res.json(announcements);
    } catch (error: any) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const newAnnouncement = await communicationService.createAnnouncement(req.body);
        res.status(201).json(newAnnouncement);
    } catch (error: any) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: error.message });
    }
};

export const sendNotification = async (req: Request, res: Response) => {
    try {
        const notification = await communicationService.sendNotification(req.body);
        res.status(201).json(notification);
    } catch (error: any) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
};
