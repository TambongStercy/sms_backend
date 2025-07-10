// src/api/v1/controllers/disciplineController.ts
import { Request, Response } from 'express';
import * as disciplineService from '../services/disciplineService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllDisciplineIssues = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for discipline issues - snake_case for service
        const allowedFilters = [
            'student_id',
            'class_id',
            'sub_class_id',
            'start_date',
            'end_date',
            'description',
            'include_assigned_by',
            'include_reviewed_by',
            'include_student'
        ];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        // Get academic year from finalQuery if provided
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await disciplineService.getAllDisciplineIssues(
            paginationOptions,
            filterOptions,
            academic_year_id
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

export const recordStudentAttendance = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        // Use the body directly - middleware handles conversion
        const attendanceData = {
            ...req.body,
            assigned_by_id: req.user.id // Set assigned_by_id from authenticated user
        };

        const attendance = await disciplineService.recordStudentAttendance(attendanceData);

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

export const recordTeacherAttendance = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        // Use the body directly - middleware handles conversion
        const attendanceData = {
            ...req.body,
            assigned_by_id: req.user.id // Set assigned_by_id from authenticated user
        };

        const attendance = await disciplineService.recordTeacherAttendance(attendanceData);

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

export const recordDisciplineIssue = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        // Use the body directly - middleware handles conversion
        const issueData = {
            ...req.body,
            assigned_by_id: req.user.id, // Set assigned_by_id from authenticated user
            reviewed_by_id: req.user.id  // Same user initially reviews the issue
        };

        const issue = await disciplineService.recordDisciplineIssue(issueData);

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

/**
 * Record morning lateness for a single student (SDM)
 */
export const recordMorningLateness = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        const latenessData = {
            ...req.body,
            assigned_by_id: req.user.id
        };

        const lateness = await disciplineService.recordMorningLateness(latenessData);

        res.status(201).json({
            success: true,
            message: 'Morning lateness recorded successfully',
            data: lateness
        });
    } catch (error: any) {
        console.error('Error recording morning lateness:', error);

        let statusCode = 500;
        if (error.message.includes('not enrolled')) {
            statusCode = 404;
        } else if (error.message.includes('already recorded')) {
            statusCode = 409;
        } else if (error.message.includes('No academic year')) {
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Record bulk morning lateness for multiple students (SDM daily use)
 */
export const recordBulkMorningLateness = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }

        const bulkData = req.body;
        const results = await disciplineService.recordBulkMorningLateness(bulkData, req.user.id);

        res.status(201).json({
            success: true,
            message: `Processed ${results.success.length + results.errors.length} records`,
            data: {
                successful_records: results.success.length,
                failed_records: results.errors.length,
                successes: results.success,
                errors: results.errors
            }
        });
    } catch (error: any) {
        console.error('Error recording bulk morning lateness:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get lateness statistics for SDM dashboard
 */
export const getLatenessStatistics = async (req: Request, res: Response): Promise<any> => {
    try {
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const statistics = await disciplineService.getLatenessStatistics(academicYearId);

        res.json({
            success: true,
            data: statistics
        });
    } catch (error: any) {
        console.error('Error fetching lateness statistics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get daily lateness report for SDM
 */
export const getDailyLatenessReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const date = req.query.date as string;
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        const report = await disciplineService.getDailyLatenessReport(date, academicYearId);

        res.json({
            success: true,
            data: {
                date: date || new Date().toISOString().split('T')[0],
                total_late_students: report.length,
                records: report
            }
        });
    } catch (error: any) {
        console.error('Error fetching daily lateness report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
