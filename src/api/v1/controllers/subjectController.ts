// src/api/v1/controllers/subjectController.ts
import { Request, Response } from 'express';
import * as subjectService from '../services/subjectService';

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await subjectService.getAllSubjects();
        res.json(subjects);
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createSubject = async (req: Request, res: Response) => {
    try {
        const newSubject = await subjectService.createSubject(req.body);
        res.status(201).json(newSubject);
    } catch (error: any) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: error.message });
    }
};

export const assignTeacher = async (req: Request, res: Response) => {
    try {
        const subject_id = parseInt(req.params.id);
        const teacher = await subjectService.assignTeacher(subject_id, req.body);
        res.status(201).json(teacher);
    } catch (error: any) {
        console.error('Error assigning teacher:', error);
        res.status(500).json({ error: error.message });
    }
};

export const linkSubjectToSubClass = async (req: Request, res: Response) => {
    try {
        const subject_id = parseInt(req.params.id);
        const link = await subjectService.linkSubjectToSubClass(subject_id, req.body);
        res.status(201).json(link);
    } catch (error: any) {
        console.error('Error linking subject to sub-class:', error);
        res.status(500).json({ error: error.message });
    }
};
