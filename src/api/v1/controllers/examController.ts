// src/api/v1/controllers/examController.ts
import { Request, Response } from 'express';
import * as examService from '../services/examService';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import path from 'path';
import fs from 'fs';

// Helper function to transform mark data
const transformMark = (mark: any) => {
    const transformed: any = { ...mark }; // Clone mark

    // Add studentId directly if enrollment exists
    if (transformed.enrollment && transformed.enrollment.student_id) {
        transformed.studentId = transformed.enrollment.student_id;
    }

    // Optionally remove the nested enrollment if includeStudent was false
    // Or restructure enrollment data if needed
    // For now, we just add studentId

    return transformed;
};

export const getAllMarks = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for marks
        const allowedFilters = [
            'student_id',
            'class_id',
            'sub_class_id',
            'sub_class_id',
            'subject_id',
            'exam_sequence_id',
            'min_score',
            'max_score',
            'include_student',
            'include_subject',
            'include_teacher',
            'include_exam_sequence',
            'academic_year_id' // Added academicYearId to allowed filters
        ];

        console.log('Original finalQuery params:', req.finalQuery);

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        console.log('Extracted filterOptions:', filterOptions);

        // Get academic year from finalQuery if provided - will be used by service
        const academic_year_id = filterOptions.academic_year_id ?
            parseInt(filterOptions.academic_year_id as string) : undefined;
        // Remove academic_year_id from filterOptions if service expects it as separate arg
        // delete filterOptions.academic_year_id; 

        const result = await examService.getAllMarks(
            paginationOptions,
            filterOptions, // Pass remaining filters
            academic_year_id
        );

        // Transform the data array to add studentId
        const transformedData = result.data.map(transformMark);
        console.log('Transformed data: ', transformedData.length > 0 ? 'Data present' : 'Empty data array');

        res.json({
            success: true,
            ...result, // Spread pagination meta
            data: transformedData // Use transformed data
        });
    } catch (error: any) {
        console.error('Error fetching marks:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getAllExamPapers = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for exam papers
        const allowedFilters = [
            'name',
            'subject_id',
            'include_subject',
            'include_questions'
        ];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        // Get academic year from finalQuery if provided
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await examService.getAllExamPapers(
            paginationOptions,
            filterOptions,
            academic_year_id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('Error fetching exam papers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getExamPaperWithQuestions = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.examId);
        const examPaper = await examService.getExamPaperWithQuestions(id);

        if (!examPaper) {
            return res.status(404).json({
                success: false,
                error: 'Exam paper not found'
            });
        }

        res.json({
            success: true,
            data: examPaper
        });
    } catch (error: any) {
        console.error('Error fetching exam paper with questions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createExam = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate required fields
        const { sequence_number, term_id, academic_year_id, start_date, end_date } = req.body;

        if (!sequence_number || !term_id) {
            return res.status(400).json({
                success: false,
                error: 'Name, sequence number, and term ID are required'
            });
        }

        // Use the data directly - middleware handles conversion
        const examData = {
            sequence_number,
            term_id,
            academic_year_id,
            start_date,
            end_date
        };

        const exam = await examService.createExam(examData);

        res.status(201).json({
            success: true,
            data: exam
        });
    } catch (error: any) {
        console.error('Error creating exam sequence:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createExamPaper = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate required fields using snake_case
        const { name, subject_id, exam_date, duration, academic_year_id } = req.body;

        if (!name || !subject_id || !exam_date || !duration) {
            return res.status(400).json({
                success: false,
                error: 'Name, subject ID, exam date, and duration are required'
            });
        }

        // Use data directly - middleware handles conversion
        const examPaperData = {
            name,
            subject_id,
            exam_date,
            duration,
            academic_year_id
        };

        const examPaper = await examService.createExamPaper(examPaperData);

        // Response will be automatically converted to camelCase by middleware
        res.status(201).json({
            success: true,
            data: examPaper
        });
    } catch (error: any) {
        console.error('Error creating exam paper:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const addQuestionsToExam = async (req: Request, res: Response) => {
    try {
        const questions = await examService.addQuestionsToExam(parseInt(req.params.id), req.body);
        res.status(201).json({
            success: true,
            data: questions
        });
    } catch (error: any) {
        console.error('Error adding questions to exam:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const generateExam = async (req: Request, res: Response) => {
    try {
        const exam = await examService.generateExam(parseInt(req.params.id));
        res.json({
            success: true,
            data: exam
        });
    } catch (error: any) {
        console.error('Error generating exam:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const enterExamMarks = async (req: Request, res: Response) => {
    try {
        const mark = await examService.enterExamMarks(req.body);
        res.status(201).json({
            success: true,
            data: mark
        });
    } catch (error: any) {
        console.error('Error entering exam marks:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const generateReportCards = async (req: Request, res: Response): Promise<any> => {
    try {
        const report = await examService.generateReportCards();
        res.json({
            success: true,
            data: report
        });
    } catch (error: any) {
        console.error('Error generating report cards:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Generate a report card for a specific student
 * @route GET /exams/report-cards/student/:studentId
 */
export const generateStudentReportCard = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.studentId);
        const academic_year_id = parseInt(req.finalQuery.academic_year_id as string);
        const exam_sequence_id = parseInt(req.finalQuery.exam_sequence_id as string);

        // Validate parameters
        if (isNaN(studentId) || isNaN(academic_year_id) || isNaN(exam_sequence_id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid parameters: studentId, academic_year_id and exam_sequence_id must be valid numbers'
            });
            return;
        }

        const reportCardPath = await examService.generateReportCard({
            academicYearId: academic_year_id,
            examSequenceId: exam_sequence_id,
            studentId
        });

        // Send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="student-${studentId}-report.pdf"`);

        const fileStream = fs.createReadStream(reportCardPath);

        // Delete the file after it's been sent to the client
        fileStream.on('end', () => {
            setTimeout(() => {
                fs.unlink(reportCardPath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${reportCardPath}:`, err);
                    } else {
                        console.log(`Successfully deleted temporary PDF file: ${reportCardPath}`);
                    }
                });
            }, 1000); // Small delay to ensure the file is fully sent
        });

        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Error generating student report card:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Generate report cards for all students in a sub_class
 * @route GET /exams/report-cards/sub_class/:sub_classId
 */
export const generateSubclassReportCards = async (req: Request, res: Response): Promise<void> => {
    try {
        const sub_classId = parseInt(req.params.sub_classId);
        const academic_year_id = parseInt(req.finalQuery.academic_year_id as string);
        const exam_sequence_id = parseInt(req.finalQuery.exam_sequence_id as string);

        // Validate parameters
        if (isNaN(sub_classId) || isNaN(academic_year_id) || isNaN(exam_sequence_id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid parameters: sub_classId, academic_year_id and exam_sequence_id must be valid numbers'
            });
            return;
        }

        // Generate the report cards
        const reportCardPath = await examService.generateReportCard({
            academicYearId: academic_year_id,
            examSequenceId: exam_sequence_id,
            sub_classId
        });

        // Send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="sub_class-${sub_classId}-reports.pdf"`);

        const fileStream = fs.createReadStream(reportCardPath);

        // Delete the file after it's been sent to the client
        fileStream.on('end', () => {
            setTimeout(() => {
                fs.unlink(reportCardPath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${reportCardPath}:`, err);
                    } else {
                        console.log(`Successfully deleted temporary PDF file: ${reportCardPath}`);
                    }
                });
            }, 1000); // Small delay to ensure the file is fully sent
        });

        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Error generating sub_class report cards:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getAllExams = async (req: Request, res: Response) => {
    try {
        // Define allowed filters in snake_case - middleware handles conversion
        const allowedFilters = ['name', 'academic_year_id', 'term_id', 'sub_class_id'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);


        const exams = await examService.getAllExams(paginationOptions, filterOptions);
        res.json({
            success: true,
            ...exams
        });
    } catch (error: any) {
        console.error('Error fetching exams:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getExamById = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = parseInt(req.params.id);
        const exam = await examService.getExamById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        res.json({
            success: true,
            data: exam
        });
    } catch (error: any) {
        console.error('Error fetching exam:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteExam = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = parseInt(req.params.id);

        // Check if exam exists
        const exam = await examService.getExamById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Delete exam
        await examService.deleteExam(examId);

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting exam:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createMark = async (req: Request, res: Response): Promise<any> => {
    try {
        // Use snake_case directly - middleware handles conversion
        const { exam_id, student_id, subject_id, mark } = req.body;

        console.log(req.body)
        // Get teacher ID from authenticated user
        // TypeScript requires us to check if req.user exists
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }
        const teacher_id = req.user.id;

        // Validate required fields
        if (!exam_id || !student_id || !subject_id || mark === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Exam ID, student ID, subject ID, and mark are required'
            });
        }

        // Create mark with converted parameters
        const newMark = await examService.createMark({
            exam_id,
            student_id,
            subject_id,
            teacher_id,
            mark
        });

        res.status(201).json({
            success: true,
            data: newMark
        });
    } catch (error: any) {
        console.error('Error creating mark:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateMark = async (req: Request, res: Response): Promise<any> => {
    try {
        const markId = parseInt(req.params.id);
        const { mark, comment } = req.body;

        // Get teacher ID from authenticated user
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated or missing ID'
            });
        }
        const teacher_id = req.user.id;

        // Validate that at least one field is provided
        if (mark === undefined && !comment) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (mark or comment) must be provided'
            });
        }

        // Update mark
        const updatedMark = await examService.updateMark(markId, {
            mark,
            comment,
            teacher_id,
        });

        res.json({
            success: true,
            data: updatedMark
        });
    } catch (error: any) {
        console.error('Error updating mark:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteMark = async (req: Request, res: Response) => {
    try {
        const markId = parseInt(req.params.id);

        // Delete mark
        await examService.deleteMark(markId);

        res.json({
            success: true,
            message: 'Mark deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting mark:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add this method to match the route
export const getStudentReportCard = async (req: Request, res: Response) => {
    try {
        // Forward to the existing generateStudentReportCard function
        return generateStudentReportCard(req, res);
    } catch (error: any) {
        console.error('Error generating student report card:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
