// src/api/v1/controllers/subjectController.ts
import { Request, Response } from 'express';
import * as subjectService from '../services/subjectService';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import { Subject, SubjectTeacher, SubclassSubject } from '@prisma/client'; // Import necessary types

// Helper function to transform subject data
const transformSubject = (subject: any) => {
    const transformed: any = { ...subject }; // Clone the subject object

    // Rename subject_teachers to teachers
    if (transformed.subject_teachers) {
        transformed.teachers = transformed.subject_teachers.map((st: any) => st.teacher).filter(Boolean); // Extract teacher info and filter nulls if any
        delete transformed.subject_teachers; // Remove original key
    }

    // Rename subclass_subjects to subclasses, including coefficient
    if (transformed.subclass_subjects) {
        transformed.subclasses = transformed.subclass_subjects.map((ss: any) => {
            // Check if subclass exists before spreading
            if (!ss.subclass) return null;
            return {
                ...ss.subclass,
                coefficient: ss.coefficient // Add coefficient from the join table
            };
        }).filter(Boolean); // Filter out any null entries if subclass was missing
        delete transformed.subclass_subjects; // Remove original key
    }

    return transformed;
};

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const allowedFilters = ['name', 'category', 'id', 'include_teachers', 'include_subclasses'];
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);
        const processedFilters: any = { ...filterOptions };
        const include: any = {};

        // Setup includes based on query params
        if (filterOptions?.include_teachers === 'true') {
            include.subject_teachers = {
                include: {
                    teacher: true
                }
            };
            delete processedFilters.include_teachers;
        }

        if (filterOptions?.include_subclasses === 'true') {
            include.subclass_subjects = {
                include: {
                    subclass: {
                        include: {
                            class: true
                        }
                    }
                }
            };
            delete processedFilters.include_subclasses;
        }

        const result = await subjectService.getAllSubjects(paginationOptions, processedFilters, include);

        // Transform the data array within the result
        const transformedData = result.data.map(transformSubject);


        // Return the result object, replacing the original data with transformed data
        res.json({
            success: true,
            ...result, // Spread the pagination fields (total, limit, offset, etc.)
            data: transformedData // Override the data field with transformed data
        });
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createSubject = async (req: Request, res: Response) => {
    try {
        const newSubject = await subjectService.createSubject(req.body);
        res.status(201).json({
            success: true,
            data: newSubject
        });
    } catch (error: any) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const assignTeacher = async (req: Request, res: Response) => {
    try {
        const subjectId = parseInt(req.params.id);
        const teacher_id = req.body.teacher_id;

        if (!teacher_id) {
            res.status(400).json({
                success: false,
                error: 'Teacher ID is required'
            });
            return;
        }

        const teacher = await subjectService.assignTeacher(subjectId, {
            teacher_id
        });

        res.status(201).json({
            success: true,
            message: 'Teacher assigned successfully',
            data: {
                teacher
            }
        });
    } catch (error: any) {
        console.error('Error assigning teacher:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const linkSubjectToSubClass = async (req: Request, res: Response) => {
    try {
        const subjectId = parseInt(req.params.id);
        const { subclass_id, coefficient } = req.body;

        if (!subclass_id || !coefficient) {
            res.status(400).json({
                success: false,
                error: 'Subclass ID, coefficient, and main teacher ID are required'
            });
            return;
        }

        const link = await subjectService.linkSubjectToSubClass(subjectId, {
            subclass_id,
            coefficient
        });

        res.status(201).json({
            success: true,
            data: link
        });
    } catch (error: any) {
        console.error('Error linking subject to sub-class:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getSubjectById = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);
        // Service function fetches includes by default
        const subject = await subjectService.getSubjectById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found'
            });
        }

        // Transform the single subject data
        const transformedSubject = transformSubject(subject);

        res.json({
            success: true,
            data: transformedSubject
        });
    } catch (error: any) {
        console.error('Error fetching subject:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateSubject = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);
        const updatedData = req.body;

        // Check if subject exists
        const existingSubject = await subjectService.getSubjectById(subjectId);
        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found'
            });
        }

        // Update the subject
        const updatedSubject = await subjectService.updateSubject(subjectId, updatedData);

        res.json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject
        });
    } catch (error: any) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteSubject = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);

        // Check if subject exists
        const existingSubject = await subjectService.getSubjectById(subjectId);
        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found'
            });
        }

        // Delete the subject
        await subjectService.deleteSubject(subjectId);

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Assign a subject to all subclasses of a class
 * @param req Request object containing class_id, subject_id, coefficient
 * @param res Response object
 */
export const assignSubjectToClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = parseInt(req.params.classId);
        const subjectId = parseInt(req.params.subjectId);
        const { coefficient } = req.body;

        // Validate inputs
        if (isNaN(classId) || isNaN(subjectId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid class ID or subject ID'
            });
            return;
        }

        if (!coefficient) {
            res.status(400).json({
                success: false,
                error: 'Coefficient are required'
            });
            return;
        }

        // Call service to assign subject to all subclasses
        const result = await subjectService.assignSubjectToClass(
            classId,
            subjectId,
            {
                coefficient: parseFloat(coefficient)
            }
        );

        res.status(201).json({
            success: true,
            message: `Subject successfully assigned to all subclasses of class ID ${classId}`,
            data: result
        });
    } catch (error: any) {
        console.error('Error assigning subject to class:', error);

        if (error.message.includes('No subclasses found') ||
            error.message.includes('Subject with ID') ||
            error.message.includes('Teacher with ID')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: `Failed to assign subject to class: ${error.message}`
        });
    }
};
