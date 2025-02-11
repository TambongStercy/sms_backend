// src/api/v1/controllers/disciplineController.ts
import { Request, Response } from 'express';
import * as disciplineService from '../services/disciplineService';

export const recordStudentAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await disciplineService.recordStudentAttendance(req.body);
        res.status(201).json(attendance);
    } catch (error: any) {
        console.error('Error recording student attendance:', error);
        res.status(500).json({ error: error.message });
    }
};

export const recordTeacherAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await disciplineService.recordTeacherAttendance(req.body);
        res.status(201).json(attendance);
    } catch (error: any) {
        console.error('Error recording teacher attendance:', error);
        res.status(500).json({ error: error.message });
    }
};

export const recordDisciplineIssue = async (req: Request, res: Response) => {
    try {
        const issue = await disciplineService.recordDisciplineIssue(req.body);
        res.status(201).json(issue);
    } catch (error: any) {
        console.error('Error recording discipline issue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getDisciplineHistory = async (req: Request, res: Response) => {
    try {
        const history = await disciplineService.getDisciplineHistory(parseInt(req.params.studentId));
        res.json(history);
    } catch (error: any) {
        console.error('Error fetching discipline history:', error);
        res.status(500).json({ error: error.message });
    }
};
