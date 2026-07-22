import { Request, Response } from 'express';
import * as feeItemService from '../services/feeItemService';
import { FeeItemScope } from '../../../config/db';

export const createFeeItem = async (req: any, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const item = await feeItemService.createFeeItem({
            name: req.body.name,
            description: req.body.description,
            amount: Number(req.body.amount),
            academic_year_id: req.body.academic_year_id ?? req.body.academicYearId,
            scope: req.body.scope as FeeItemScope,
            class_id: req.body.class_id ?? req.body.classId ?? null,
            sub_class_id: req.body.sub_class_id ?? req.body.subClassId ?? null,
            requires_school_fees_paid: req.body.requires_school_fees_paid ?? req.body.requiresSchoolFeesPaid ?? false,
            is_active: req.body.is_active ?? req.body.isActive ?? true,
            created_by_id: userId,
        });

        return res.status(201).json({ success: true, data: item });
    } catch (err: any) {
        console.error('Error creating fee item:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const listFeeItems = async (req: Request, res: Response): Promise<any> => {
    try {
        const items = await feeItemService.listFeeItems({
            academic_year_id: req.query.academicYearId ? Number(req.query.academicYearId) : undefined,
            scope: req.query.scope as FeeItemScope | undefined,
            class_id: req.query.classId ? Number(req.query.classId) : undefined,
            sub_class_id: req.query.subClassId ? Number(req.query.subClassId) : undefined,
            is_active: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        });
        return res.json({ success: true, data: items });
    } catch (err: any) {
        console.error('Error listing fee items:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const updateFeeItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

        const item = await feeItemService.updateFeeItem(id, {
            name: req.body.name,
            description: req.body.description,
            amount: req.body.amount !== undefined ? Number(req.body.amount) : undefined,
            scope: req.body.scope,
            class_id: req.body.class_id ?? req.body.classId,
            sub_class_id: req.body.sub_class_id ?? req.body.subClassId,
            requires_school_fees_paid: req.body.requires_school_fees_paid ?? req.body.requiresSchoolFeesPaid,
            is_active: req.body.is_active ?? req.body.isActive,
        });

        return res.json({ success: true, data: item });
    } catch (err: any) {
        console.error('Error updating fee item:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const deleteFeeItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
        await feeItemService.deleteFeeItem(id);
        return res.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting fee item:', err);
        const status = err.message?.includes('Cannot delete') ? 409 : 400;
        return res.status(status).json({ success: false, error: err.message });
    }
};

export const getFeeItemsForEnrollment = async (req: Request, res: Response): Promise<any> => {
    try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        if (isNaN(enrollmentId)) return res.status(400).json({ success: false, error: 'Invalid enrollmentId' });

        const items = await feeItemService.getFeeItemsForEnrollment(enrollmentId);
        return res.json({ success: true, data: items });
    } catch (err: any) {
        console.error('Error fetching fee items for enrollment:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const recordFeeItemPayment = async (req: any, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const feeItemId = parseInt(req.params.id);
        if (isNaN(feeItemId)) return res.status(400).json({ success: false, error: 'Invalid fee item id' });

        const result = await feeItemService.recordFeeItemPayment({
            fee_item_id: feeItemId,
            enrollment_id: Number(req.body.enrollment_id ?? req.body.enrollmentId),
            amount: Number(req.body.amount),
            payment_date: req.body.payment_date ?? req.body.paymentDate,
            payment_method: req.body.payment_method ?? req.body.paymentMethod,
            receipt_number: req.body.receipt_number ?? req.body.receiptNumber,
            notes: req.body.notes,
            recorded_by_id: userId,
        });

        return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        console.error('Error recording fee item payment:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const getFeeItemPayments = async (req: Request, res: Response): Promise<any> => {
    try {
        const feeItemId = parseInt(req.params.id);
        if (isNaN(feeItemId)) return res.status(400).json({ success: false, error: 'Invalid fee item id' });

        const enrollmentId = req.query.enrollmentId ? parseInt(req.query.enrollmentId as string) : undefined;
        const payments = await feeItemService.getFeeItemPayments(feeItemId, enrollmentId);
        return res.json({ success: true, data: payments });
    } catch (err: any) {
        console.error('Error fetching fee item payments:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
};
