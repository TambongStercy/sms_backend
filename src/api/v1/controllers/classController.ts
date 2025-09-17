// src/api/v1/controllers/classController.ts
import { Request, Response } from 'express';
import * as classService from '../services/classService';
import * as feeService from '../services/feeService';  // Import feeService
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if the legacy mode is requested (for backward compatibility)
        if (req.finalQuery.legacy !== 'true') {
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
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

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

// Helper function to transform sub_class data (similar to subjectController)
const transformSubclass = (sub_class: any) => {
    const transformed: any = { ...sub_class }; // Clone the sub_class object

    // Rename sub_class_subjects to subjects
    if (transformed.sub_class_subjects && Array.isArray(transformed.sub_class_subjects)) {
        transformed.subjects = transformed.sub_class_subjects.map((ss: any) => {
            // Combine subject details with the coefficient from the join table
            if (!ss.subject) return null;
            return {
                ...ss.subject,
                coefficient: ss.coefficient // Add coefficient here
            };
        }).filter(Boolean); // Filter out nulls if subject was missing
        delete transformed.sub_class_subjects; // Remove original key
    }

    // Ensure class_master is included if present, otherwise null
    transformed.class_master = transformed.class_master || null;

    return transformed;
};

export const getAllSubclasses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Define allowed filters for sub_classes, adding the include flag
        const allowedFilters = ['name', 'id', 'classId', 'includeSubjects'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

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
        console.error('Error fetching sub_classes:', error);
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
            new_student_fee,
            old_student_fee,
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
        const classData: any = {
            name,
            level: level !== undefined ? parseInt(level) : undefined,
            new_student_fee: new_student_fee !== undefined ? parseFloat(new_student_fee) : undefined,
            old_student_fee: old_student_fee !== undefined ? parseFloat(old_student_fee) : undefined,
            miscellaneous_fee: miscellaneous_fee !== undefined ? parseFloat(miscellaneous_fee) : undefined,
            first_term_fee: first_term_fee !== undefined ? parseFloat(first_term_fee) : undefined,
            second_term_fee: second_term_fee !== undefined ? parseFloat(second_term_fee) : undefined,
            third_term_fee: third_term_fee !== undefined ? parseFloat(third_term_fee) : undefined
        };

        // Auto-calculate base_fee if term fees are provided
        const termFeesProvided = first_term_fee !== undefined || second_term_fee !== undefined || third_term_fee !== undefined;

        if (termFeesProvided) {
            // Calculate base_fee as sum of term fees (use 0 as default for missing term fees)
            const finalFirstTermFee = first_term_fee !== undefined ? parseFloat(first_term_fee) : 0;
            const finalSecondTermFee = second_term_fee !== undefined ? parseFloat(second_term_fee) : 0;
            const finalThirdTermFee = third_term_fee !== undefined ? parseFloat(third_term_fee) : 0;

            classData.base_fee = finalFirstTermFee + finalSecondTermFee + finalThirdTermFee;
        } else if (base_fee !== undefined) {
            // Only set base_fee manually if no term fees are provided
            classData.base_fee = parseFloat(base_fee);
        }

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
            new_student_fee,
            old_student_fee,
            miscellaneous_fee,
            first_term_fee,
            second_term_fee,
            third_term_fee
        } = req.body;

        // Prepare update data, converting potential string numbers
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (level !== undefined) updateData.level = parseInt(level);
        if (new_student_fee !== undefined) updateData.new_student_fee = parseFloat(new_student_fee);
        if (old_student_fee !== undefined) updateData.old_student_fee = parseFloat(old_student_fee);
        if (miscellaneous_fee !== undefined) updateData.miscellaneous_fee = parseFloat(miscellaneous_fee);
        if (first_term_fee !== undefined) updateData.first_term_fee = parseFloat(first_term_fee);
        if (second_term_fee !== undefined) updateData.second_term_fee = parseFloat(second_term_fee);
        if (third_term_fee !== undefined) updateData.third_term_fee = parseFloat(third_term_fee);

        // Auto-calculate base_fee if any term fees are provided
        const termFeesProvided = first_term_fee !== undefined || second_term_fee !== undefined || third_term_fee !== undefined;

        if (termFeesProvided) {
            // Get existing class data to fill in missing term fees
            const existingClass = await classService.getClassById(id);
            if (!existingClass) {
                res.status(404).json({ success: false, error: 'Class not found' });
                return;
            }

            // Use provided values or fall back to existing values
            const finalFirstTermFee = first_term_fee !== undefined ? parseFloat(first_term_fee) : existingClass.first_term_fee;
            const finalSecondTermFee = second_term_fee !== undefined ? parseFloat(second_term_fee) : existingClass.second_term_fee;
            const finalThirdTermFee = third_term_fee !== undefined ? parseFloat(third_term_fee) : existingClass.third_term_fee;

            // Calculate base_fee as sum of all term fees
            updateData.base_fee = finalFirstTermFee + finalSecondTermFee + finalThirdTermFee;
        } else if (base_fee !== undefined) {
            // Only set base_fee manually if no term fees are provided
            updateData.base_fee = parseFloat(base_fee);
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ success: false, error: 'No fields provided for update' });
            return;
        }

        const updatedClass = await classService.updateClass(id, updateData);

        // Check if any fee-related fields were updated
        const feeFieldsUpdated =
            base_fee !== undefined ||
            new_student_fee !== undefined ||
            old_student_fee !== undefined ||
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

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = parseInt(req.params.id);

        if (isNaN(classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid class ID format'
            });
            return;
        }

        // Check if class exists before attempting deletion
        const classExists = await classService.getClassById(classId);
        if (!classExists) {
            res.status(404).json({
                success: false,
                error: 'Class not found'
            });
            return;
        }

        await classService.deleteClass(classId);
        res.json({ success: true, message: 'Class deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting class:', error);
        if (error.message === 'CLASS_HAS_SUBCLASSES') {
            res.status(409).json({
                success: false,
                error: 'Cannot delete class, it has associated subclasses'
            });
        } else if (error.message === 'CLASS_HAS_ENROLLMENTS') {
            res.status(409).json({
                success: false,
                error: 'Cannot delete class, it has associated enrollments'
            });
        } else if (error.code === 'P2025') { // Prisma error: Record to delete not found
            res.status(404).json({
                success: false,
                error: 'Class not found'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete class due to an internal error'
            });
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
        const sub_classId = parseInt(req.params.subClassId);

        if (isNaN(classId) || isNaN(sub_classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }

        // Ensure the sub_class belongs to the specified class before attempting deletion
        const subClassExists = await classService.checkSubClassExists(sub_classId, classId);
        if (!subClassExists) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found or does not belong to the specified class'
            });
            return;
        }

        await classService.deleteSubClass(sub_classId);
        res.json({ success: true, message: 'Subclass deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting sub-class:', error);
        // Check for the specific error thrown by the service
        if (error.message === 'SUBCLASS_HAS_ENROLLMENTS') {
            res.status(409).json({
                success: false,
                error: 'Cannot be deleted, sub_class already has students'
            });
        } else if (error.code === 'P2025') { // Prisma error: Record to delete not found
            res.status(404).json({
                success: false,
                error: 'Subclass not found'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete sub_class due to an internal error'
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

        // Check if the sub_class exists and belongs to the class
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
 * Assign a class master to a sub_class
 * @param req Request with sub_class ID and user ID
 * @param res Response object
 */
export const assignClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const sub_classId = parseInt(req.params.sub_classId);
        const { user_id } = req.body;


        if (isNaN(sub_classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sub_class ID format'
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

        const updatedSubclass = await classService.assignClassMaster(sub_classId, parseInt(user_id));

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
 * Get the class master of a sub_class
 * @param req Request with sub_class ID
 * @param res Response object
 */
export const getSubclassClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const sub_classId = parseInt(req.params.sub_classId);

        if (isNaN(sub_classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sub_class ID format'
            });
            return;
        }

        const classMaster = await classService.getSubclassClassMaster(sub_classId);

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
 * Remove the class master from a sub_class
 * @param req Request with sub_class ID
 * @param res Response object
 */
export const removeClassMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const sub_classId = parseInt(req.params.sub_classId);

        if (isNaN(sub_classId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sub_class ID format'
            });
            return;
        }

        const updatedSubclass = await classService.removeClassMaster(sub_classId);

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
 * Get all subjects for a specific sub_class
 * @param req Request with sub_classId parameter
 * @param res Response object
 */
export const getSubclassSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const subClassId = parseInt(req.params.subClassId); // Match route param name

        if (isNaN(subClassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sub_class ID format'
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
        console.error(`Error fetching subjects for sub_class ${req.params.subClassId}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};
