import { Request, Response } from 'express';
import * as svc from '../services/expenditureService';
import { ExpenditureCategory, Role } from '../../../config/db';
import { getReceiptUrl } from '../../../utils/fileUpload';

const enrichReceiptUrl = (req: Request, expenditure: any) => ({
    ...expenditure,
    receipt_url: expenditure?.receipt_file ? getReceiptUrl(req, expenditure.receipt_file) : null,
});

export const createExpenditure = async (req: any, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const receiptFile = (req.file as any)?.filename ?? null;

        const created = await svc.createExpenditure({
            date: req.body.date,
            category: req.body.category as ExpenditureCategory,
            description: req.body.description,
            amount: Number(req.body.amount),
            recipient: req.body.recipient,
            recipient_user_id: req.body.recipientUserId ? Number(req.body.recipientUserId) : null,
            payment_method: req.body.paymentMethod ?? req.body.payment_method ?? null,
            receipt_file: receiptFile,
            notes: req.body.notes,
            recorded_by_id: userId,
        });

        return res.status(201).json({ success: true, data: enrichReceiptUrl(req, created) });
    } catch (err: any) {
        console.error('Error creating expenditure:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const listExpenditures = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await svc.listExpenditures({
            from: req.query.from as string | undefined,
            to: req.query.to as string | undefined,
            category: req.query.category as ExpenditureCategory | undefined,
            recorded_by_id: req.query.recordedById ? Number(req.query.recordedById) : undefined,
            recipient_user_id: req.query.recipientUserId ? Number(req.query.recipientUserId) : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        return res.json({
            success: true,
            data: result.data.map(e => enrichReceiptUrl(req, e)),
            meta: result.meta,
        });
    } catch (err: any) {
        console.error('Error listing expenditures:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getExpenditureById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const found = await svc.getExpenditureById(id);
        if (!found) return res.status(404).json({ success: false, error: 'Expenditure not found' });
        return res.json({ success: true, data: enrichReceiptUrl(req, found) });
    } catch (err: any) {
        console.error('Error fetching expenditure:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const updateExpenditure = async (req: any, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const userId = req.user?.id;
        const roles = (req.user?.role ?? []) as Role[];
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const receiptFile = (req.file as any)?.filename;

        const updated = await svc.updateExpenditure(id, {
            date: req.body.date,
            category: req.body.category as ExpenditureCategory | undefined,
            description: req.body.description,
            amount: req.body.amount !== undefined ? Number(req.body.amount) : undefined,
            recipient: req.body.recipient,
            recipient_user_id: req.body.recipientUserId !== undefined
                ? (req.body.recipientUserId === null || req.body.recipientUserId === '' ? null : Number(req.body.recipientUserId))
                : undefined,
            payment_method: req.body.paymentMethod ?? req.body.payment_method,
            receipt_file: receiptFile ?? req.body.receiptFile,
            notes: req.body.notes,
        }, userId, roles);

        return res.json({ success: true, data: enrichReceiptUrl(req, updated) });
    } catch (err: any) {
        const status = err.code === 'FORBIDDEN' ? 403 : 400;
        console.error('Error updating expenditure:', err);
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const deleteExpenditure = async (req: any, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        const roles = (req.user?.role ?? []) as Role[];
        await svc.deleteExpenditure(id, roles);
        return res.json({ success: true });
    } catch (err: any) {
        const status = err.code === 'FORBIDDEN' ? 403 : 400;
        console.error('Error deleting expenditure:', err);
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const getMonthlySummary = async (req: Request, res: Response): Promise<any> => {
    try {
        const month = req.query.month as string;
        if (!month) return res.status(400).json({ success: false, error: 'month is required (YYYY-MM)' });
        const summary = await svc.getMonthlySummary(month);
        return res.json({ success: true, data: summary });
    } catch (err: any) {
        console.error('Error generating monthly summary:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const exportExpenditures = async (req: Request, res: Response): Promise<any> => {
    try {
        const { buffer, filename } = await svc.exportExpendituresExcel({
            from: req.query.from as string | undefined,
            to: req.query.to as string | undefined,
            category: req.query.category as ExpenditureCategory | undefined,
            recorded_by_id: req.query.recordedById ? Number(req.query.recordedById) : undefined,
            recipient_user_id: req.query.recipientUserId ? Number(req.query.recipientUserId) : undefined,
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    } catch (err: any) {
        console.error('Error exporting expenditures:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
