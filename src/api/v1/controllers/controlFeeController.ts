// src/api/v1/controllers/controlFeeController.ts
import { Request, Response } from 'express';
import * as controlFeeService from '../services/controlFeeService';
import { PaginationOptions, FilterOptions } from '../../../utils/pagination';

export const getAllControlFees = async (req: Request, res: Response) => {
    try {
        const academic_year_id = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const paginationOptions: PaginationOptions = {
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        };

        const filterOptions: FilterOptions = {
            search: req.query.search as string, // Consolidated search
            className: req.query.className as string,
            subclassName: req.query.subclassName as string,
            dueDate: req.query.dueDate as string,
            dueBeforeDate: req.query.dueBeforeDate as string,
            dueAfterDate: req.query.dueAfterDate as string,
            classId: req.query.classId as string,
            subClassId: req.query.subClassId as string,
            studentIdentifier: req.query.studentIdentifier as string,
            paymentStatus: req.query.paymentStatus as string
        };

        const fees = await controlFeeService.getAllControlFees(paginationOptions, filterOptions, academic_year_id);
        res.json({
            success: true,
            data: fees
        });
    } catch (error: any) {
        console.error('Error fetching control fees:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getControlFeeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const fee = await controlFeeService.getControlFeeById(id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                error: 'Control fee not found'
            });
        }

        res.json({
            success: true,
            data: fee
        });
    } catch (error: any) {
        console.error('Error fetching control fee:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createControlFee = async (req: Request, res: Response) => {
    try {
        // Use the body directly - middleware handles the conversion to snake_case
        const feeData = req.body;
        const newFee = await controlFeeService.createControlFee(feeData);

        res.status(201).json({
            success: true,
            data: newFee
        });
    } catch (error: any) {
        console.error('Error creating control fee:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateControlFee = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const feeData = req.body;

        const updatedFee = await controlFeeService.updateControlFee(id, feeData);

        res.json({
            success: true,
            data: updatedFee
        });
    } catch (error: any) {
        console.error('Error updating control fee:', error);

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

export const deleteControlFee = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);

        await controlFeeService.deleteControlFee(id);

        res.json({
            success: true,
            message: 'Control fee deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting control fee:', error);

        // Check for specific error types
        if (error.message.includes('Cannot delete control fee with existing payment records')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({
                success: false,
                error: 'Control fee not found'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getStudentControlFees = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.studentId);

        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const fees = await controlFeeService.getStudentControlFees(studentId, academic_year_id);

        res.json({
            success: true,
            data: fees
        });
    } catch (error: any) {
        console.error('Error fetching student control fees:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getSubclassControlFeesSummary = async (req: Request, res: Response) => {
    try {
        const sub_classId = parseInt(req.params.sub_classId ?? req.params.id);

        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) : undefined;

        const summary = await controlFeeService.getSubclassControlFeesSummary(sub_classId, academic_year_id);

        res.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        console.error('Error fetching sub_class control fees summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const recordControlPayment = async (req: Request, res: Response) => {
    try {
        const controlFeeId = parseInt(req.params.controlFeeId);

        // Use the body directly plus control_fee_id and recorded_by_id - middleware handles the conversion
        const paymentData = {
            ...req.body,
            control_fee_id: controlFeeId,
            recorded_by_id: (req as any).user?.id || 1 // Get from authenticated user or default to 1
        };
        const payment = await controlFeeService.recordControlPayment(paymentData);

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error: any) {
        console.error('Error recording control payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getControlFeePayments = async (req: Request, res: Response): Promise<any> => {
    try {
        const controlFeeId = parseInt(req.params.controlFeeId);
        const payments = await controlFeeService.getControlFeePayments(controlFeeId);

        if (!payments) {
            return res.status(404).json({
                success: false,
                error: 'Control fee not found'
            });
        }

        // Response will be automatically converted to camelCase by middleware
        res.json({
            success: true,
            data: payments
        });
    } catch (error: any) {
        console.error('Error fetching control fee payments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const exportControlFeeReports = async (req: Request, res: Response) => {
    try {
        const academic_year_id = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;
        const sub_class_id = req.query.subClassId ?
            parseInt(req.query.subClassId as string) : undefined;
        const class_id = req.query.classId ?
            parseInt(req.query.classId as string) : undefined;
        const student_identifier = req.query.studentIdentifier as string;
        const payment_status = req.query.paymentStatus as string;
        const format = (req.query.format as string || 'csv').toLowerCase();

        // Validate format
        if (!['csv', 'pdf', 'docx', 'xlsx', 'excel'].includes(format)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid format requested. Supported formats are: csv, pdf, docx, xlsx, excel.'
            });
        }

        // Map 'excel' to 'xlsx' for proper file generation
        const normalizedFormat = format === 'excel' ? 'xlsx' : format;

        const { buffer, contentType, filename } = await controlFeeService.exportControlFeeReports(
            academic_year_id,
            sub_class_id,
            class_id,
            student_identifier,
            payment_status,
            normalizedFormat as 'csv' | 'pdf' | 'docx' | 'xlsx'
        );

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);

    } catch (error: any) {
        console.error('Error exporting control fee reports:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during control fee report export.'
        });
    }
};