import { Request, Response } from 'express';
import * as StudentAverageService from '../services/studentAverageService';

/**
 * Calculate and save student averages for a sequence
 * @route POST /api/v1/student-averages/calculate/:examSequenceId
 */
export const calculateStudentAverages = async (req: Request, res: Response): Promise<any> => {
    try {
        const examSequenceId = parseInt(req.params.examSequenceId);
        const { subclassId } = req.query;

        const subclassIdNum = subclassId ? parseInt(subclassId as string) : undefined;

        const averages = await StudentAverageService.calculateAndSaveStudentAverages(
            examSequenceId,
            subclassIdNum
        );

        return res.status(200).json({
            status: 'success',
            data: {
                averages,
                count: averages.length,
            },
        });
    } catch (error: any) {
        console.error('Error calculating student averages:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'An error occurred while calculating student averages',
        });
    }
};

/**
 * Get student averages for a sequence
 * @route GET /api/v1/student-averages/sequence/:examSequenceId
 */
export const getSequenceAverages = async (req: Request, res: Response): Promise<any> => {
    try {
        const examSequenceId = parseInt(req.params.examSequenceId);
        const { subclassId } = req.query;

        const subclassIdNum = subclassId ? parseInt(subclassId as string) : undefined;

        const averages = await StudentAverageService.getStudentAverages(examSequenceId, subclassIdNum);

        return res.status(200).json({
            status: 'success',
            data: {
                averages,
                count: averages.length,
            },
        });
    } catch (error: any) {
        console.error('Error retrieving student averages:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'An error occurred while retrieving student averages',
        });
    }
};

/**
 * Get a specific student's average
 * @route GET /api/v1/student-averages/:enrollmentId/:examSequenceId
 */
export const getStudentAverage = async (req: Request, res: Response): Promise<any> => {
    try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const examSequenceId = parseInt(req.params.examSequenceId);

        const average = await StudentAverageService.getStudentAverage(enrollmentId, examSequenceId);

        if (!average) {
            return res.status(404).json({
                status: 'error',
                message: 'Student average not found',
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                average,
            },
        });
    } catch (error: any) {
        console.error('Error retrieving student average:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'An error occurred while retrieving student average',
        });
    }
};

/**
 * Update decision for a student's average
 * @route PATCH /api/v1/student-averages/:id/decision
 */
export const updateDecision = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const { decision } = req.body;

        if (!decision) {
            return res.status(400).json({
                status: 'error',
                message: 'Decision is required',
            });
        }

        const updatedAverage = await StudentAverageService.updateDecision(id, decision);

        return res.status(200).json({
            status: 'success',
            data: {
                average: updatedAverage,
            },
        });
    } catch (error: any) {
        console.error('Error updating decision:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'An error occurred while updating decision',
        });
    }
}; 