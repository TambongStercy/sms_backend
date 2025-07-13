// src/api/v1/controllers/feeController.ts
import { Request, Response } from 'express';
import * as feeService from '../services/feeService';
import { PaginationOptions, FilterOptions } from '../../../utils/pagination';

export const getAllFees = async (req: Request, res: Response) => {
    try {
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const paginationOptions: PaginationOptions = {
            page: req.finalQuery.page ? parseInt(req.finalQuery.page as string) : undefined,
            limit: req.finalQuery.limit ? parseInt(req.finalQuery.limit as string) : undefined,
        };

        const filterOptions: FilterOptions = {
            search: req.finalQuery.search as string, // Consolidated search
            className: req.finalQuery.className as string,
            subclassName: req.finalQuery.subclassName as string,
            dueDate: req.finalQuery.dueDate as string,
            dueBeforeDate: req.finalQuery.dueBeforeDate as string,
            dueAfterDate: req.finalQuery.dueAfterDate as string,
        };

        const fees = await feeService.getAllFees(paginationOptions, filterOptions, academic_year_id);
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

export const getFeeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const fee = await feeService.getFeeById(id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                error: 'Fee not found'
            });
        }

        res.json({
            success: true,
            data: fee
        });
    } catch (error: any) {
        console.error('Error fetching fee:', error);
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

export const updateFee = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const feeData = req.body;

        const updatedFee = await feeService.updateFee(id, feeData);

        res.json({
            success: true,
            data: updatedFee
        });
    } catch (error: any) {
        console.error('Error updating fee:', error);

        // Check if it's a "not found" error
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteFee = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);

        await feeService.deleteFee(id);

        res.json({
            success: true,
            message: 'Fee deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting fee:', error);

        // Check for specific error types
        if (error.message.includes('Cannot delete fee with existing payment records')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({
                success: false,
                error: 'Fee not found'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getStudentFees = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.studentId);

        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const fees = await feeService.getStudentFees(studentId, academic_year_id);

        res.json({
            success: true,
            data: fees
        });
    } catch (error: any) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getSubclassFeesSummary = async (req: Request, res: Response) => {
    try {
        const sub_classId = parseInt(req.params.sub_classId ?? req.params.id);

        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const summary = await feeService.getSubclassFeesSummary(sub_classId, academic_year_id);

        res.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        console.error('Error fetching sub_class fees summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const feeId = parseInt(req.params.feeId);

        // Use the body directly plus fee_id and recorded_by_id - middleware handles the conversion
        const paymentData = {
            ...req.body,
            fee_id: feeId,
            recorded_by_id: (req as any).user?.id || 1 // Get from authenticated user or default to 1
        };
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
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const format = req.finalQuery.format as string || 'excel';

        const sub_class_id = req.finalQuery.sub_class_id ?
            parseInt(req.finalQuery.sub_class_id as string) : undefined;

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
