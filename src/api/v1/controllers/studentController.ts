// src/api/v1/controllers/studentController.ts
import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for students using snake_case
        const allowedFilters = ['name', 'gender', 'matricule', 'id'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Determine if we want students with enrollment info
        const withEnrollment = req.query.with_enrollment === 'true';

        let result;
        if (withEnrollment) {
            // Get academic year from query - middleware handles conversion
            const academic_year_id = req.query.academic_year_id ?
                parseInt(req.query.academic_year_id as string) : undefined;

            // Add class and subclass filters for enrollment query
            const enrollmentFilters = {
                ...filterOptions,
                ...(req.query.class_id ? { class_id: req.query.class_id } : {}),
                ...(req.query.subclass_id ? { subclass_id: req.query.subclass_id } : {})
            };

            result = await studentService.getAllStudentsWithCurrentEnrollment(
                academic_year_id,
                paginationOptions,
                enrollmentFilters
            );
        } else {
            result = await studentService.getAllStudents(paginationOptions, filterOptions);
        }

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        // Use the body directly - middleware handles conversion
        const studentData = req.body;
        const newStudent = await studentService.createStudent(studentData);

        res.status(201).json({
            success: true,
            data: newStudent
        });
    } catch (error: any) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getStudentById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const student = await studentService.getStudentById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error: any) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const linkParent = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.id);

        // Use the body directly with student_id - middleware handles conversion
        const linkData = {
            ...req.body,
            student_id: studentId
        };

        const newLink = await studentService.linkParent(studentId, linkData);
        res.status(201).json({
            success: true,
            data: newLink
        });
    } catch (error: any) {
        console.error('Error linking parent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const enrollStudent = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.id);

        // Use the body directly - middleware handles conversion
        const enrollmentData = req.body;

        const enrollment = await studentService.enrollStudent(studentId, enrollmentData);
        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error: any) {
        console.error('Error enrolling student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
