// src/api/v1/controllers/feeController.ts
import { Request, Response } from 'express';
import * as feeService from '../services/feeService';

export const getAllFees = async (req: Request, res: Response) => {
    try {
        const fees = await feeService.getAllFees();
        res.json(fees);
    } catch (error: any) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createFee = async (req: Request, res: Response) => {
    try {
        const newFee = await feeService.createFee(req.body);
        res.status(201).json(newFee);
    } catch (error: any) {
        console.error('Error creating fee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const payment = await feeService.recordPayment(req.body);
        res.status(201).json(payment);
    } catch (error: any) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getFeePayments = async (req: Request, res: Response): Promise<any> => {
    try {
        const feeId = parseInt(req.params.feeId);
        const payments = await feeService.getFeePayments(feeId);

        if (!payments) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        res.json(payments);
    } catch (error: any) {
        console.error('Error fetching fee payments:', error);
        res.status(500).json({ error: error.message });
    }
};

export const exportFeeReports = async (req: Request, res: Response) => {
    try {
        const report = await feeService.exportFeeReports();
        res.json(report);
    } catch (error: any) {
        console.error('Error exporting fee reports:', error);
        res.status(500).json({ error: error.message });
    }
};
