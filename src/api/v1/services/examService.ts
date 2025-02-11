// src/api/v1/services/examService.ts
import { ExamPaper, ExamPaperQuestion, Mark, Grade } from '@prisma/client';
import prisma from '../../../config/db';

export async function createExam(data: {
    name: string;
    subject_id: number;
    academic_year_id: number;
    exam_date: string;
    duration: number;
}): Promise<ExamPaper> {
    return prisma.examPaper.create({
        data: {
            ...data,
            exam_date: new Date(data.exam_date),
        },
    });
}

export async function addQuestionsToExam(exam_paper_id: number, data: { question_id: number; order?: number }[]): Promise<ExamPaperQuestion[]> {
    const questionLinks = [];
    for (const q of data) {
        const questionLink = await prisma.examPaperQuestion.create({
            data: {
                exam_paper_id,
                question_id: q.question_id,
                order: q.order,
            },
        });
        questionLinks.push(questionLink);
    }
    return questionLinks;
}

export async function generateExam(exam_paper_id: number): Promise<any> {
    // Add logic for generating exam papers (randomizing questions, etc.)
    return { message: `Exam ${exam_paper_id} generated` };
}

export async function enterExamMarks(data: {
    student_id: number;
    subject_id: number;
    exam_sequence_id: number;
    score: number;
    grade: Grade;
}): Promise<Mark> {
    return prisma.mark.create({
        data,
    });
}

export async function generateReportCards(): Promise<any> {
    // Implement logic for generating report cards (PDF, Excel)
    return { message: 'Report cards generated' };
}
