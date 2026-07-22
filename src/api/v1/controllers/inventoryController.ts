import { Request, Response } from 'express';
import { InventoryTransferStatus } from '@prisma/client';
import * as svc from '../services/inventoryService';

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

function isManagerRoles(roles: any): boolean {
    if (!Array.isArray(roles)) return false;
    return roles.some((r: any) => {
        const name = typeof r === 'string' ? r : r?.role;
        return name === 'MANAGER' || name === 'SUPER_MANAGER';
    });
}

// ---------- Catalog ----------

export const listItems = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const data = await svc.listItems({
            includeInactive: q.include_inactive === 'true' || q.include_inactive === true,
            search: q.search as string | undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const createItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.createItem(userId, {
            name: req.body.name,
            description: req.body.description,
            unit: req.body.unit,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const updateItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.updateItem(id, {
            name: req.body.name,
            description: req.body.description,
            unit: req.body.unit,
            is_active: req.body.is_active,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const deactivateItem = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid item id' });
        const data = await svc.deactivateItem(id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Manager stock ops ----------

export const grantStock = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.grantStock(userId, {
            userId: Number(req.body.user_id),
            itemId: Number(req.body.item_id),
            quantity: Number(req.body.quantity),
            note: req.body.note,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const adjustStock = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.adjustStock(userId, {
            userId: Number(req.body.user_id),
            itemId: Number(req.body.item_id),
            delta: Number(req.body.delta),
            note: req.body.note,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Read holdings ----------

// Managers may pass ?user_id=; anyone else always sees their own.
export const listHoldings = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const requestedId = q.user_id ? Number(q.user_id) : null;
        let target = userId;
        if (requestedId && requestedId !== userId) {
            if (!isManagerRoles(req.user.roles)) {
                return res.status(403).json({ success: false, error: 'Only managers can view other users\' inventory' });
            }
            target = requestedId;
        }
        const data = await svc.listHoldings(target);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const myHoldings = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.listHoldings(userId);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const myLedger = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const data = await svc.listLedger(userId, {
            itemId: q.item_id ? Number(q.item_id) : undefined,
            limit: q.limit ? Number(q.limit) : undefined,
            before: q.before as string | undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// ---------- Transfers ----------

export const initiateTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.initiateTransfer(userId, {
            itemId: Number(req.body.item_id),
            toUserId: Number(req.body.to_user_id),
            quantity: Number(req.body.quantity),
            note: req.body.note,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const acceptTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid transfer id' });
        const data = await svc.acceptTransfer(userId, id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const rejectTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid transfer id' });
        const data = await svc.rejectTransfer(userId, id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const cancelTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid transfer id' });
        const data = await svc.cancelTransfer(userId, id);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const getTransfer = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid transfer id' });
        const data = await svc.getTransfer(userId, id, isManagerRoles(req.user.roles));
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const myTransfers = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const direction = q.direction === 'incoming' || q.direction === 'outgoing' ? q.direction : undefined;
        const rawStatus = typeof q.status === 'string' ? q.status.toUpperCase() : undefined;
        const status = rawStatus && Object.values(InventoryTransferStatus).includes(rawStatus as any)
            ? (rawStatus as InventoryTransferStatus)
            : undefined;
        const data = await svc.listMyTransfers(userId, {
            direction: direction as any,
            status,
            limit: q.limit ? Number(q.limit) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};
