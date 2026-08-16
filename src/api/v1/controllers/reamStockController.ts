// src/api/v1/controllers/reamStockController.ts

import { Request, Response } from 'express';
import * as reamStockService from '../services/reamStockService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

function caller(req: Request): { id: number; roles: string[] } {
    const u = (req as AuthenticatedRequest).user!;
    return { id: u.id, roles: (u.role ?? []) as unknown as string[] };
}

function sendError(res: Response, err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /forbidden/i.test(message)
        ? 403
        : /not found/i.test(message)
        ? 404
        : /cannot issue|current stock/i.test(message)
        ? 409
        : 400;
    res.status(status).json({ success: false, error: message });
}

export async function getStockSummary(_req: Request, res: Response) {
    try {
        const data = await reamStockService.getStockSummary();
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function addReceipt(req: Request, res: Response) {
    try {
        const data = await reamStockService.addReceipt(
            { quantity: req.body.quantity, notes: req.body.notes },
            caller(req)
        );
        res.status(201).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function issueReams(req: Request, res: Response) {
    try {
        const data = await reamStockService.issueReams(
            {
                quantity: req.body.quantity,
                reason: req.body.reason,
                recipient_user_id: req.body.recipient_user_id,
                recipient_name: req.body.recipient_name,
                notes: req.body.notes,
            },
            caller(req)
        );
        res.status(201).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function listLedger(req: Request, res: Response) {
    try {
        const data = await reamStockService.listLedger({
            type: req.query.type as any,
            recipient_user_id: req.query.recipient_user_id
                ? parseInt(req.query.recipient_user_id as string)
                : undefined,
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            from_date: req.query.from_date as string | undefined,
            to_date: req.query.to_date as string | undefined,
        });
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}
