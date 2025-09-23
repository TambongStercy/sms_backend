// src/api/v1/controllers/unifiedPaymentController.ts
import { Request, Response } from 'express';
import * as unifiedPaymentService from '../services/unifiedPaymentService';

/**
 * Record payment for primary fees - creates fee if it doesn't exist
 * POST /api/v1/payments/primary
 */
export const recordPrimaryPaymentWithFee = async (req: Request, res: Response) => {
    try {
        // Use the body directly plus recorded_by_id - middleware handles the conversion
        const paymentData = {
            ...req.body,
            recorded_by_id: (req as any).user?.id || 1 // Get from authenticated user or default to 1
        };

        const result = await unifiedPaymentService.recordPrimaryPaymentWithFee(paymentData);

        res.status(201).json({
            success: true,
            message: result.feeCreated
                ? 'Payment recorded and fee created successfully'
                : 'Payment recorded successfully',
            data: {
                payment: result.payment,
                fee: result.fee,
                feeCreated: result.feeCreated
            }
        });
    } catch (error: any) {
        console.error('Error recording primary payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Record payment for control fees - creates fee if it doesn't exist
 * POST /api/v1/payments/control
 */
export const recordControlPaymentWithFee = async (req: Request, res: Response) => {
    try {
        // Use the body directly plus recorded_by_id - middleware handles the conversion
        const paymentData = {
            ...req.body,
            recorded_by_id: (req as any).user?.id || 1 // Get from authenticated user or default to 1
        };

        const result = await unifiedPaymentService.recordControlPaymentWithFee(paymentData);

        res.status(201).json({
            success: true,
            message: result.feeCreated
                ? 'Control payment recorded and fee created successfully'
                : 'Control payment recorded successfully',
            data: {
                payment: result.payment,
                fee: result.fee,
                feeCreated: result.feeCreated
            }
        });
    } catch (error: any) {
        console.error('Error recording control payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};