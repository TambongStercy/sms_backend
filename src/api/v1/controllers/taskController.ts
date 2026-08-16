// src/api/v1/controllers/taskController.ts

import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
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
        : 400;
    res.status(status).json({ success: false, error: message });
}

export async function createTask(req: Request, res: Response) {
    try {
        const data = await taskService.createTask(
            {
                title: req.body.title,
                description: req.body.description,
                assigned_to_id: parseInt(req.body.assigned_to_id ?? req.body.assignedToId),
                priority: req.body.priority,
                category: req.body.category,
                deadline: req.body.deadline,
                notes: req.body.notes,
            },
            caller(req)
        );
        res.status(201).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function listTasks(req: Request, res: Response) {
    try {
        const authReq = req as AuthenticatedRequest;
        // "mine" filter — task list for the logged-in user
        const mine = req.query.mine === 'true' || req.query.mine === '1';
        const assignedToId = mine
            ? authReq.user?.id
            : req.query.assigned_to_id
            ? parseInt(req.query.assigned_to_id as string)
            : undefined;

        const data = await taskService.listTasks({
            assigned_to_id: assignedToId,
            assigned_by_id: req.query.assigned_by_id ? parseInt(req.query.assigned_by_id as string) : undefined,
            status: req.query.status as any,
            priority: req.query.priority as any,
            category: req.query.category as string | undefined,
            overdue: req.query.overdue === 'true',
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        });
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function getTask(req: Request, res: Response) {
    try {
        const data = await taskService.getTask(parseInt(req.params.id));
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function updateTask(req: Request, res: Response) {
    try {
        const data = await taskService.updateTask(
            parseInt(req.params.id),
            {
                title: req.body.title,
                description: req.body.description,
                priority: req.body.priority,
                status: req.body.status,
                category: req.body.category,
                progress: req.body.progress != null ? Number(req.body.progress) : undefined,
                deadline: req.body.deadline,
                notes: req.body.notes,
            },
            caller(req)
        );
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function deleteTask(req: Request, res: Response) {
    try {
        const data = await taskService.deleteTask(parseInt(req.params.id), caller(req));
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}

export async function getMyTaskCounters(req: Request, res: Response) {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }
        const data = await taskService.getTaskCountersForUser(userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        sendError(res, err);
    }
}
