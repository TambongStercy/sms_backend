// src/api/v1/controllers/studentController.ts
import { Request, Response } from 'express';
import * as studentService from '../services/studentService';

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await studentService.getAllStudents();
        res.json(students);
    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const newStudent = await studentService.createStudent(req.body);
        res.status(201).json(newStudent);
    } catch (error: any) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getStudentById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const student = await studentService.getStudentById(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error: any) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: error.message });
    }
};

export const linkParent = async (req: Request, res: Response) => {
    try {
        const student_id = parseInt(req.params.id);
        const newLink = await studentService.linkParent(student_id, req.body);
        res.status(201).json(newLink);
    } catch (error: any) {
        console.error('Error linking parent:', error);
        res.status(500).json({ error: error.message });
    }
};

export const enrollStudent = async (req: Request, res: Response) => {
    try {
        const student_id = parseInt(req.params.id);
        const enrollment = await studentService.enrollStudent(student_id, req.body);
        res.status(201).json(enrollment);
    } catch (error: any) {
        console.error('Error enrolling student:', error);
        res.status(500).json({ error: error.message });
    }
};
