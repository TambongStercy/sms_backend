// src/api/v1/controllers/communicationController.ts
import { Request, Response } from 'express';
import * as communicationService from '../services/communicationService';
import { getAcademicYearId } from '../../../utils/academicYear'; // Import the utility
import { extractPaginationAndFilters } from '../../../utils/pagination'; // Import pagination utility

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for announcements
        const allowedFilters = ['audience', 'academicYearId', 'title']; // Add other filters as needed

        // Extract pagination and filter parameters
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        // Call the service function, passing pagination and filters
        // The service function now handles pagination and returns the standard PaginatedResult
        const result = await communicationService.getAnnouncements(paginationOptions, filterOptions);

        res.json({
            success: true,
            ...result // Spread the result { data: [...], meta: {...} }
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

        const { title, message, audience, academicYearId: providedAcademicYearId } = req.body;

        // Validate required fields
        if (!title || !message || !audience) {
            return res.status(400).json({
                success: false,
                error: 'Title, message, and audience are required fields'
            });
        }

        let determinedAcademicYearId: number | undefined = undefined;
        if (providedAcademicYearId !== undefined && providedAcademicYearId !== null) {
            const parsedId = parseInt(providedAcademicYearId);
            if (!isNaN(parsedId)) {
                determinedAcademicYearId = parsedId;
            } else {
                console.warn(`Invalid academicYearId provided: ${providedAcademicYearId}. Defaulting to current year.`);
                // Fall through to get current year by leaving determinedAcademicYearId as undefined
            }
        }

        // If no valid ID was provided, get the current academic year ID
        if (determinedAcademicYearId === undefined) {
            // getAcademicYearId returns number | null
            const currentYearId = await getAcademicYearId();
            // Convert null to undefined to match service expectation
            determinedAcademicYearId = currentYearId === null ? undefined : currentYearId;
        }

        // Prepare data for the service
        const announcementData = {
            title,
            message,
            audience,
            created_by_id: req.user.id,
            // Pass the determined ID (now number | undefined)
            academic_year_id: determinedAcademicYearId
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

export const updateAnnouncement = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid Announcement ID' });
        }

        // Consider adding validation for the request body fields
        const updateData = req.body;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, error: 'No update data provided' });
        }

        const updatedAnnouncement = await communicationService.updateAnnouncement(id, updateData);

        if (!updatedAnnouncement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: updatedAnnouncement
        });
    } catch (error: any) {
        console.error(`Error updating announcement ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid Announcement ID' });
        }

        const deletedAnnouncement = await communicationService.deleteAnnouncement(id);

        if (!deletedAnnouncement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error: any) {
        console.error(`Error deleting announcement ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
