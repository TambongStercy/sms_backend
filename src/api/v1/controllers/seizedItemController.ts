import { Request, Response } from 'express';
import { SeizedItemStatus } from '@prisma/client';
import * as svc from '../services/seizedItemService';

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

// ---------- Seizure ----------

export const createSeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.createSeizedItem(userId, {
            enrollment_id: Number(req.body.enrollment_id),
            item_description: req.body.item_description,
            reason: req.body.reason,
            photo_url: req.body.photo_url,
            location: req.body.location,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const updateSeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.updateSeizedItem(userId, id, {
            item_description: req.body.item_description,
            reason: req.body.reason,
            photo_url: req.body.photo_url,
            location: req.body.location,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const deleteSeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        await svc.deleteSeizedItem(userId, id);
        return res.json({ success: true });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Read ----------

export const listSeizedItems = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const rawStatus = typeof q.status === 'string' ? q.status.toUpperCase() : undefined;
        const status = rawStatus && Object.values(SeizedItemStatus).includes(rawStatus as any)
            ? (rawStatus as SeizedItemStatus)
            : undefined;
        const data = await svc.listSeizedItems({
            enrollment_id: q.enrollment_id ? Number(q.enrollment_id) : undefined,
            student_id: q.student_id ? Number(q.student_id) : undefined,
            status,
            custodian_id: q.custodian_id ? Number(q.custodian_id) : undefined,
            seized_by_id: q.seized_by_id ? Number(q.seized_by_id) : undefined,
            only_mine_as_custodian: q.only_mine_as_custodian === 'true' || q.only_mine_as_custodian === true,
            actor_id: userId,
            limit: q.limit ? Number(q.limit) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const getSeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.getSeizedItem(id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Transfers ----------

export const initiateTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.initiateTransfer(userId, id, {
            to_user_id: Number(req.body.to_user_id),
            note: req.body.note,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const acceptTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        const tid = Number(req.params.transferId);
        if (Number.isNaN(id) || Number.isNaN(tid)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const data = await svc.acceptTransfer(userId, id, tid);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const rejectTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        const tid = Number(req.params.transferId);
        if (Number.isNaN(id) || Number.isNaN(tid)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const data = await svc.rejectTransfer(userId, id, tid);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const cancelTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        const tid = Number(req.params.transferId);
        if (Number.isNaN(id) || Number.isNaN(tid)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const data = await svc.cancelTransfer(userId, id, tid);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Terminal ----------

export const releaseSeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.releaseSeizedItem(userId, id, {
            released_to_id: req.body.released_to_id ? Number(req.body.released_to_id) : undefined,
            notes: req.body.notes,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const destroySeizedItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.destroySeizedItem(userId, id, req.body.notes);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};
