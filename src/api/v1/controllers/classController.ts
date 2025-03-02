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

        const result = await classService.getAllClasses(paginationOptions, filterOptions);
        res.json(result);
    } catch (error: any) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createClass = async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ error: 'Class name is required' });
            return;
        }

        const newClass = await classService.createClass({ name });
        res.status(201).json(newClass);
    } catch (error: any) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getClassById = async (req: Request, res: Response): Promise<any> => {
    try {
        const classId = parseInt(req.params.id);

        if (isNaN(classId)) {
            res.status(400).json({ error: 'Invalid class ID format' });
            return;
        }

        const classData = await classService.getClassById(classId);

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
        const classId = parseInt(req.params.id);
        const { name } = req.body;

        if (isNaN(classId)) {
            res.status(400).json({ error: 'Invalid class ID format' });
            return;
        }

        if (!name) {
            res.status(400).json({ error: 'Subclass name is required' });
            return;
        }

        // Check if the class exists
        const classExists = await classService.getClassById(classId);
        if (!classExists) {
            res.status(404).json({ error: 'Class not found' });
            return;
        }

        const newSubClass = await classService.addSubClass(classId, { name });

        res.status(201).json(newSubClass);
    } catch (error: any) {
        console.error('Error adding sub-class:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubClass = async (req: Request, res: Response) => {
    try {
        const classId = parseInt(req.params.id);
        const subclassId = parseInt(req.params.subClassId);

        if (isNaN(classId) || isNaN(subclassId)) {
            res.status(400).json({ error: 'Invalid ID format' });
            return;
        }

        // Check if the subclass exists before deleting
        const subclass = await classService.checkSubClassExists(subclassId, classId);
        if (!subclass) {
            res.status(404).json({ error: 'Subclass not found or does not belong to the specified class' });
            return;
        }

        await classService.deleteSubClass(subclassId);

        res.json({
            success: true,
            message: 'Sub-class deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting sub-class:', error);
        res.status(500).json({ error: error.message });
    }
};
