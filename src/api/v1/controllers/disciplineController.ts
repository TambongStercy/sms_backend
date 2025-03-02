// src/api/v1/controllers/disciplineController.ts
import { Request, Response } from 'express';
import * as disciplineService from '../services/disciplineService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllDisciplineIssues = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for discipline issues
        const allowedFilters = [
            'student_id',
            'class_id',
            'subclass_id',
            'start_date',
            'end_date',
            'description',
            'include_assigned_by',
            'include_reviewed_by',
            'include_student'
        ];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Get academic year from query if provided
        const academicYearId = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const result = await disciplineService.getAllDisciplineIssues(
            paginationOptions,
            filterOptions,
            academicYearId
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching discipline issues:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const recordStudentAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await disciplineService.recordStudentAttendance(req.body);
        res.status(201).json({
            success: true,
            message: 'Student attendance recorded successfully',
            data: attendance
        });
    } catch (error: any) {
        console.error('Error recording student attendance:', error);

        // Determine appropriate status code based on error message
        let statusCode = 500;
        if (error.message.includes('not enrolled')) {
            statusCode = 404;
        } else if (error.message.includes('already exists')) {
            statusCode = 409;
        } else if (error.message.includes('Invalid')) {
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

export const recordTeacherAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await disciplineService.recordTeacherAttendance(req.body);
        res.status(201).json({
            success: true,
            message: 'Teacher attendance recorded successfully',
            data: attendance
        });
    } catch (error: any) {
        console.error('Error recording teacher attendance:', error);

        // Determine appropriate status code based on error message
        let statusCode = 500;
        if (error.message.includes('not found')) {
            statusCode = 404;
        } else if (error.message.includes('already exists')) {
            statusCode = 409;
        } else if (error.message.includes('Invalid')) {
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

export const recordDisciplineIssue = async (req: Request, res: Response) => {
    try {
        const issue = await disciplineService.recordDisciplineIssue(req.body);
        res.status(201).json({
            success: true,
            message: 'Discipline issue recorded successfully',
            data: issue
        });
    } catch (error: any) {
        console.error('Error recording discipline issue:', error);

        // Determine appropriate status code based on error message
        let statusCode = 500;
        if (error.message.includes('not enrolled') || error.message.includes('not found')) {
            statusCode = 404;
        } else if (error.message.includes('already exists')) {
            statusCode = 409;
        } else if (error.message.includes('Invalid')) {
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

export const getDisciplineHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.studentId);
        if (isNaN(studentId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid student ID'
            });
            return;
        }

        const history = await disciplineService.getDisciplineHistory(studentId);

        res.json({
            success: true,
            data: history
        });
    } catch (error: any) {
        console.error('Error fetching discipline history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
