// src/api/v1/services/quizService.ts
import prisma, { QuizStatus, QuestionType } from '../../../config/db';
import { getCurrentAcademicYear, getAcademicYearId } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export interface CreateQuizData {
    title: string;
    description?: string;
    subject_id: number;
    class_ids: number[]; // Classes this quiz is for
    time_limit?: number; // Minutes
    total_marks?: number;
    start_date?: string;
    end_date?: string;
    questions: CreateQuizQuestionData[];
}

export interface CreateQuizQuestionData {
    question_text: string;
    question_type?: QuestionType;
    options?: string[]; // For MCQ
    correct_answer: string;
    marks?: number;
    explanation?: string;
}

export interface SubmitQuizData {
    quiz_id: number;
    student_id: number;
    responses: QuizResponseData[];
}

export interface QuizResponseData {
    question_id: number;
    selected_answer: string;
    time_spent?: number; // Seconds
}

/**
 * Create a new quiz template
 */
export async function createQuiz(data: CreateQuizData, createdById: number): Promise<any> {
    const academicYearId = await getAcademicYearId();
    if (!academicYearId) {
        throw new Error("No current academic year found");
    }

    // Validate that subject exists
    const subject = await prisma.subject.findUnique({
        where: { id: data.subject_id }
    });
    if (!subject) {
        throw new Error(`Subject with ID ${data.subject_id} not found`);
    }

    // Validate that classes exist
    for (const classId of data.class_ids) {
        const classExists = await prisma.class.findUnique({
            where: { id: classId }
        });
        if (!classExists) {
            throw new Error(`Class with ID ${classId} not found`);
        }
    }

    return prisma.$transaction(async (tx) => {
        // Create the quiz template
        const quiz = await tx.quizTemplate.create({
            data: {
                title: data.title,
                description: data.description,
                subject_id: data.subject_id,
                class_ids: JSON.stringify(data.class_ids),
                time_limit: data.time_limit,
                total_marks: data.total_marks || 10,
                start_date: data.start_date ? new Date(data.start_date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                created_by_id: createdById,
                academic_year_id: academicYearId
            }
        });

        // Create questions
        if (data.questions && data.questions.length > 0) {
            const questionPromises = data.questions.map((question, index) =>
                tx.quizQuestion.create({
                    data: {
                        quiz_id: quiz.id,
                        question_text: question.question_text,
                        question_type: question.question_type || QuestionType.MCQ,
                        options: question.options ? JSON.stringify(question.options) : null,
                        correct_answer: question.correct_answer,
                        marks: question.marks || 1,
                        order_index: index + 1,
                        explanation: question.explanation
                    }
                })
            );

            await Promise.all(questionPromises);
        }

        // Return complete quiz with questions
        return tx.quizTemplate.findUnique({
            where: { id: quiz.id },
            include: {
                questions: {
                    orderBy: { order_index: 'asc' }
                },
                subject: true,
                created_by: {
                    select: { id: true, name: true, matricule: true }
                }
            }
        });
    });
}

/**
 * Get available quizzes for a student (based on their class)
 */
export async function getAvailableQuizzesForStudent(studentId: number, academicYearId?: number): Promise<any[]> {
    const yearId = academicYearId || await getAcademicYearId();
    if (!yearId) {
        throw new Error("No current academic year found");
    }

    // Get student's enrollment to find their class
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: studentId,
            academic_year_id: yearId
        },
        include: {
            sub_class: {
                include: { class: true }
            }
        }
    });

    if (!enrollment || !enrollment.sub_class?.class) {
        return [];
    }

    const classId = enrollment.sub_class.class.id;

    // Find quizzes available for this class
    const quizzes = await prisma.quizTemplate.findMany({
        where: {
            academic_year_id: yearId,
            is_active: true,
            OR: [
                {
                    start_date: null
                },
                {
                    start_date: { lte: new Date() }
                }
            ],
            AND: [
                {
                    OR: [
                        { end_date: null },
                        { end_date: { gte: new Date() } }
                    ]
                }
            ]
        },
        include: {
            subject: true,
            questions: {
                select: { id: true, marks: true },
                orderBy: { order_index: 'asc' }
            },
            submissions: {
                where: { student_id: studentId },
                select: { id: true, status: true, score: true, percentage: true }
            }
        }
    });

    // Filter quizzes that are available for this student's class
    const availableQuizzes = quizzes.filter(quiz => {
        try {
            const classIds = JSON.parse(quiz.class_ids as string);
            return Array.isArray(classIds) && classIds.includes(classId);
        } catch {
            return false;
        }
    });

    return availableQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject.name,
        time_limit: quiz.time_limit,
        total_marks: quiz.total_marks,
        question_count: quiz.questions.length,
        start_date: quiz.start_date,
        end_date: quiz.end_date,
        status: quiz.submissions.length > 0 ? quiz.submissions[0].status : 'NOT_STARTED',
        last_attempt: quiz.submissions.length > 0 ? {
            score: quiz.submissions[0].score,
            percentage: quiz.submissions[0].percentage
        } : null
    }));
}

