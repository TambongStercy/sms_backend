import { Request, Response } from 'express';
import prisma from '../../../config/db';
import * as academicYearService from '../services/academicYearService';
import * as timetableService from '../services/timetableService'; // Import the new service

/**
 * Get timetable for a specific sub_class
 */
export const getSubclassTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);

        if (isNaN(subclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subclassId format'
            });
            return;
        }

        let academicYearId = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        const result = await timetableService.getSubclassTimetable(subclassId, academicYearId);

        res.json({
            success: true,
            data: result.sub_class,
            academicYearId: result.academicYearId,
            slots: result.slots
        });
    } catch (error: any) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update multiple timetable slots at once for a specific sub_class
 */
export const bulkUpdateTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        const subclassId = parseInt(req.params.subclassId);
        const slots = req.body.slots;

        if (isNaN(subclassId) || !slots || !Array.isArray(slots)) {
            res.status(400).json({
                success: false,
                error: 'subclassId and slots array are required'
            });
            return;
        }

        // Get current academic year if not specified for the bulk update operation
        let academicYearId = req.body.academic_year_id ?? req.finalQuery.academic_year_id;
        if (!academicYearId) {
            const currentYear = await academicYearService.getCurrentYear();

            if (!currentYear) {
                res.status(404).json({
                    success: false,
                    error: 'No active academic year found for timetable update.'
                });
                return;
            }
            academicYearId = currentYear.id;
        }

        const assignedById = (req as any).user?.id;
        if (!assignedById) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated for assignment.'
            });
            return;
        }

        const result = await timetableService.bulkUpdateTimetable(subclassId, slots, academicYearId, assignedById);

        res.status(result.errors.length > 0 ? 207 : 200).json({
            success: result.errors.length === 0,
            data: {
                updated: result.updated,
                created: result.created,
                deleted: result.deleted,
            },
            errors: result.errors,
            message: result.errors.length > 0 ? 'Partial success with errors.' : 'Timetable updated successfully.'
        });

    } catch (error: any) {
        console.error('Error updating timetable:', error);
        if (error.code === 'P1001' || error.message.includes('Can\'t reach database server')) {
            return res.status(503).json({
                success: false,
                error: 'Database connection error. Please ensure the database is running and accessible.'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get the entire school timetable for a specific academic year.
 * @route GET /timetables/full-school
 */
export const getFullSchoolTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        let academicYearId: number | undefined;

        // Check if academicYearId is provided in query params
        if (req.query.academicYearId) {
            academicYearId = parseInt(req.query.academicYearId as string);
            if (isNaN(academicYearId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid academicYearId format.'
                });
                return;
            }
        }

        const fullTimetable = await timetableService.getFullSchoolTimetable(academicYearId);

        res.json({
            success: true,
            data: fullTimetable
        });
    } catch (error: any) {
        console.error('Error fetching full school timetable:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error fetching full school timetable.'
        });
    }
}; 