import { Request, Response } from 'express';
import * as svc from '../services/nurseService';

export const createNurseVisit = async (req: any, res: Response): Promise<any> => {
    try {
        if (!req.user?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        const created = await svc.createNurseVisit({
            student_id: Number(req.body.student_id),
            academic_year_id: req.body.academic_year_id ? Number(req.body.academic_year_id) : undefined,
            period_id: req.body.period_id !== undefined && req.body.period_id !== null && req.body.period_id !== ''
                ? Number(req.body.period_id) : undefined,
            visit_date: req.body.visit_date,
            reason: req.body.reason,
            treatment_given: req.body.treatment_given,
            medication_given: req.body.medication_given,
            notes: req.body.notes,
            sent_home: req.body.sent_home,
            logged_by_id: req.user.id,
        });
        return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        console.error('Error creating nurse visit:', err);
        const status = err.message.includes('not enrolled') || err.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const listNurseVisits = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await svc.listNurseVisits({
            student_id: req.finalQuery.student_id ? Number(req.finalQuery.student_id) : undefined,
            enrollment_id: req.finalQuery.enrollment_id ? Number(req.finalQuery.enrollment_id) : undefined,
            from: req.query.from as string | undefined,
            to: req.query.to as string | undefined,
            academic_year_id: req.finalQuery.academic_year_id ? Number(req.finalQuery.academic_year_id) : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        return res.json({ success: true, data: result.data, meta: result.meta });
    } catch (err: any) {
        console.error('Error listing nurse visits:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getNurseVisitById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const item = await svc.getNurseVisitById(id);
        if (!item) return res.status(404).json({ success: false, error: 'NurseVisitLog not found' });
        return res.json({ success: true, data: item });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const updateNurseVisit = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const body = req.body;
        const updated = await svc.updateNurseVisit(id, {
            period_id: body.period_id === undefined
                ? undefined
                : (body.period_id === null || body.period_id === '' ? null : Number(body.period_id)),
            visit_date: body.visit_date,
            reason: body.reason,
            treatment_given: body.treatment_given,
            medication_given: body.medication_given,
            notes: body.notes,
            sent_home: body.sent_home,
        });
        return res.json({ success: true, data: updated });
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const deleteNurseVisit = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        await svc.deleteNurseVisit(id);
        return res.json({ success: true });
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const getStudentHealthProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const studentId = parseInt(req.params.studentId);
        if (isNaN(studentId)) return res.status(400).json({ success: false, error: 'Invalid studentId' });
        const academicYearId = req.finalQuery.academic_year_id ? Number(req.finalQuery.academic_year_id) : undefined;
        const profile = await svc.getStudentHealthProfile(studentId, academicYearId);
        return res.json({ success: true, data: profile });
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ success: false, error: err.message });
    }
};
