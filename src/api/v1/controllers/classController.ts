// src/api/v1/controllers/classController.ts
import { Request, Response } from 'express';
import * as classService from '../services/classService';
import * as feeService from '../services/feeService';  // Import feeService
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if the legacy mode is requested (for backward compatibility)
        if (req.query.legacy !== 'true') {
            console.log(req.query, req.body);
            console.log('Legacy mode requested');
            const classes = await classService.getAllClassesWithSubclasses();
            res.json({
                success: true,
                data: classes
            });
            return;
        }

        // Define allowed filters for classes
        const allowedFilters = ['name', 'id', 'level'];

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

// Helper function to transform subclass data (similar to subjectController)
const transformSubclass = (subclass: any) => {
    const transformed: any = { ...subclass }; // Clone the subclass object

    // Rename subclass_subjects to subjects
    if (transformed.subclass_subjects && Array.isArray(transformed.subclass_subjects)) {
        transformed.subjects = transformed.subclass_subjects.map((ss: any) => {
            // Combine subject details with the coefficient from the join table
            if (!ss.subject) return null;
            return {
                ...ss.subject,
                coefficient: ss.coefficient // Add coefficient here
            };
        }).filter(Boolean); // Filter out nulls if subject was missing
        delete transformed.subclass_subjects; // Remove original key
    }

    // Ensure class_master is included if present, otherwise null
    transformed.class_master = transformed.class_master || null;

    return transformed;
};

export const getAllSubclasses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Define allowed filters for subclasses, adding the include flag
        const allowedFilters = ['name', 'id', 'classId', 'includeSubjects'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Service function now handles the include logic based on filterOptions
        const result = await classService.getAllSubclasses(paginationOptions, filterOptions);

        // Transform the data before sending response
        const transformedData = result.data.map(transformSubclass);

        // Return the result object, replacing the original data with transformed data
        res.json({
            success: true,
            ...result, // Spread pagination meta
            data: transformedData // Use transformed data
        });
    } catch (error: any) {
        console.error('Error fetching subclasses:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
    try {
        // Body is already converted to snake_case by middleware
        const {
            name,
            level,
            base_fee,
            new_student_add_fee,
            old_student_add_fee,
            miscellaneous_fee,
            first_term_fee,
            second_term_fee,
            third_term_fee
        } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                error: 'Class name is required'
            });
            return;
        }

        // Prepare data, converting potential string numbers from body to actual numbers
        const classData = {
            name,
            level: level !== undefined ? parseInt(level) : undefined,
            base_fee: base_fee !== undefined ? parseFloat(base_fee) : undefined,
            new_student_add_fee: new_student_add_fee !== undefined ? parseFloat(new_student_add_fee) : undefined,
            old_student_add_fee: old_student_add_fee !== undefined ? parseFloat(old_student_add_fee) : undefined,
            miscellaneous_fee: miscellaneous_fee !== undefined ? parseFloat(miscellaneous_fee) : undefined,
            first_term_fee: first_term_fee !== undefined ? parseFloat(first_term_fee) : undefined,
            second_term_fee: second_term_fee !== undefined ? parseFloat(second_term_fee) : undefined,
            third_term_fee: third_term_fee !== undefined ? parseFloat(third_term_fee) : undefined
        };

        const newClass = await classService.createClass(classData);
        // Response is converted to camelCase by middleware
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

export const getClassById = async (req: Request, res: Response): Promise<void> => {
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
            res.status(404).json({
                success: false,
                error: 'Class not found'
            });
            return;
        }
        // Response is converted to camelCase by middleware
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

