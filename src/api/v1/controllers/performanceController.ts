// src/api/v1/controllers/performanceController.ts
import { Request, Response } from 'express';
import * as performanceService from '../services/performanceService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

// GET /students/performance - Get comprehensive performance analytics
export const getStudentPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const allowedFilters = [
            'student_id',
            'class_id',
            'sub_class_id',
            'subject_id',
            'exam_sequence_id',
            'academic_year_id',
            'include_marks',
            'include_attendance',
            'include_discipline',
            'include_fees'
        ];

        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await performanceService.getStudentPerformance(
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
        console.error('Error fetching student performance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET /students/:id/performance/detailed - Get detailed performance history for a specific student
export const getDetailedStudentPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.id);
        if (isNaN(studentId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid student ID format'
            });
            return;
        }

        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const includeOptions = {
            include_marks: req.finalQuery.include_marks === 'true',
            include_attendance: req.finalQuery.include_attendance === 'true',
            include_discipline: req.finalQuery.include_discipline === 'true',
            include_fees: req.finalQuery.include_fees === 'true',
            include_rankings: req.finalQuery.include_rankings === 'true'
        };

        const result = await performanceService.getDetailedStudentPerformance(
            studentId,
            academic_year_id,
            includeOptions
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching detailed student performance:', error);
        
        let statusCode = 500;
        if (error.message.includes('not found')) {
            statusCode = 404;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

// GET /students/performance/comparison - Get class performance comparison
export const getClassPerformanceComparison = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = {
            class_id: req.finalQuery.class_id ? parseInt(req.finalQuery.class_id as string) : undefined,
            sub_class_id: req.finalQuery.sub_class_id ? parseInt(req.finalQuery.sub_class_id as string) : undefined,
            subject_id: req.finalQuery.subject_id ? parseInt(req.finalQuery.subject_id as string) : undefined,
            exam_sequence_id: req.finalQuery.exam_sequence_id ? parseInt(req.finalQuery.exam_sequence_id as string) : undefined,
            academic_year_id: req.finalQuery.academic_year_id ? parseInt(req.finalQuery.academic_year_id as string) : undefined
        };

        if (!filters.class_id && !filters.sub_class_id) {
            res.status(400).json({
                success: false,
                error: 'Either class_id or sub_class_id is required for comparison'
            });
            return;
        }

        const result = await performanceService.getClassPerformanceComparison(filters);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching class performance comparison:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET /students/performance/trends - Get performance trends over time
export const getPerformanceTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = {
            student_id: req.finalQuery.student_id ? parseInt(req.finalQuery.student_id as string) : undefined,
            class_id: req.finalQuery.class_id ? parseInt(req.finalQuery.class_id as string) : undefined,
            sub_class_id: req.finalQuery.sub_class_id ? parseInt(req.finalQuery.sub_class_id as string) : undefined,
            subject_id: req.finalQuery.subject_id ? parseInt(req.finalQuery.subject_id as string) : undefined,
            academic_year_id: req.finalQuery.academic_year_id ? parseInt(req.finalQuery.academic_year_id as string) : undefined,
            period: req.finalQuery.period as string || 'sequence'
        };

        const result = await performanceService.getPerformanceTrends(filters);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching performance trends:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET /students/:id/performance/subject-analysis - Get subject-wise performance analysis
export const getSubjectPerformanceAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.id);
        if (isNaN(studentId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid student ID format'
            });
            return;
        }

        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await performanceService.getSubjectPerformanceAnalysis(studentId, academic_year_id);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching subject performance analysis:', error);
        
        let statusCode = 500;
        if (error.message.includes('not found')) {
            statusCode = 404;
        }

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};
