// src/api/v1/controllers/quizController.ts
import { Request, Response } from 'express';
import * as quizService from '../services/quizService';
import prisma from '../../../config/db';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        roles: string[];
    };
}

/**
 * Create a new quiz (for teachers/admin)
 */
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const createdById = authReq.user?.id;

        if (!createdById) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const quiz = await quizService.createQuiz(req.body, createdById);

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: quiz
        });
    } catch (error: any) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get available quizzes for a student (parent access)
 */
export const getAvailableQuizzes = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;
        const studentId = parseInt(req.params.studentId);
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Verify parent-student relationship
        const parentStudent = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: studentId
            }
        });

        if (!parentStudent) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to access this student\'s quizzes'
            });
            return;
        }

        const quizzes = await quizService.getAvailableQuizzesForStudent(studentId, academicYearId);

        res.json({
            success: true,
            data: quizzes
        });
    } catch (error: any) {
        console.error('Error fetching available quizzes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Start a quiz (parent supervising child)
 */
export const startQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;
        const { quiz_id, student_id } = req.body;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Verify parent-student relationship
        const parentStudent = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: student_id
            }
        });

        if (!parentStudent) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to start quiz for this student'
            });
            return;
        }

        const submission = await quizService.startQuiz(quiz_id, student_id, parentId);

        res.status(201).json({
            success: true,
            message: 'Quiz started successfully',
            data: submission
        });
    } catch (error: any) {
        console.error('Error starting quiz:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('not active') || error.message.includes('expired') || error.message.includes('not started')) statusCode = 400;
        if (error.message.includes('already completed')) statusCode = 409;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;
        const submissionId = parseInt(req.params.submissionId);
        const { responses } = req.body;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Verify parent owns this submission
        const submission = await prisma.quizSubmission.findUnique({
            where: { id: submissionId }
        });

        if (!submission || submission.parent_id !== parentId) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to submit this quiz'
            });
            return;
        }

        const result = await quizService.submitQuiz(submissionId, responses);

        res.json({
            success: true,
            message: 'Quiz submitted successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error submitting quiz:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('already submitted')) statusCode = 409;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get quiz results for a student (parent access)
 */
export const getQuizResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;
        const studentId = parseInt(req.params.studentId);
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Verify parent-student relationship
        const parentStudent = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: studentId
            }
        });

        if (!parentStudent) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to view this student\'s quiz results'
            });
            return;
        }

        const results = await quizService.getQuizResults(studentId, academicYearId);

        res.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get detailed quiz results with answers (parent review)
 */
export const getDetailedQuizResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parentId = authReq.user?.id;
        const submissionId = parseInt(req.params.submissionId);

        if (!parentId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const detailedResults = await quizService.getDetailedQuizResults(submissionId, parentId);

        res.json({
            success: true,
            data: detailedResults
        });
    } catch (error: any) {
        console.error('Error fetching detailed quiz results:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('Not authorized')) statusCode = 403;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get quiz statistics (for teachers/admin)
 */
export const getQuizStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const quizId = parseInt(req.params.quizId);

        const statistics = await quizService.getQuizStatistics(quizId);

        res.json({
            success: true,
            data: statistics
        });
    } catch (error: any) {
        console.error('Error fetching quiz statistics:', error);

        let statusCode = 500;
        if (error.message.includes('not found')) statusCode = 404;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all quizzes (for teachers/admin)
 */
export const getAllQuizzes = async (req: Request, res: Response): Promise<void> => {
    try {
        const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string) : undefined;
        const subjectId = req.query.subject_id ? parseInt(req.query.subject_id as string) : undefined;

        // Build filter options
        const whereClause: any = {};

        if (academicYearId) {
            whereClause.academic_year_id = academicYearId;
        }

        if (subjectId) {
            whereClause.subject_id = subjectId;
        }

        const quizzes = await prisma.quizTemplate.findMany({
            where: whereClause,
            include: {
                subject: true,
                created_by: {
                    select: { id: true, name: true, matricule: true }
                },
                questions: {
                    select: { id: true, marks: true }
                },
                submissions: {
                    select: { id: true, status: true },
                    where: { status: 'COMPLETED' }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const formattedQuizzes = quizzes.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            subject: quiz.subject.name,
            total_marks: quiz.total_marks,
            question_count: quiz.questions.length,
            time_limit: quiz.time_limit,
            is_active: quiz.is_active,
            start_date: quiz.start_date,
            end_date: quiz.end_date,
            created_by: quiz.created_by.name,
            completed_submissions: quiz.submissions.length,
            created_at: quiz.created_at
        }));

        res.json({
            success: true,
            data: formattedQuizzes
        });
    } catch (error: any) {
        console.error('Error fetching all quizzes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 