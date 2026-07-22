import { Request, Response } from 'express';
import { TeacherRollCallStatus } from '@prisma/client';
import * as svc from '../services/teacherRollCallService';

function handle(err: any, res: Response) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message || 'Server error' });
}

function requireUser(req: any, res: Response): number | null {
    if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return null;
    }
    return req.user.id;
}

// ---------- Teacher ----------

// GET /teachers/me/current-period
export const getMyCurrentPeriod = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.getCurrentPeriodForTeacher(userId);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// GET /teachers/me/teacher-periods/:id/roll-call?date=YYYY-MM-DD
export const getMyRollCallForPeriod = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const tpId = Number(req.params.id);
        if (Number.isNaN(tpId)) return res.status(400).json({ success: false, error: 'Invalid teacher_period id' });
        const q = req.finalQuery || req.query;
        const date = (q.date as string | undefined) || new Date().toISOString();
        const data = await svc.getRollCallForTeacherPeriod(tpId, userId, date);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// POST /teachers/me/roll-call
// Body: { teacher_period_id, date?, notes?, entries: [{ enrollment_id, status, notes? }] }
export const submitMyRollCall = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const entries = Array.isArray(req.body.entries) ? req.body.entries : null;
        if (!entries) return res.status(400).json({ success: false, error: 'entries array required' });

        const normalized = entries.map((e: any) => {
            const status = typeof e.status === 'string' ? e.status.toUpperCase() : '';
            if (!Object.values(TeacherRollCallStatus).includes(status as any)) {
                throw Object.assign(new Error(`Invalid status: ${e.status}`), { statusCode: 400 });
            }
            return {
                enrollment_id: Number(e.enrollment_id),
                status: status as TeacherRollCallStatus,
                notes: typeof e.notes === 'string' ? e.notes : undefined,
            };
        });

        const data = await svc.recordTeacherRollCall({
            teacher_period_id: Number(req.body.teacher_period_id),
            date: req.body.date,
            notes: req.body.notes,
            entries: normalized,
            recorded_by_id: userId,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// GET /teachers/me/roll-calls?from=&to=&limit=
export const listMyRollCalls = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const data = await svc.listMyRollCalls(userId, {
            from: q.from as string | undefined,
            to: q.to as string | undefined,
            limit: q.limit ? Number(q.limit) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Oversight (SDM / Dean of Discipline / VP / Principal / SM) ----------

// GET /roll-calls/teacher-periods?date=&from=&to=&sub_class_id=&teacher_id=&subject_id=&only_with_absences=true&limit=
export const listRollCallsForOversight = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const data = await svc.listRollCallsForOversight({
            date: q.date as string | undefined,
            from: q.from as string | undefined,
            to: q.to as string | undefined,
            sub_class_id: q.sub_class_id ? Number(q.sub_class_id) : undefined,
            teacher_id: q.teacher_id ? Number(q.teacher_id) : undefined,
            subject_id: q.subject_id ? Number(q.subject_id) : undefined,
            only_with_absences: q.only_with_absences === 'true' || q.only_with_absences === true,
            limit: q.limit ? Number(q.limit) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// GET /roll-calls/teacher-periods/:id
export const getRollCallDetail = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid roll call id' });
        const data = await svc.getRollCallDetail(id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};