/**
 * Start a quiz (create submission record)
 */
export async function startQuiz(quizId: number, studentId: number, parentId: number): Promise<any> {
    const academicYearId = await getAcademicYearId();
    if (!academicYearId) {
        throw new Error("No current academic year found");
    }

    // Check if quiz exists and is available
    const quiz = await prisma.quizTemplate.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                orderBy: { order_index: 'asc' }
            }
        }
    });

    if (!quiz) {
        throw new Error("Quiz not found");
    }

    if (!quiz.is_active) {
        throw new Error("Quiz is not active");
    }

    // Check if quiz is within time limits
    const now = new Date();
    if (quiz.start_date && quiz.start_date > now) {
        throw new Error("Quiz has not started yet");
    }
    if (quiz.end_date && quiz.end_date < now) {
        throw new Error("Quiz has expired");
    }

    // Check if student already has a submission
    const existingSubmission = await prisma.quizSubmission.findUnique({
        where: {
            quiz_id_student_id_academic_year_id: {
                quiz_id: quizId,
                student_id: studentId,
                academic_year_id: academicYearId
            }
        }
    });

    if (existingSubmission) {
        if (existingSubmission.status === QuizStatus.COMPLETED) {
            throw new Error("Quiz already completed");
        }
        // Return existing submission if in progress
        return existingSubmission;
    }

    // Create new submission
    const submission = await prisma.quizSubmission.create({
        data: {
            quiz_id: quizId,
            student_id: studentId,
            parent_id: parentId,
            total_marks: quiz.total_marks,
            status: QuizStatus.IN_PROGRESS,
            academic_year_id: academicYearId
        },
        include: {
            quiz: {
                include: {
                    questions: {
                        select: {
                            id: true,
                            question_text: true,
                            question_type: true,
                            options: true,
                            marks: true,
                            order_index: true
                        },
                        orderBy: { order_index: 'asc' }
                    }
                }
            }
        }
    });

    return submission;
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(submissionId: number, responses: QuizResponseData[]): Promise<any> {
    return prisma.$transaction(async (tx) => {
        // Get submission with quiz and questions
        const submission = await tx.quizSubmission.findUnique({
            where: { id: submissionId },
            include: {
                quiz: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!submission) {
            throw new Error("Submission not found");
        }

        if (submission.status === QuizStatus.COMPLETED) {
            throw new Error("Quiz already submitted");
        }

        let totalScore = 0;
        let totalPossibleMarks = 0;

        // Process each response
        for (const response of responses) {
            const question = submission.quiz.questions.find(q => q.id === response.question_id);
            if (!question) {
                continue;
            }

            const isCorrect = response.selected_answer.trim().toLowerCase() ===
                question.correct_answer.trim().toLowerCase();
            const marksEarned = isCorrect ? question.marks : 0;

            await tx.quizResponse.create({
                data: {
                    submission_id: submissionId,
                    question_id: response.question_id,
                    selected_answer: response.selected_answer,
                    is_correct: isCorrect,
                    marks_earned: marksEarned,
                    time_spent: response.time_spent
                }
            });

            totalScore += marksEarned;
            totalPossibleMarks += question.marks;
        }

        // Calculate percentage
        const percentage = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;

        // Update submission
        const updatedSubmission = await tx.quizSubmission.update({
            where: { id: submissionId },
            data: {
                score: totalScore,
                percentage: percentage,
                status: QuizStatus.COMPLETED,
                submitted_at: new Date()
            },
            include: {
                quiz: {
                    include: {
                        subject: true
                    }
                },
                student: true,
                responses: {
                    include: {
                        question: true
                    }
                }
            }
        });

        return updatedSubmission;
    });
}

/**
 * Get quiz results for a student
 */
export async function getQuizResults(studentId: number, academicYearId?: number): Promise<any[]> {
    const yearId = academicYearId || await getAcademicYearId();
    if (!yearId) {
        return [];
    }

    const submissions = await prisma.quizSubmission.findMany({
        where: {
            student_id: studentId,
            academic_year_id: yearId,
            status: QuizStatus.COMPLETED
        },
        include: {
            quiz: {
                include: {
                    subject: true
                }
            }
        },
        orderBy: { submitted_at: 'desc' }
    });

    return submissions.map(submission => ({
        id: submission.id,
        quiz_title: submission.quiz.title,
        subject: submission.quiz.subject.name,
        score: submission.score,
        total_marks: submission.total_marks,
        percentage: submission.percentage,
        submitted_at: submission.submitted_at,
        time_taken: submission.time_taken
    }));
}

/**
 * Get detailed quiz results with answers (for parents to review)
 */
export async function getDetailedQuizResults(submissionId: number, parentId: number): Promise<any> {
    const submission = await prisma.quizSubmission.findUnique({
        where: { id: submissionId },
        include: {
            quiz: {
                include: {
                    subject: true,
                    questions: {
                        orderBy: { order_index: 'asc' }
                    }
                }
            },
            student: true,
            responses: {
                include: {
                    question: true
                }
            }
        }
    });

    if (!submission) {
        throw new Error("Quiz submission not found");
    }

    // Verify parent-student relationship
    const parentStudent = await prisma.parentStudent.findFirst({
        where: {
            parent_id: parentId,
            student_id: submission.student_id
        }
    });

    if (!parentStudent) {
        throw new Error("Not authorized to view this quiz result");
    }

    return {
        quiz: {
            title: submission.quiz.title,
            subject: submission.quiz.subject.name,
            total_marks: submission.total_marks
        },
        student: {
            name: submission.student.name,
            matricule: submission.student.matricule
        },
        results: {
            score: submission.score,
            percentage: submission.percentage,
            submitted_at: submission.submitted_at,
            time_taken: submission.time_taken
        },
        questions_and_answers: submission.quiz.questions.map(question => {
            const response = submission.responses.find(r => r.question_id === question.id);
            return {
                question: question.question_text,
                options: question.options ? JSON.parse(question.options as string) : null,
                correct_answer: question.correct_answer,
                student_answer: response?.selected_answer || 'Not answered',
                is_correct: response?.is_correct || false,
                marks_earned: response?.marks_earned || 0,
                total_marks: question.marks,
                explanation: question.explanation
            };
        })
    };
}

/**
 * Get quiz statistics for teachers/admin
 */
export async function getQuizStatistics(quizId: number): Promise<any> {
    const quiz = await prisma.quizTemplate.findUnique({
        where: { id: quizId },
        include: {
            submissions: {
                where: { status: QuizStatus.COMPLETED },
                include: {
                    student: true
                }
            },
            questions: true
        }
    });

    if (!quiz) {
        throw new Error("Quiz not found");
    }

    const completedSubmissions = quiz.submissions;
    const totalStudents = completedSubmissions.length;

    if (totalStudents === 0) {
        return {
            quiz_title: quiz.title,
            total_students: 0,
            completion_rate: 0,
            average_score: 0,
            average_percentage: 0,
            highest_score: 0,
            lowest_score: 0,
            question_analysis: []
        };
    }

    const scores = completedSubmissions.map(s => s.score || 0);
    const percentages = completedSubmissions.map(s => s.percentage || 0);

    return {
        quiz_title: quiz.title,
        total_students: totalStudents,
        completion_rate: 100, // Since we're only looking at completed submissions
        average_score: scores.reduce((a, b) => a + b, 0) / totalStudents,
        average_percentage: percentages.reduce((a, b) => a + b, 0) / totalStudents,
        highest_score: Math.max(...scores),
        lowest_score: Math.min(...scores),
        question_analysis: await getQuestionAnalysis(quizId)
    };
}

/**
 * Get question analysis for quiz statistics
 */
async function getQuestionAnalysis(quizId: number): Promise<any[]> {
    const questions = await prisma.quizQuestion.findMany({
        where: { quiz_id: quizId },
        include: {
            responses: {
                where: {
                    submission: {
                        status: QuizStatus.COMPLETED
                    }
                }
            }
        },
        orderBy: { order_index: 'asc' }
    });

    return questions.map(question => {
        const totalResponses = question.responses.length;
        const correctResponses = question.responses.filter(r => r.is_correct).length;
        const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;

        return {
            question_text: question.question_text,
            total_responses: totalResponses,
            correct_responses: correctResponses,
            accuracy_percentage: accuracy,
            difficulty_level: accuracy > 80 ? 'Easy' : accuracy > 50 ? 'Medium' : 'Hard'
        };
    });
} 