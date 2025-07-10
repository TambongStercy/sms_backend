// src/api/v1/controllers/attendanceController.ts
import { Request, Response } from 'express';
import * as attendanceService from '../services/attendanceService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

// GET /attendance/students - Get student attendance with comprehensive filtering
export const getStudentAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const allowedFilters = [
            'student_id',
            'class_id',
            'sub_class_id',
            'start_date',
            'end_date',
            'status',
            'include_student',
            'include_assigned_by',
            'include_teacher_period',
            'academic_year_id'
        ];

        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        // Get academic year from finalQuery if provided
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await attendanceService.getStudentAttendance(
            paginationOptions,
            filterOptions,
            academic_year_id
        );

        res.json({
            success: true,
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// POST /attendance/students - Bulk record student attendance
export const recordStudentAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
            return;
        }

        const attendanceData = {
            ...req.body,
            assigned_by_id: req.user.id
        };

        // Check if it's bulk operation (array) or single record
        const isArray = Array.isArray(attendanceData.records || attendanceData);
        const records = isArray ? (attendanceData.records || attendanceData) : [attendanceData];

        const result = await attendanceService.recordBulkStudentAttendance(records, req.user.id);

        res.status(201).json({
            success: true,
            message: `${result.length} attendance record(s) created successfully`,
            data: result
        });
    } catch (error: any) {
        console.error('Error recording student attendance:', error);

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

// PUT /attendance/students/:id - Update individual attendance record
export const updateStudentAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const attendanceId = parseInt(req.params.id);
        if (isNaN(attendanceId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid attendance ID format'
            });
            return;
        }

        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
            return;
        }

        const updateData = {
            ...req.body,
            updated_by_id: req.user.id
        };

        const updatedRecord = await attendanceService.updateStudentAttendance(attendanceId, updateData);

        res.json({
            success: true,
            message: 'Attendance record updated successfully',
            data: updatedRecord
        });
    } catch (error: any) {
        console.error('Error updating attendance record:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) {
            statusCode = 404;
        } else if (error.message.includes('Invalid')) {
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

// GET /attendance/students/summary - Get attendance statistics and summary
export const getStudentAttendanceSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = {
            student_id: req.finalQuery.student_id ? parseInt(req.finalQuery.student_id as string) : undefined,
            class_id: req.finalQuery.class_id ? parseInt(req.finalQuery.class_id as string) : undefined,
            sub_class_id: req.finalQuery.sub_class_id ? parseInt(req.finalQuery.sub_class_id as string) : undefined,
            start_date: req.finalQuery.start_date ? new Date(req.finalQuery.start_date as string) : undefined,
            end_date: req.finalQuery.end_date ? new Date(req.finalQuery.end_date as string) : undefined,
            academic_year_id: req.finalQuery.academic_year_id ? parseInt(req.finalQuery.academic_year_id as string) : undefined
        };

        const summary = await attendanceService.getStudentAttendanceSummary(filters);

        res.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET /attendance/teachers - Get teacher attendance records
export const getTeacherAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const allowedFilters = [
            'teacher_id',
            'start_date',
            'end_date',
            'reason',
            'include_teacher',
            'include_assigned_by',
            'include_teacher_period'
        ];

        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        const result = await attendanceService.getTeacherAttendance(paginationOptions, filterOptions);

        res.json({
            success: true,
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching teacher attendance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// POST /attendance/teachers - Record teacher attendance
export const recordTeacherAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
            return;
        }

        const attendanceData = {
            ...req.body,
            assigned_by_id: req.user.id
        };

        const result = await attendanceService.recordTeacherAttendance(attendanceData);

        res.status(201).json({
            success: true,
            message: 'Teacher attendance recorded successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error recording teacher attendance:', error);

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

// GET /attendance/teachers/summary - Get teacher attendance summary
export const getTeacherAttendanceSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = {
            teacher_id: req.finalQuery.teacher_id ? parseInt(req.finalQuery.teacher_id as string) : undefined,
            start_date: req.finalQuery.start_date ? new Date(req.finalQuery.start_date as string) : undefined,
            end_date: req.finalQuery.end_date ? new Date(req.finalQuery.end_date as string) : undefined
        };

        const summary = await attendanceService.getTeacherAttendanceSummary(filters);

        res.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        console.error('Error fetching teacher attendance summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
