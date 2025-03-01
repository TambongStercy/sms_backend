// src/api/v1/controllers/subjectController.ts
import { Request, Response } from 'express';
import * as subjectService from '../services/subjectService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for subjects
        const allowedFilters = ['name', 'category', 'id', 'includeTeachers', 'includeSubclasses'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const subjects = await subjectService.getAllSubjects(paginationOptions, filterOptions);
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

export const getSubjectById = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);
        const subject = await subjectService.getSubjectById(subjectId);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(subject);
    } catch (error: any) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSubject = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);
        const updatedData = req.body;

        // Check if subject exists
        const existingSubject = await subjectService.getSubjectById(subjectId);
        if (!existingSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Update the subject
        const updatedSubject = await subjectService.updateSubject(subjectId, updatedData);

        res.json({
            message: 'Subject updated successfully',
            subject: updatedSubject
        });
    } catch (error: any) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubject = async (req: Request, res: Response): Promise<any> => {
    try {
        const subjectId = parseInt(req.params.id);

        // Check if subject exists
        const existingSubject = await subjectService.getSubjectById(subjectId);
        if (!existingSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Delete the subject
        await subjectService.deleteSubject(subjectId);

        res.json({
            message: 'Subject deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: error.message });
    }
};
