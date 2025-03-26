// src/api/v1/controllers/classController.ts
import { Request, Response } from 'express';
import * as classService from '../services/classService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllClasses = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if the legacy mode is requested (for backward compatibility)
        if (req.query.legacy === 'true') {
            const classes = await classService.getAllClassesWithSubclasses();
            return res.json({
                success: true,
                data: classes
            });
        }

        // Define allowed filters for classes
        const allowedFilters = ['name', 'id'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const result = await classService.getAllClasses(paginationOptions, filterOptions);
        res.json({
            success: true,
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching classes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getAllSubclasses = async (req: Request, res: Response): Promise<any> => {
    try {
        // Define allowed filters for subclasses
        const allowedFilters = ['name', 'id', 'classId'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const result = await classService.getAllSubclasses(paginationOptions, filterOptions);

        // Format the response to camelCase for consistent API
        const formattedData = result.data.map(subclass => {
            const formatted: any = {
                ...subclass,
                classId: subclass.class_id
            };

            // Include class data if available
            if ('class' in subclass) {
                formatted.class = subclass.class;
            }

            return formatted;
        });

        res.json({
            success: true,
            data: formattedData,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching subclasses:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createClass = async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const { name, level, fee_amount } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                error: 'Class name is required'
            });
            return;
        }

        const classData = {
            name,
            level: level !== undefined ? parseInt(level) : undefined,
            fee_amount: fee_amount !== undefined ? parseFloat(fee_amount) : undefined
        };

        const newClass = await classService.createClass(classData);
        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    } catch (error: any) {
        console.error('Error creating class:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getClassById = async (req: Request, res: Response): Promise<any> => {
    try {
        const classId = parseInt(req.params.id);

        if (isNaN(classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid class ID format'
            });
            return;
        }

        const classData = await classService.getClassById(classId);

        if (!classData) {
            return res.status(404).json({
                success: false,
                error: 'Class not found'
            });
        }

        res.json({
            success: true,
            data: classData
        });
    } catch (error: any) {
        console.error('Error fetching class:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const addSubClass = async (req: Request, res: Response) => {
    try {
        const classId = parseInt(req.params.id);
        const { name } = req.body;

        if (isNaN(classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid class ID format'
            });
            return;
        }

        if (!name) {
            res.status(400).json({
                success: false,
                error: 'Subclass name is required'
            });
            return;
        }

        // Check if the class exists
        const classExists = await classService.getClassById(classId);
        if (!classExists) {
            res.status(404).json({
                success: false,
                error: 'Class not found'
            });
            return;
        }

        const newSubClass = await classService.addSubClass(classId, { name });

        res.status(201).json({
            success: true,
            message: 'Subclass created successfully',
            data: newSubClass
        });
    } catch (error: any) {
        console.error('Error adding sub-class:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteSubClass = async (req: Request, res: Response) => {
    try {
        const classId = parseInt(req.params.id);
        const subclassId = parseInt(req.params.subClassId);

        if (isNaN(classId) || isNaN(subclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }

        // Check if the subclass exists before deleting
        const subclass = await classService.checkSubClassExists(subclassId, classId);
        if (!subclass) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found or does not belong to the specified class'
            });
            return;
        }

        await classService.deleteSubClass(subclassId);

        res.json({
            success: true,
            message: 'Subclass deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting sub-class:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
