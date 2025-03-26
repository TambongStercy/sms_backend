// src/api/v1/controllers/feeController.ts
import { Request, Response } from 'express';
import * as feeService from '../services/feeService';

export const getAllFees = async (req: Request, res: Response) => {
    try {
        // Use snake_case directly - middleware handles the conversion
        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const fees = await feeService.getAllFees(academic_year_id);
        res.json({
            success: true,
            data: fees
        });
    } catch (error: any) {
        console.error('Error fetching fees:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createFee = async (req: Request, res: Response) => {
    try {
        // Use the body directly - middleware handles the conversion to snake_case
        const feeData = req.body;
        const newFee = await feeService.createFee(feeData);

        res.status(201).json({
            success: true,
            data: newFee
        });
    } catch (error: any) {
        console.error('Error creating fee:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const feeId = parseInt(req.params.feeId);

        // Use the body directly plus fee_id - middleware handles the conversion
        const paymentData = { ...req.body, fee_id: feeId };
        const payment = await feeService.recordPayment(paymentData);

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error: any) {
        console.error('Error recording payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getFeePayments = async (req: Request, res: Response): Promise<any> => {
    try {
        const feeId = parseInt(req.params.feeId);
        const payments = await feeService.getFeePayments(feeId);

        if (!payments) {
            return res.status(404).json({
                success: false,
                error: 'Fee not found'
            });
        }

        // Response will be automatically converted to camelCase by middleware
        res.json({
            success: true,
            data: payments
        });
    } catch (error: any) {
        console.error('Error fetching fee payments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const exportFeeReports = async (req: Request, res: Response) => {
    try {
        // Use snake_case directly - middleware handles the conversion
        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const format = req.query.format as string || 'excel';

        const subclass_id = req.query.subclass_id ?
            parseInt(req.query.subclass_id as string) : undefined;

        const report = await feeService.exportFeeReports(academic_year_id);

        res.json({
            success: true,
            message: "Fee report exported successfully",
            data: report
        });
    } catch (error: any) {
        console.error('Error exporting fee reports:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
