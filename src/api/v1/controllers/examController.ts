// src/api/v1/controllers/examController.ts
import { Request, Response } from 'express';
import * as examService from '../services/examService';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import path from 'path';
import fs from 'fs';

export const getAllMarks = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for marks
        const allowedFilters = [
            'student_id',
            'class_id',
            'subclass_id',
            'subject_id',
            'exam_sequence_id',
            'minScore',
            'maxScore',
            'includeStudent',
            'includeSubject',
            'includeTeacher',
            'includeExamSequence'
        ];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Get academic year from query if provided
        const academicYearId = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const result = await examService.getAllMarks(
            paginationOptions,
            filterOptions,
            academicYearId
        );

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching marks:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllExamPapers = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for exam papers
        const allowedFilters = [
            'name',
            'subject_id',
            'includeSubject',
            'includeQuestions'
        ];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        // Get academic year from query if provided
        const academicYearId = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const result = await examService.getAllExamPapers(
            paginationOptions,
            filterOptions,
            academicYearId
        );

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching exam papers:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getExamPaperWithQuestions = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.examId);
        const examPaper = await examService.getExamPaperWithQuestions(id);

        if (!examPaper) {
            return res.status(404).json({ error: 'Exam paper not found' });
        }

        res.json(examPaper);
    } catch (error: any) {
        console.error('Error fetching exam paper with questions:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createExam = async (req: Request, res: Response) => {
    try {
        const exam = await examService.createExam(req.body);
        res.status(201).json(exam);
    } catch (error: any) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addQuestionsToExam = async (req: Request, res: Response) => {
    try {
        const questions = await examService.addQuestionsToExam(parseInt(req.params.id), req.body);
        res.status(201).json(questions);
    } catch (error: any) {
        console.error('Error adding questions to exam:', error);
        res.status(500).json({ error: error.message });
    }
};

export const generateExam = async (req: Request, res: Response) => {
    try {
        const exam = await examService.generateExam(parseInt(req.params.id));
        res.json(exam);
    } catch (error: any) {
        console.error('Error generating exam:', error);
        res.status(500).json({ error: error.message });
    }
};

export const enterExamMarks = async (req: Request, res: Response) => {
    try {
        const mark = await examService.enterExamMarks(req.body);
        res.status(201).json(mark);
    } catch (error: any) {
        console.error('Error entering exam marks:', error);
        res.status(500).json({ error: error.message });
    }
};

export const generateReportCards = async (req: Request, res: Response): Promise<any> => {
    try {
        const report = await examService.generateReportCards();
        res.json(report);
    } catch (error: any) {
        console.error('Error generating report cards:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generate a report card for a specific student
 * @route GET /exams/report-cards/student/:studentId
 */
export const generateStudentReportCard = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.studentId);
        const academicYearId = parseInt(req.query.academicYearId as string);
        const examSequenceId = parseInt(req.query.examSequenceId as string);

        // Validate parameters
        if (isNaN(studentId) || isNaN(academicYearId) || isNaN(examSequenceId)) {
            res.status(400).json({
                error: 'Invalid parameters: studentId, academicYearId and examSequenceId must be valid numbers'
            });
            return;
        }

        // Generate the report card
        const reportCardPath = await examService.generateReportCard({
            academicYearId,
            examSequenceId,
            studentId
        });

        // Send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="student-${studentId}-report.pdf"`);

        const fileStream = fs.createReadStream(reportCardPath);
        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Error generating student report card:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generate report cards for all students in a subclass
 * @route GET /exams/report-cards/subclass/:subclassId
 */
export const generateSubclassReportCards = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);
        const academicYearId = parseInt(req.query.academicYearId as string);
        const examSequenceId = parseInt(req.query.examSequenceId as string);

        // Validate parameters
        if (isNaN(subclassId) || isNaN(academicYearId) || isNaN(examSequenceId)) {
            res.status(400).json({
                error: 'Invalid parameters: subclassId, academicYearId and examSequenceId must be valid numbers'
            });
            return;
        }

        // Generate the report cards
        const reportCardPath = await examService.generateReportCard({
            academicYearId,
            examSequenceId,
            subclassId
        });

        // Send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="subclass-${subclassId}-reports.pdf"`);

        const fileStream = fs.createReadStream(reportCardPath);
        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Error generating subclass report cards:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllExams = async (req: Request, res: Response): Promise<any> => {
    try {
        const allowedFilters = ['name', 'academic_year_id', 'term_id', 'subclass_id'];
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const exams = await examService.getAllExams(paginationOptions, filterOptions);
        res.json(exams);
    } catch (error: any) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getExamById = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = parseInt(req.params.id);
        const exam = await examService.getExamById(examId);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json(exam);
    } catch (error: any) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteExam = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = parseInt(req.params.id);

        // Check if exam exists
        const exam = await examService.getExamById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Delete exam
        await examService.deleteExam(examId);

        res.json({ message: 'Exam deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createMark = async (req: Request, res: Response): Promise<any> => {
    try {
        const { exam_id, student_id, subject_id, mark, comment } = req.body;

        // Validate required fields
        if (!exam_id || !student_id || !subject_id || mark === undefined) {
            return res.status(400).json({
                error: 'Exam ID, student ID, subject ID, and mark are required'
            });
        }

        // Create mark
        const newMark = await examService.createMark({
            exam_id,
            student_id,
            subject_id,
            mark,
            comment
        });

        res.status(201).json(newMark);
    } catch (error: any) {
        console.error('Error creating mark:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateMark = async (req: Request, res: Response): Promise<any> => {
    try {
        const markId = parseInt(req.params.id);
        const { mark, comment } = req.body;

        // Validate that at least one field is provided
        if (mark === undefined && !comment) {
            return res.status(400).json({
                error: 'At least one field (mark or comment) must be provided'
            });
        }

        // Update mark
        const updatedMark = await examService.updateMark(markId, {
            mark,
            comment
        });

        res.json(updatedMark);
    } catch (error: any) {
        console.error('Error updating mark:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteMark = async (req: Request, res: Response) => {
    try {
        const markId = parseInt(req.params.id);

        // Delete mark
        await examService.deleteMark(markId);

        res.json({ message: 'Mark deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting mark:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add this method to match the route
export const getStudentReportCard = async (req: Request, res: Response) => {
    try {
        // Forward to the existing generateStudentReportCard function
        return generateStudentReportCard(req, res);
    } catch (error: any) {
        console.error('Error generating student report card:', error);
        res.status(500).json({ error: error.message });
    }
};
