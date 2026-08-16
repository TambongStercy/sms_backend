import { Request, Response } from 'express';
import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

/**
 * List periods, optionally scoped to one bell schedule.
 *
 * Query params (all optional):
 *   - periodSetId=<n>   : return only periods for that PeriodSet
 *   - subClassId=<n>    : resolve to the class -> period_set of that subclass
 *   - classId=<n>       : resolve to that class -> period_set
 *   - academicYearId=<n>: scope PeriodSet resolution (defaults to current)
 *   - includePeriodSet=true : embed periodSet inline on each row
 *
 * Without any scope this still returns every period so legacy callers keep
 * working, but callers rendering a timetable grid MUST scope to one set.
 */
export const getAllPeriods = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.finalQuery as Record<string, string | undefined>;

        let periodSetId: number | undefined;

        if (q.period_set_id) {
            periodSetId = parseInt(q.period_set_id);
        } else if (q.sub_class_id) {
            const subClassId = parseInt(q.sub_class_id);
            const sub = await prisma.subClass.findUnique({
                where: { id: subClassId },
                select: { class: { select: { period_set_id: true } } }
            });
            periodSetId = sub?.class?.period_set_id ?? undefined;
        } else if (q.class_id) {
            const cls = await prisma.class.findUnique({
                where: { id: parseInt(q.class_id) },
                select: { period_set_id: true }
            });
            periodSetId = cls?.period_set_id ?? undefined;
        }

        const where: any = {};
        if (periodSetId !== undefined) where.period_set_id = periodSetId;

        const periods = await prisma.period.findMany({
            where,
            orderBy: [
                { day_of_week: 'asc' },
                { sequence: 'asc' },
                { start_time: 'asc' }
            ],
            include: q.include_period_set === 'true' ? { period_set: true } : undefined
        });

        res.json({ success: true, data: periods });
    } catch (error: any) {
        console.error('Error fetching periods:', error);
        if (error.code === 'P1001' || error.message?.includes("Can't reach database server")) {
            res.status(503).json({ success: false, error: 'Database connection error.' });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// PREP is deliberately excluded — prep windows are now regular TEACHING slots
// so practicals and other subjects can be scheduled inside them.
const PERIOD_TYPES = ['TEACHING', 'BREAK'] as const;
const VALID_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const createPeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, day_of_week, start_time, end_time, is_break, type, sequence, period_set_id } = req.body;

        if (!name || !day_of_week || !start_time || !end_time) {
            res.status(400).json({ success: false, error: 'Missing required fields: name, day_of_week, start_time, end_time' });
            return;
        }
        if (!VALID_DAYS.includes(day_of_week)) {
            res.status(400).json({ success: false, error: `Invalid day_of_week. Must be one of: ${VALID_DAYS.join(', ')}` });
            return;
        }

        // Resolve type: prefer explicit `type`, otherwise map legacy `is_break`.
        let resolvedType: 'TEACHING' | 'BREAK' = 'TEACHING';
        if (type) {
            if (!PERIOD_TYPES.includes(type)) {
                res.status(400).json({ success: false, error: `Invalid type. Must be one of: ${PERIOD_TYPES.join(', ')}` });
                return;
            }
            resolvedType = type;
        } else if (is_break === true || is_break === 'true') {
            resolvedType = 'BREAK';
        }

        if (period_set_id !== undefined && period_set_id !== null) {
            const setExists = await prisma.periodSet.findUnique({ where: { id: parseInt(period_set_id) } });
            if (!setExists) {
                res.status(400).json({ success: false, error: `PeriodSet ${period_set_id} not found` });
                return;
            }
        }

        const period = await prisma.period.create({
            data: {
                name,
                day_of_week: day_of_week as any,
                start_time,
                end_time,
                is_break: resolvedType === 'BREAK',
                type: resolvedType as any,
                sequence: sequence !== undefined ? parseInt(sequence) : 0,
                period_set_id: period_set_id !== undefined && period_set_id !== null ? parseInt(period_set_id) : null
            }
        });

        res.status(201).json({ success: true, data: period });
    } catch (error: any) {
        console.error('Error creating period:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: 'A period with these details already exists' });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPeriodById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period ID format' });
            return;
        }
        const period = await prisma.period.findUnique({
            where: { id },
            include: { period_set: true }
        });
        if (!period) {
            res.status(404).json({ success: false, error: 'Period not found' });
            return;
        }
        res.json({ success: true, data: period });
    } catch (error: any) {
        console.error('Error fetching period:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updatePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period ID format' });
            return;
        }

        const { name, day_of_week, start_time, end_time, is_break, type, sequence, period_set_id } = req.body;

        if (day_of_week && !VALID_DAYS.includes(day_of_week)) {
            res.status(400).json({ success: false, error: `Invalid day_of_week. Must be one of: ${VALID_DAYS.join(', ')}` });
            return;
        }
        if (type && !PERIOD_TYPES.includes(type)) {
            res.status(400).json({ success: false, error: `Invalid type. Must be one of: ${PERIOD_TYPES.join(', ')}` });
            return;
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (day_of_week !== undefined) data.day_of_week = day_of_week as any;
        if (start_time !== undefined) data.start_time = start_time;
        if (end_time !== undefined) data.end_time = end_time;
        if (type !== undefined) {
            data.type = type as any;
            data.is_break = type === 'BREAK';
        } else if (is_break !== undefined) {
            const b = is_break === true || is_break === 'true';
            data.is_break = b;
            data.type = b ? 'BREAK' : 'TEACHING';
        }
        if (sequence !== undefined) data.sequence = parseInt(sequence);
        if (period_set_id !== undefined) {
            data.period_set_id = period_set_id === null ? null : parseInt(period_set_id);
        }

        const period = await prisma.period.update({ where: { id }, data });
        res.json({ success: true, data: period });
    } catch (error: any) {
        console.error('Error updating period:', error);
        if (error.code === 'P2025') { res.status(404).json({ success: false, error: 'Period not found' }); return; }
        if (error.code === 'P2002') { res.status(409).json({ success: false, error: 'A period with these details already exists' }); return; }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deletePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period ID format' });
            return;
        }
        const teacherPeriodCount = await prisma.teacherPeriod.count({ where: { period_id: id } });
        if (teacherPeriodCount > 0) {
            res.status(409).json({ success: false, error: 'Cannot delete period as it is being used in timetables' });
            return;
        }
        await prisma.period.delete({ where: { id } });
        res.json({ success: true, message: 'Period deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting period:', error);
        if (error.code === 'P2025') { res.status(404).json({ success: false, error: 'Period not found' }); return; }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ---------- PeriodSet endpoints ----------

/**
 * List every bell schedule, optionally scoped to one academic year.
 * Response items include ordered periods so the frontend can render a
 * grid from a single request.
 */
export const listPeriodSets = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.finalQuery as Record<string, string | undefined>;
        const academicYearId = q.academic_year_id ? parseInt(q.academic_year_id) : (await getCurrentAcademicYear())?.id;

        const sets = await prisma.periodSet.findMany({
            where: academicYearId ? { academic_year_id: academicYearId } : undefined,
            orderBy: [{ academic_year_id: 'asc' }, { code: 'asc' }],
            include: {
                periods: {
                    orderBy: [{ day_of_week: 'asc' }, { sequence: 'asc' }]
                }
            }
        });

        res.json({ success: true, data: sets });
    } catch (error: any) {
        console.error('Error listing period sets:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPeriodSetById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period set ID format' });
            return;
        }
        const set = await prisma.periodSet.findUnique({
            where: { id },
            include: {
                periods: { orderBy: [{ day_of_week: 'asc' }, { sequence: 'asc' }] },
                classes: { select: { id: true, name: true } }
            }
        });
        if (!set) {
            res.status(404).json({ success: false, error: 'Period set not found' });
            return;
        }
        res.json({ success: true, data: set });
    } catch (error: any) {
        console.error('Error fetching period set:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createPeriodSet = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, name, academic_year_id, description } = req.body;
        if (!code || !name) {
            res.status(400).json({ success: false, error: 'code and name are required' });
            return;
        }
        const yearId = academic_year_id ? parseInt(academic_year_id) : (await getCurrentAcademicYear())?.id;
        if (!yearId) {
            res.status(400).json({ success: false, error: 'academic_year_id required and no current year set' });
            return;
        }
        const set = await prisma.periodSet.create({
            data: { code, name, academic_year_id: yearId, description: description ?? null }
        });
        res.status(201).json({ success: true, data: set });
    } catch (error: any) {
        console.error('Error creating period set:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: 'A period set with this code already exists for that academic year' });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updatePeriodSet = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period set ID format' });
            return;
        }
        const { code, name, description } = req.body;
        const data: any = {};
        if (code !== undefined) data.code = code;
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;

        const set = await prisma.periodSet.update({ where: { id }, data });
        res.json({ success: true, data: set });
    } catch (error: any) {
        console.error('Error updating period set:', error);
        if (error.code === 'P2025') { res.status(404).json({ success: false, error: 'Period set not found' }); return; }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deletePeriodSet = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid period set ID format' });
            return;
        }
        const periodCount = await prisma.period.count({ where: { period_set_id: id } });
        if (periodCount > 0) {
            res.status(409).json({ success: false, error: 'Cannot delete period set while it still owns periods' });
            return;
        }
        const classCount = await prisma.class.count({ where: { period_set_id: id } });
        if (classCount > 0) {
            res.status(409).json({ success: false, error: 'Cannot delete period set while it is assigned to classes' });
            return;
        }
        await prisma.periodSet.delete({ where: { id } });
        res.json({ success: true, message: 'Period set deleted' });
    } catch (error: any) {
        console.error('Error deleting period set:', error);
        if (error.code === 'P2025') { res.status(404).json({ success: false, error: 'Period set not found' }); return; }
        res.status(500).json({ success: false, error: error.message });
    }
};