export const updateClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid class ID format' });
            return;
        }

        // Body is already converted to snake_case by middleware
        const {
            name,
            level,
            base_fee,
            new_student_add_fee,
            old_student_add_fee,
            miscellaneous_fee,
            first_term_fee,
            second_term_fee,
            third_term_fee
        } = req.body;

        // Prepare update data, converting potential string numbers
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (level !== undefined) updateData.level = parseInt(level);
        if (base_fee !== undefined) updateData.base_fee = parseFloat(base_fee);
        if (new_student_add_fee !== undefined) updateData.new_student_add_fee = parseFloat(new_student_add_fee);
        if (old_student_add_fee !== undefined) updateData.old_student_add_fee = parseFloat(old_student_add_fee);
        if (miscellaneous_fee !== undefined) updateData.miscellaneous_fee = parseFloat(miscellaneous_fee);
        if (first_term_fee !== undefined) updateData.first_term_fee = parseFloat(first_term_fee);
        if (second_term_fee !== undefined) updateData.second_term_fee = parseFloat(second_term_fee);
        if (third_term_fee !== undefined) updateData.third_term_fee = parseFloat(third_term_fee);

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ success: false, error: 'No fields provided for update' });
            return;
        }

        const updatedClass = await classService.updateClass(id, updateData);

        // Check if any fee-related fields were updated
        const feeFieldsUpdated =
            base_fee !== undefined ||
            new_student_add_fee !== undefined ||
            old_student_add_fee !== undefined ||
            miscellaneous_fee !== undefined ||
            first_term_fee !== undefined ||
            second_term_fee !== undefined ||
            third_term_fee !== undefined;

        // If fee-related fields were updated, update all associated student fees
        if (feeFieldsUpdated) {
            try {
                const updatedCount = await feeService.updateFeesOnClassFeeChange(id);
                console.log(`Updated ${updatedCount} fee records for class ${id}`);
            } catch (feeError: any) {
                console.error('Error updating student fees:', feeError);
                // Don't fail the whole request if fee updates fail
                // Just log the error and continue
            }
        }

        // Response is converted to camelCase by middleware
        res.json({
            success: true,
            message: 'Class updated successfully',
            data: updatedClass
        });
    } catch (error: any) {
        console.error('Error updating class:', error);
        if (error.code === 'P2025') { // Prisma error code for record not found
            res.status(404).json({ success: false, error: 'Class not found' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const addSubClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = parseInt(req.params.id);
        const { name } = req.body; // Already snake_case

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
        // Response is converted to camelCase by middleware
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

export const deleteSubClass = async (req: Request, res: Response): Promise<void> => {
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

        // Ensure the subclass belongs to the specified class before attempting deletion
        const subClassExists = await classService.checkSubClassExists(subclassId, classId);
        if (!subClassExists) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found or does not belong to the specified class'
            });
            return;
        }

        await classService.deleteSubClass(subclassId);
        res.json({ success: true, message: 'Subclass deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting sub-class:', error);
        // Check for the specific error thrown by the service
        if (error.message === 'SUBCLASS_HAS_ENROLLMENTS') {
            res.status(409).json({
                success: false,
                error: 'Cannot be deleted, subclass already has students'
            });
        } else if (error.code === 'P2025') { // Prisma error: Record to delete not found
            res.status(404).json({
                success: false,
                error: 'Subclass not found'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete subclass due to an internal error'
            });
        }
    }
};

export const updateSubClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = parseInt(req.params.id);
        const subClassId = parseInt(req.params.subClassId);
        const { name } = req.body; // Already snake_case

        if (isNaN(classId) || isNaN(subClassId)) {
            res.status(400).json({ success: false, error: 'Invalid ID format' });
            return;
        }

        if (!name) {
            res.status(400).json({ success: false, error: 'Subclass name is required for update' });
            return;
        }

        // Check if the subclass exists and belongs to the class
        const existingSubclass = await classService.checkSubClassExists(subClassId, classId);
        if (!existingSubclass) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found or does not belong to the specified class'
            });
            return;
        }

        const updatedSubclass = await classService.updateSubClass(subClassId, { name });

        res.json({
            success: true,
            message: 'Subclass updated successfully',
            data: updatedSubclass
        });
    } catch (error: any) {
        console.error('Error updating sub-class:', error);
        if (error.code === 'P2025') { // Record not found
            res.status(404).json({ success: false, error: 'Subclass not found' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

/**
 * Assign a class master to a subclass
 * @param req Request with subclass ID and user ID
 * @param res Response object
 */
export const assignClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);
        const { user_id } = req.body;


        if (isNaN(subclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subclass ID format'
            });
            return;
        }

        if (!user_id) {
            res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }

        const updatedSubclass = await classService.assignClassMaster(subclassId, parseInt(user_id));

        res.json({
            success: true,
            data: updatedSubclass
        });
    } catch (error: any) {
        console.error('Error assigning class master:', error);
        const statusCode =
            error.message.includes('not found') ? 404 :
                error.message.includes('does not have a teacher role') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get the class master of a subclass
 * @param req Request with subclass ID
 * @param res Response object
 */
export const getSubclassClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);

        if (isNaN(subclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subclass ID format'
            });
            return;
        }

        const classMaster = await classService.getSubclassClassMaster(subclassId);

        res.json({
            success: true,
            data: classMaster
        });
    } catch (error: any) {
        console.error('Error fetching class master:', error);

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Remove the class master from a subclass
 * @param req Request with subclass ID
 * @param res Response object
 */
export const removeClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);

        if (isNaN(subclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subclass ID format'
            });
            return;
        }

        const updatedSubclass = await classService.removeClassMaster(subclassId);

        res.json({
            success: true,
            data: updatedSubclass
        });
    } catch (error: any) {
        console.error('Error removing class master:', error);

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all subjects for a specific subclass
 * @param req Request with subclassId parameter
 * @param res Response object
 */
export const getSubclassSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const subClassId = parseInt(req.params.subClassId); // Match route param name

        if (isNaN(subClassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subclass ID format'
            });
            return;
        }

        const subjects = await classService.getSubjectsForSubclass(subClassId);

        // Middleware handles case conversion for the response data
        res.json({
            success: true,
            data: subjects
        });
    } catch (error: any) {
        console.error(`Error fetching subjects for subclass ${req.params.subClassId}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};
