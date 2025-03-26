// src/api/v1/controllers/academicYearController.ts
import { Request, Response } from 'express';
import * as academicYearService from '../services/academicYearService';

export const getAllAcademicYears = async (req: Request, res: Response) => {
    try {
        const years = await academicYearService.getAllAcademicYears();

        // Response will be automatically converted to camelCase by middleware
        res.json({
            success: true,
            data: years
        });
    } catch (error: any) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createAcademicYear = async (req: Request, res: Response) => {
    try {
        // No need to convert - middleware already converts to snake_case
        const { start_date, end_date, name } = req.body;

        const newYear = await academicYearService.createAcademicYear({
            start_date,
            end_date,
            name,
        });

        // Response will be automatically converted to camelCase by middleware
        res.status(201).json({
            success: true,
            data: newYear
        });
    } catch (error: any) {
        console.error('Error creating academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getAcademicYearById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const year = await academicYearService.getAcademicYearById(id);
        if (!year) {
            return res.status(404).json({
                success: false,
                error: 'Academic year not found'
            });
        }

        // Response will be automatically converted to camelCase by middleware
        res.status(200).json({
            success: true,
            data: year
        });
    } catch (error: any) {
        console.error('Error fetching academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { start_date, end_date } = req.body;

        const updatedYear = await academicYearService.updateAcademicYear(id, {
            start_date,
            end_date
        });

        // Response will be automatically converted to camelCase by middleware
        res.json({
            success: true,
            data: updatedYear
        });
    } catch (error: any) {
        console.error('Error updating academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await academicYearService.deleteAcademicYear(id);
        res.json({
            success: true,
            message: 'Academic year deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const addTerm = async (req: Request, res: Response): Promise<any> => {
    try {
        const yearId = parseInt(req.params.id);
        const { name, start_date, end_date } = req.body;

        // Validate required fields
        if (!name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'Term name, start date, and end date are required'
            });
        }

        // Check if the academic year exists
        const year = await academicYearService.getAcademicYearById(yearId);
        if (!year) {
            return res.status(404).json({
                success: false,
                error: 'Academic year not found'
            });
        }

        // Add term to academic year
        const term = await academicYearService.addTermToYear(yearId, {
            name,
            start_date: new Date(start_date),
            end_date: new Date(end_date)
        });

        // Response will be automatically converted to camelCase by middleware
        res.status(201).json({
            success: true,
            message: `Term "${name}" added to academic year ${year.start_date}`,
            data: term
        });
    } catch (error: any) {
        console.error('Error adding term to academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
