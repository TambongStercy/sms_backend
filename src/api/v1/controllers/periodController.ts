import { Request, Response } from 'express';
import prisma from '../../../config/db';

/**
 * Get all distinct period definitions (time slots), ordered by start time.
 */
export const getAllPeriods = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch distinct periods based on name, start_time, end_time, and is_break
        // Order them by start_time to get a logical sequence
        const periods = await prisma.period.findMany({
            distinct: ['name', 'start_time', 'end_time', 'is_break', 'day_of_week'],
            orderBy: {
                start_time: 'asc'
            },
            // Select only the fields needed for the response to match the documentation example
            select: {
                id: true,
                name: true,
                day_of_week: true,
                start_time: true,
                end_time: true,
                is_break: true
                // Note: sortOrder is not in the schema, using start_time for ordering
            }
        });

        // Transform the start_time/end_time if needed (e.g., remove seconds if stored as HH:MM:SS)
        // Example: If times are stored as 'HH:MM:SS' and you want 'HH:MM'
        // const formattedPeriods = periods.map(p => ({
        //     ...p,
        //     startTime: p.start_time.substring(0, 5),
        //     endTime: p.end_time.substring(0, 5)
        // }));

        res.json({
            success: true,
            // Use formattedPeriods if you applied transformations, otherwise use periods
            data: periods
        });
    } catch (error: any) {
        console.error('Error fetching periods:', error);
        // If the database connection error persists, this will still fail
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
 * Create a new period
 */
export const createPeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, day_of_week, start_time, end_time, is_break } = req.body;

        // Validate required fields
        if (!name || !day_of_week || !start_time || !end_time) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: name, day_of_week, start_time, end_time'
            });
            return;
        }

        // Validate day_of_week is a valid enum value
        const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        if (!validDays.includes(day_of_week)) {
            res.status(400).json({
                success: false,
                error: `Invalid day_of_week. Must be one of: ${validDays.join(', ')}`
            });
            return;
        }

        // Create the period
        const period = await prisma.period.create({
            data: {
                name,
                day_of_week: day_of_week as any, // Cast to DayOfWeek enum
                start_time,
                end_time,
                is_break: is_break === true || is_break === 'true'
            }
        });

        res.status(201).json({
            success: true,
            data: period
        });
    } catch (error: any) {
        console.error('Error creating period:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: 'A period with these details already exists'
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get a specific period by ID
 */
export const getPeriodById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid period ID format'
            });
            return;
        }

        const period = await prisma.period.findUnique({
            where: { id }
        });

        if (!period) {
            res.status(404).json({
                success: false,
                error: 'Period not found'
            });
            return;
        }

        res.json({
            success: true,
            data: period
        });
    } catch (error: any) {
        console.error('Error fetching period:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update a period
 */
export const updatePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid period ID format'
            });
            return;
        }

        const { name, day_of_week, start_time, end_time, is_break } = req.body;

        // Validate day_of_week is a valid enum value if provided
        if (day_of_week) {
            const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
            if (!validDays.includes(day_of_week)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid day_of_week. Must be one of: ${validDays.join(', ')}`
                });
                return;
            }
        }

        // Update the period
        const period = await prisma.period.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(day_of_week !== undefined && { day_of_week: day_of_week as any }),
                ...(start_time !== undefined && { start_time }),
                ...(end_time !== undefined && { end_time }),
                ...(is_break !== undefined && { is_break: is_break === true || is_break === 'true' })
            }
        });

        res.json({
            success: true,
            data: period
        });
    } catch (error: any) {
        console.error('Error updating period:', error);

        // Handle not found
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Period not found'
            });
            return;
        }

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: 'A period with these details already exists'
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Delete a period
 */
export const deletePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid period ID format'
            });
            return;
        }

        // Check if the period has any associated teacher periods
        const teacherPeriodCount = await prisma.teacherPeriod.count({
            where: { period_id: id }
        });

        if (teacherPeriodCount > 0) {
            res.status(409).json({
                success: false,
                error: 'Cannot delete period as it is being used in timetables'
            });
            return;
        }

        // Delete the period
        await prisma.period.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Period deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting period:', error);

        // Handle not found
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Period not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 