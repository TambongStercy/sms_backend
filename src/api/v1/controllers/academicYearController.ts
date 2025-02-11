// src/api/v1/controllers/academicYearController.ts
import { Request, Response } from 'express';
import * as academicYearService from '../services/academicYearService';

export const getAllAcademicYears = async (req: Request, res: Response) => {
    try {
        const years = await academicYearService.getAllAcademicYears();
        res.json(years);
    } catch (error: any) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createAcademicYear = async (req: Request, res: Response) => {
    try {
        const newYear = await academicYearService.createAcademicYear(req.body);
        res.status(201).json(newYear);
    } catch (error: any) {
        console.error('Error creating academic year:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAcademicYearById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const year = await academicYearService.getAcademicYearById(id);
        if (!year) {
            return res.status(404).json({ error: 'Academic year not found' });
        }
        res.status(200).json(year);
    } catch (error: any) {
        console.error('Error fetching academic year:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedYear = await academicYearService.updateAcademicYear(id, req.body);
        res.json(updatedYear);
    } catch (error: any) {
        console.error('Error updating academic year:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await academicYearService.deleteAcademicYear(id);
        res.json({ message: 'Academic year deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting academic year:', error);
        res.status(500).json({ error: error.message });
    }
};
