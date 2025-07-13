// src/api/v1/controllers/examController.ts
import { Request, Response } from 'express';
import * as examService from '../services/examService';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import path from 'path';
// import { ReportStatus, ReportType } from '@prisma/client';
import prisma, { ReportStatus, ReportType } from '../../../config/db';
import { Mark, ExamSequenceStatus } from '@prisma/client'; // Import enum
import { PDFDocument } from 'pdf-lib'; // Added import
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

        // console.log('Original finalQuery params:', req.finalQuery);

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        // console.log('Extracted filterOptions:', filterOptions);

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
        // console.log('Transformed data: ', transformedData.length > 0 ? 'Data present' : 'Empty data array');

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
        // Extract questions array from request body
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                error: 'Questions array is required in request body'
            });
        }

        const questionLinks = await examService.addQuestionsToExam(parseInt(req.params.id), questions);
        res.status(201).json({
            success: true,
            data: questionLinks
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

/**
 * Serves a specific page (student report card) extracted from a pre-generated combined subclass PDF.
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

        // Find the GeneratedReport record for the SINGLE_STUDENT
        const reportRecord = await prisma.generatedReport.findUnique({
            where: {
                report_type_exam_sequence_id_academic_year_id_student_id: {
                    report_type: ReportType.SINGLE_STUDENT,
                    exam_sequence_id: exam_sequence_id,
                    academic_year_id: academic_year_id,
                    student_id: studentId,
                }
            },
        });

        if (!reportRecord) {
            // Check sequence status as fallback
            const sequence = await prisma.examSequence.findUnique({ where: { id: exam_sequence_id }, select: { status: true } });
            if (sequence?.status === 'REPORTS_GENERATING' || sequence?.status === 'FINALIZED') {
                return res.status(202).json({ success: true, message: 'Reports are still being generated. Please check back later.', status: 'PROCESSING' });
            } else if (sequence?.status === 'REPORTS_FAILED') {
                return res.status(500).json({ success: false, error: 'Report generation failed for this sequence.', status: 'FAILED' });
            }
            res.status(404).json({
                success: false,
                error: 'Report record not found for this student. Generation might be pending, failed, or parameters incorrect.'
            });
            return;
        }

        // Check the status
        switch (reportRecord.status) {
            case ReportStatus.COMPLETED:
                if (!reportRecord.file_path || !reportRecord.page_number) {
                    res.status(500).json({
                        success: false,
                        error: 'Report generation completed, but file path or page number is missing.'
                    });
                    //TODO: Generate the report again
                    return;
                }
                const absolutePath = path.join(process.cwd(), reportRecord.file_path);
                if (!fs.existsSync(absolutePath)) {
                    console.error(`File not found for COMPLETED report: ${absolutePath}`);
                    res.status(404).json({
                        success: false,
                        error: `Source report file (${reportRecord.file_path}) not found. Please try again later or contact support.`
                    });
                    //TODO: Generate the report again
                    return;
                }

                try {
                    // Extract the specific page using pdf-lib
                    const pdfBytes = fs.readFileSync(absolutePath);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const totalPages = pdfDoc.getPageCount();
                    const pageNumZeroBased = reportRecord.page_number - 1; // pdf-lib uses 0-based index

                    if (pageNumZeroBased < 0 || pageNumZeroBased >= totalPages) {
                        throw new Error(`Invalid page number (${reportRecord.page_number}) for PDF with ${totalPages} pages.`);
                    }

                    const newPdfDoc = await PDFDocument.create();
                    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumZeroBased]);
                    newPdfDoc.addPage(copiedPage);

                    const newPdfBytes = await newPdfDoc.save();

                    // Send the extracted page
                    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { matricule: true } });
                    const filename = `report-student-${student?.matricule || studentId}-seq-${exam_sequence_id}.pdf`;
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    res.send(Buffer.from(newPdfBytes)); // Send the extracted page bytes

                } catch (pdfError: any) {
                    console.error(`Error extracting page ${reportRecord.page_number} from ${absolutePath}:`, pdfError);
                    res.status(500).json({ success: false, error: "Failed to extract student report page from combined PDF.", details: pdfError.message });
                }
                break;

            case ReportStatus.PENDING:
            case ReportStatus.PROCESSING:
                res.status(202).json({ // Accepted, but not ready
                    success: true,
                    message: `Report generation is currently ${reportRecord.status.toLowerCase()}. Please try again later.`,
                    status: reportRecord.status,
                });
                break;

            case ReportStatus.FAILED:
                res.status(500).json({
                    success: false,
                    error: 'Report generation failed for this student.',
                    message: reportRecord.error_message || 'An unknown error occurred during generation.',
                    status: reportRecord.status,
                });
                break;

            default:
                res.status(500).json({
                    success: false,
                    error: `Unknown report status: ${reportRecord.status}`
                });
        }

    } catch (error: any) {
        console.error('Error serving student report card:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while serving report card.'
        });
    }
};

/**
 * Serves a pre-generated combined PDF report card for an entire sub_class.
 * @route GET /exams/report-cards/sub_class/:sub_classId
 */
export const generateSubclassReportCards = async (req: Request, res: Response): Promise<void> => {
    try {
        const sub_classId = parseInt(req.params.sub_classId ?? req.params.subClassId);
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

        // Find the GeneratedReport record for the SUBCLASS using findFirst
        const reportRecord = await prisma.generatedReport.findFirst({
            where: {
                // List fields directly instead of using the removed unique constraint name
                report_type: ReportType.SUBCLASS,
                exam_sequence_id: exam_sequence_id,
                academic_year_id: academic_year_id,
                sub_class_id: sub_classId,
            },
            // Optional: Order by updated_at if multiple records could somehow exist (shouldn't with upsert logic)
            // orderBy: { updated_at: 'desc' }
        });

        if (!reportRecord) {
            // Check sequence status as a fallback for user feedback
            const sequence = await prisma.examSequence.findUnique({ where: { id: exam_sequence_id }, select: { status: true } });
            if (sequence?.status === 'REPORTS_GENERATING' || sequence?.status === 'FINALIZED') {
                return res.status(202).json({ success: true, message: 'Subclass report is being generated or queued. Please try again later.', status: 'PROCESSING' });
            } else if (sequence?.status === 'REPORTS_FAILED') {
                return res.status(500).json({ success: false, error: 'Report generation failed for this sequence.', status: 'FAILED' });
            }
            res.status(404).json({
                success: false,
                error: 'Combined subclass report record not found. It might not have been generated yet or the parameters are incorrect.'
            });
            return;
        }

        // Check the status of the SUBCLASS report record
        switch (reportRecord.status) {
            case ReportStatus.COMPLETED:
                if (!reportRecord.file_path) {
                    res.status(500).json({
                        success: false,
                        error: 'Subclass report generation completed, but file path is missing.'
                    });
                    return;
                }
                const absolutePath = path.join(process.cwd(), reportRecord.file_path);
                if (!fs.existsSync(absolutePath)) {
                    console.error(`File not found for COMPLETED subclass report: ${absolutePath}`);
                    res.status(404).json({
                        success: false,
                        error: `Generated subclass report file not found at path: ${reportRecord.file_path}. Please try again later or contact support.`
                    });
                    return;
                }

                // Send the file
                const subClassInfo = await prisma.subClass.findUnique({ where: { id: sub_classId }, select: { name: true, class: { select: { name: true } } } });
                const filename = `report-subclass-${subClassInfo?.class?.name || ''}-${subClassInfo?.name || sub_classId}-seq-${exam_sequence_id}.pdf`;
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                fs.createReadStream(absolutePath).pipe(res);
                break;

            case ReportStatus.PENDING:
            case ReportStatus.PROCESSING:
                res.status(202).json({ // Accepted, but not ready
                    success: true,
                    message: `Combined subclass report generation is currently ${reportRecord.status.toLowerCase()}. Please try again later.`,
                    status: reportRecord.status,
                });
                break;

            case ReportStatus.FAILED:
                res.status(500).json({
                    success: false,
                    error: 'Combined subclass report generation failed.',
                    message: reportRecord.error_message || 'An unknown error occurred during generation.',
                    status: reportRecord.status,
                });
                break;

            default:
                res.status(500).json({
                    success: false,
                    error: `Unknown report status: ${reportRecord.status}`
                });
        }

    } catch (error: any) {
        console.error('Error serving subclass report card:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while serving subclass report card.'
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
        const id = parseInt(req.params.id);
        await examService.deleteExam(id);
        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting exam:', error);
        if (error.code === 'P2025') { // Record to delete not found
            res.status(404).json({ success: false, error: 'Exam not found' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
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

/**
 * Controller to update the status of an ExamSequence.
 * @route PATCH /exams/:id/status
 */
export const updateExamSequenceStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const examSequenceId = parseInt(req.params.id);
        const { status } = req.body; // Expecting { "status": "FINALIZED" } (camelCase from frontend)

        // Validate input
        if (isNaN(examSequenceId)) {
            res.status(400).json({ success: false, error: 'Invalid Exam Sequence ID format' });
            return;
        }

        // Validate the status value - ensure it's a valid ExamSequenceStatus enum member
        if (!status || !Object.values(ExamSequenceStatus).includes(status as ExamSequenceStatus)) {
            res.status(400).json({
                success: false,
                error: `Invalid status provided. Must be one of: ${Object.values(ExamSequenceStatus).join(', ')}`,
            });
            return;
        }

        // Call the service function (middleware handles snake_case conversion for status if needed, but enums are usually direct)
        const updatedSequence = await examService.updateExamSequenceStatus(examSequenceId, status as ExamSequenceStatus);

        res.json({
            success: true,
            message: `Exam sequence ${examSequenceId} status updated to ${status}. Report generation triggered if status was FINALIZED.`,
            data: updatedSequence, // Return the updated sequence (which might show REPORTS_GENERATING)
        });

    } catch (error: any) {
        console.error(`Error updating exam sequence ${req.params.id} status:`, error);
        if (error.message.includes('not found')) {
            res.status(404).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: error.message || 'Internal server error updating exam sequence status.' });
        }
    }
};

export const deleteExamPaper = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid exam paper ID format'
            });
        }

        await examService.deleteExamPaper(id);

        res.json({
            success: true,
            message: 'Exam paper deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting exam paper:', error);
        if (error.message.includes('not found') || error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Exam paper not found'
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

/**
 * Controller to trigger the regeneration and download of a single student's report card.
 * @route POST /report-cards/student/:studentId/generate
 */
export const regenerateStudentReportCard = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.studentId);
        const { academic_year_id, exam_sequence_id } = req.body;

        if (isNaN(studentId) || !academic_year_id || !exam_sequence_id) {
            res.status(400).json({ success: false, error: 'Valid studentId, academicYearId, and examSequenceId must be provided.' });
            return;
        }

        const filePath = await examService.generateReportCard({
            studentId,
            academicYearId: parseInt(academic_year_id),
            examSequenceId: parseInt(exam_sequence_id)
        });

        res.download(filePath, `report-card-student-${studentId}.pdf`, async (err) => {
            if (err) {
                console.error('Error sending file for download:', err);
            }
            try {
                // await fs.promises.unlink(filePath);
            } catch (cleanupError) {
                console.error(`Error cleaning up report file ${filePath}:`, cleanupError);
            }
        });

    } catch (error: any) {
        console.error('Error regenerating student report card:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while regenerating student report card.'
        });
    }
};

