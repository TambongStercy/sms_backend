// src/api/v1/controllers/classController.ts
import { Request, Response } from 'express';
import * as classService from '../services/classService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllClasses = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if the legacy mode is requested (for backward compatibility)
        if (req.query.legacy === 'true') {
            const classes = await classService.getAllClassesWithSubclasses();
            return res.json(classes);
        }

        // Define allowed filters for classes
        const allowedFilters = ['name', 'id'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const classes = await classService.getAllClasses(paginationOptions, filterOptions);
        res.json(classes);
    } catch (error: any) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createClass = async (req: Request, res: Response) => {
    try {
        const newClass = await classService.createClass(req.body);
        res.status(201).json(newClass);
    } catch (error: any) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getClassById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const classData = await classService.getClassById(id);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(classData);
    } catch (error: any) {
        console.error('Error fetching class:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addSubClass = async (req: Request, res: Response) => {
    try {
        const class_id = parseInt(req.params.id);
        const newSubClass = await classService.addSubClass(class_id, req.body);
        res.status(201).json(newSubClass);
    } catch (error: any) {
        console.error('Error adding sub-class:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubClass = async (req: Request, res: Response) => {
    try {
        const subClassId = parseInt(req.params.subClassId);
        await classService.deleteSubClass(subClassId);
        res.json({ message: 'Sub-class deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting sub-class:', error);
        res.status(500).json({ error: error.message });
    }
};
