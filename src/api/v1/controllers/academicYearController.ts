// src/api/v1/controllers/academicYearController.ts
import { Request, Response } from 'express';
import * as academicYearService from '../services/academicYearService';

export const getAllAcademicYears = async (req: Request, res: Response) => {
    try {
        const years = await academicYearService.getAllAcademicYears();
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
        const newYear = await academicYearService.createAcademicYear(req.body);
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
        const updatedYear = await academicYearService.updateAcademicYear(id, req.body);
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

export const setDefaultAcademicYear = async (req: Request, res: Response): Promise<any> => {
    try {
        const yearId = parseInt(req.params.id);

        // Check if the academic year exists
        const year = await academicYearService.getAcademicYearById(yearId);
        if (!year) {
            return res.status(404).json({
                success: false,
                error: 'Academic year not found'
            });
        }

        // Set as default (implement this method in your service)
        await academicYearService.setAsDefault(yearId);

        res.json({
            success: true,
            message: `Academic year ${year.start_date} set as default`,
            data: year
        });
    } catch (error: any) {
        console.error('Error setting default academic year:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const addTerm = async (req: Request, res: Response): Promise<any> => {
    try {
        const yearId = parseInt(req.params.id);
        const { name, startDate, endDate } = req.body;

        // Validate required fields
        if (!name || !startDate || !endDate) {
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

        // Add term to academic year (implement this method in your service)
        const term = await academicYearService.addTermToYear(yearId, {
            name,
            start_date: new Date(startDate),
            end_date: new Date(endDate)
        });

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