/**
 * Controller to trigger the regeneration and download of a subclass's combined report card.
 * @route POST /report-cards/subclass/:subClassId/generate
 */
export const regenerateSubclassReportCards = async (req: Request, res: Response): Promise<void> => {
    try {
        const subClassId = parseInt(req.params.subclassId ?? req.params.subClassId ?? req.params.id);
        const academicYearId = Number(req.body.academicYearId ?? req.body.academic_year_id);
        const examSequenceId = Number(req.body.examSequenceId ?? req.body.exam_sequence_id);

        if (isNaN(subClassId) || isNaN(academicYearId) || isNaN(examSequenceId)) {
            return res.status(400).json({ success: false, error: 'Valid subClassId, academicYearId, and examSequenceId must be provided.' });
        }

        const filePath = await examService.generateReportCard({
            sub_classId: subClassId,
            academicYearId: academicYearId,
            examSequenceId: examSequenceId
        });

        res.download(filePath, `report-cards-subclass-${subClassId}.pdf`, async (err) => {
            if (err) {
                console.error('Error sending file for download:', err);
            }
            try {
                // await fs.promises.unlink(filePath);
            } catch (cleanupError) {
                console.error(`Error cleaning up report file ${filePath}:`, cleanupError);
            }
        });

    } catch (error: any) {
        console.error('Error regenerating subclass report cards:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while regenerating subclass report cards.'
        });
    }
};

