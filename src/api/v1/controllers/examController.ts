// src/api/v1/controllers/examController.ts
import { Request, Response } from 'express';
import * as examService from '../services/examService';

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
