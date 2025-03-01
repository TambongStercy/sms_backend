// src/api/v1/controllers/studentController.ts
import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for students
        const allowedFilters = ['name', 'gender', 'matricule', 'id'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Determine if we want students with enrollment info
        const withEnrollment = req.query.withEnrollment === 'true';

        let result;
        if (withEnrollment) {
            // Get academic year from query if provided
            const academicYearId = req.query.academic_year_id ?
                parseInt(req.query.academic_year_id as string) : undefined;

            // Add class and subclass filters for enrollment query
            const enrollmentFilters = {
                ...filterOptions,
                ...(req.query.class_id ? { class_id: req.query.class_id } : {}),
                ...(req.query.subclass_id ? { subclass_id: req.query.subclass_id } : {})
            };

            result = await studentService.getAllStudentsWithCurrentEnrollment(
                academicYearId,
                paginationOptions,
                enrollmentFilters
            );
        } else {
            result = await studentService.getAllStudents(paginationOptions, filterOptions);
        }

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const newStudent = await studentService.createStudent(req.body);
        res.status(201).json(newStudent);
    } catch (error: any) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getStudentById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const student = await studentService.getStudentById(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error: any) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: error.message });
    }
};

export const linkParent = async (req: Request, res: Response) => {
    try {
        const student_id = parseInt(req.params.id);
        const newLink = await studentService.linkParent(student_id, req.body);
        res.status(201).json(newLink);
    } catch (error: any) {
        console.error('Error linking parent:', error);
        res.status(500).json({ error: error.message });
    }
};

export const enrollStudent = async (req: Request, res: Response) => {
    try {
        const student_id = parseInt(req.params.id);
        const enrollment = await studentService.enrollStudent(student_id, req.body);
        res.status(201).json(enrollment);
    } catch (error: any) {
        console.error('Error enrolling student:', error);
        res.status(500).json({ error: error.message });
    }
};