/**
 * Controller to check student report card availability
 * @route GET /api/v1/report-cards/student/:studentId/availability
 */
export const checkStudentReportCardAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.params.studentId);
        const academicYearId = parseInt(req.finalQuery.academicYearId as string) || parseInt(req.finalQuery.academic_year_id as string);
        const examSequenceId = parseInt(req.finalQuery.examSequenceId as string) || parseInt(req.finalQuery.exam_sequence_id as string);

        if (isNaN(studentId) || isNaN(academicYearId) || isNaN(examSequenceId)) {
            res.status(400).json({
                success: false,
                error: 'Valid studentId, academicYearId, and examSequenceId must be provided'
            });
            return;
        }

        const result = await examService.checkStudentReportCardAvailability(
            studentId,
            academicYearId,
            examSequenceId
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error checking student report card availability:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while checking report card availability'
        });
    }
};

/**
 * Controller to check subclass report card availability
 * @route GET /api/v1/report-cards/subclass/:subClassId/availability
 */
export const checkSubclassReportCardAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const subClassId = parseInt(req.params.subClassId);
        const academicYearId = parseInt(req.finalQuery.academicYearId as string) || parseInt(req.finalQuery.academic_year_id as string);
        const examSequenceId = parseInt(req.finalQuery.examSequenceId as string) || parseInt(req.finalQuery.exam_sequence_id as string);

        if (isNaN(subClassId) || isNaN(academicYearId) || isNaN(examSequenceId)) {
            res.status(400).json({
                success: false,
                error: 'Valid subClassId, academicYearId, and examSequenceId must be provided'
            });
            return;
        }

        const result = await examService.checkSubclassReportCardAvailability(
            subClassId,
            academicYearId,
            examSequenceId
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error checking subclass report card availability:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while checking subclass report card availability'
        });
    }
};
