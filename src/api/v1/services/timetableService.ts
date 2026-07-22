// src/api/v1/services/timetableService.ts

import prisma, { DayOfWeek, TeacherPeriod } from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';
import { PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import * as academicYearService from './academicYearService';
import * as XLSX from 'xlsx';

export interface TimetableSlotOutput {
    id: number;
    subClassId: number;
    subClassName: string;
    classId: number;
    className: string;
    day: DayOfWeek;
    periodId: number;
    periodName: string;
    periodStartTime: string;
    periodEndTime: string;
    isBreak: boolean;
    subjectId: number | null;
    subjectName: string | null;
    subjectCategory: string | null;
    teacherId: number | null;
    teacherName: string | null;
}

export interface FullSchoolTimetable {
    academicYearId: number;
    academicYearName: string;
    timetableSlots: TimetableSlotOutput[];
}

/**
 * Gets the entire school timetable for a given academic year.
 * @param academicYearId - The ID of the academic year. If not provided, defaults to the current active year.
 * @returns A structured object containing the academic year info and all timetable slots.
 */
export async function getFullSchoolTimetable(academicYearId?: number): Promise<FullSchoolTimetable> {
    const currentYear = academicYearId ?
        await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
        await getCurrentAcademicYear();

    if (!currentYear) {
        throw new Error('No active academic year found to generate school timetable.');
    }

    const teacherPeriods = await prisma.teacherPeriod.findMany({
        where: {
            academic_year_id: currentYear.id,
        },
        include: {
            period: true,
            teacher: true,
            subject: true,
            sub_class: {
                include: {
                    class: true,
                },
            },
        },
        orderBy: [
            { sub_class: { class: { name: 'asc' } } },
            { sub_class: { name: 'asc' } },
            { period: { day_of_week: 'asc' } },
            { period: { start_time: 'asc' } },
        ],
    });

    const timetableSlots: TimetableSlotOutput[] = teacherPeriods.map(tp => ({
        id: tp.id,
        subClassId: tp.sub_class.id,
        subClassName: tp.sub_class.name,
        classId: tp.sub_class.class.id,
        className: tp.sub_class.class.name,
        day: tp.period.day_of_week,
        periodId: tp.period.id,
        periodName: tp.period.name,
        periodStartTime: tp.period.start_time,
        periodEndTime: tp.period.end_time,
        isBreak: tp.period.is_break,
        subjectId: tp.subject?.id || null,
        subjectName: tp.subject?.name || null,
        subjectCategory: tp.subject?.category || null,
        teacherId: tp.teacher?.id || null,
        teacherName: tp.teacher?.name || null,
    }));

    return {
        academicYearId: currentYear.id,
        academicYearName: currentYear.name || 'Unknown Academic Year',
        timetableSlots,
    };
}

export interface SubclassTimetableResult {
    sub_class: {
        id: number;
        name: string;
        class: {
            id: number;
            name: string;
        };
    };
    academicYearId: number;
    slots: TimetableSlotOutput[];
}

/**
 * Gets the timetable for a specific subclass.
 * @param subclassId - The ID of the subclass.
 * @param academicYearId - The ID of the academic year. If not provided, defaults to the current active year.
 * @returns The timetable for the specified subclass.
 */
export async function getSubclassTimetable(subclassId: number, academicYearId?: number): Promise<SubclassTimetableResult> {
    // Verify the sub_class exists
    const sub_class = await prisma.subClass.findUnique({
        where: { id: subclassId },
        include: { class: true }
    });

    if (!sub_class) {
        throw new Error('Subclass not found');
    }

    // Fetch academic year if needed (using current if not specified)
    let currentAcademicYearId = academicYearId;
    if (!currentAcademicYearId) {
        const currentYear = await academicYearService.getCurrentYear();
        if (!currentYear) {
            throw new Error('No active academic year found');
        }
        currentAcademicYearId = currentYear.id;
    }

    // Get all teacher periods for this sub_class using direct references
    const teacherPeriods = await prisma.teacherPeriod.findMany({
        where: {
            sub_class_id: subclassId,
            academic_year_id: currentAcademicYearId
        },
        include: {
            period: true,
            teacher: true,
            subject: true,
            sub_class: {
                include: {
                    class: true,
                },
            },
        },
        orderBy: [
            { period: { day_of_week: 'asc' } },
            { period: { start_time: 'asc' } },
        ]
    });

    // Transform data to desired format for frontend
    const slots: TimetableSlotOutput[] = teacherPeriods.map(tp => ({
        id: tp.id,
        subClassId: tp.sub_class.id,
        subClassName: tp.sub_class.name,
        classId: tp.sub_class.class.id,
        className: tp.sub_class.class.name,
        day: tp.period.day_of_week,
        periodId: tp.period.id,
        periodName: tp.period.name,
        periodStartTime: tp.period.start_time,
        periodEndTime: tp.period.end_time,
        isBreak: tp.period.is_break,
        subjectId: tp.subject?.id || null,
        subjectName: tp.subject?.name || null,
        subjectCategory: tp.subject?.category || null,
        teacherId: tp.teacher?.id || null,
        teacherName: tp.teacher?.name || null,
    }));

    return {
        sub_class: {
            id: sub_class.id,
            name: sub_class.name,
            class: {
                id: sub_class.class.id,
                name: sub_class.class.name
            }
        },
        academicYearId: currentAcademicYearId,
        slots: slots
    };
}

export interface BulkUpdateTimetableSlotInput {
    period_id: number;
    subject_id: number | null;
    teacher_id: number | null;
}

export interface BulkUpdateTimetableResult {
    updated: number;
    created: number;
    deleted: number;
    errors: { periodId: number; error: string }[];
}

/**
 * Updates multiple timetable slots at once for a specific subclass.
 * @param subclassId - The ID of the subclass.
 * @param slots - An array of timetable slots to update.
 * @param academicYearId - The ID of the academic year. If not provided, defaults to the current active year.
 * @param assignedById - The ID of the user performing the assignment.
 * @returns A summary of updated, created, and deleted slots, and any errors.
 */
export async function bulkUpdateTimetable(
    subclassId: number,
    slots: BulkUpdateTimetableSlotInput[],
    academicYearId: number,
    assignedById: number
): Promise<BulkUpdateTimetableResult> {

    // Verify the sub_class exists
    const sub_class = await prisma.subClass.findUnique({
        where: { id: subclassId }
    });

    if (!sub_class) {
        throw new Error('Subclass not found');
    }

    // Prepare response data to track success and errors
    const result: BulkUpdateTimetableResult = {
        updated: 0,
        created: 0,
        deleted: 0,
        errors: [] as { periodId: number; error: string }[]
    };

    // Process each slot in the array
    for (const slot of slots) {
        // Only need period_id, subject_id, teacher_id from the slot
        const { period_id, subject_id, teacher_id } = slot;

        // Validate period_id exists
        if (period_id === undefined || period_id === null) {
            result.errors.push({
                periodId: period_id || 0,
                error: 'Missing required field: period_id'
            });
            continue;
        }

        const parsedPeriodId = parseInt(period_id as any);
        if (isNaN(parsedPeriodId)) {
            result.errors.push({
                periodId: period_id,
                error: 'Invalid period_id format'
            });
            continue;
        }

        try {
            // Find the period using only its ID
            const period = await prisma.period.findUnique({
                where: {
                    id: parsedPeriodId
                }
            });

            // Check if period was found
            if (!period) {
                result.errors.push({
                    periodId: parsedPeriodId,
                    error: `Period with ID ${parsedPeriodId} not found`
                });
                continue;
            }

            // --- Logic for clearing assignment (subject and teacher are null) ---
            if (subject_id === null && teacher_id === null) {
                const existingAssignments = await prisma.teacherPeriod.findMany({
                    where: {
                        sub_class_id: subclassId,
                        period_id: period.id,
                        academic_year_id: academicYearId
                    }
                });

                for (const assignment of existingAssignments) {
                    await prisma.teacherPeriod.delete({
                        where: { id: assignment.id }
                    });
                    result.deleted++;
                }
                continue; // Move to the next slot
            }

            // --- Logic for setting/updating assignment (subject and teacher provided) ---

            // Ensure both subject_id and teacher_id are provided if one is
            if ((subject_id === undefined || subject_id === null || !teacher_id) || (teacher_id === undefined || teacher_id === null || !subject_id)) {
                result.errors.push({
                    periodId: parsedPeriodId,
                    error: 'Both subject_id and teacher_id must be provided (or both null to clear)'
                });
                continue;
            }

            const parsedSubjectId = parseInt(subject_id as any);
            const parsedTeacherId = parseInt(teacher_id as any);

            if (isNaN(parsedSubjectId) || isNaN(parsedTeacherId)) {
                result.errors.push({
                    periodId: parsedPeriodId,
                    error: 'Invalid subject_id or teacher_id format'
                });
                continue;
            }

            // Validate that the teacher can teach this subject (check if there's a subject-teacher relationship)
            const canTeachSubject = await prisma.subjectTeacher.findFirst({
                where: {
                    subject_id: parsedSubjectId,
                    teacher_id: parsedTeacherId
                }
            });

            if (!canTeachSubject) {
                result.errors.push({
                    periodId: parsedPeriodId,
                    error: `Teacher ${parsedTeacherId} is not authorized to teach subject ${parsedSubjectId}`
                });
                continue;
            }

            // Check for teacher conflicts (same teacher, same period, different subclass)
            const teacherConflict = await prisma.teacherPeriod.findFirst({
                where: {
                    teacher_id: parsedTeacherId,
                    period_id: period.id,
                    academic_year_id: academicYearId,
                    sub_class_id: { not: subclassId }
                },
                include: {
                    sub_class: true,
                    period: true
                }
            });

            if (teacherConflict) {
                result.errors.push({
                    periodId: parsedPeriodId,
                    error: `Teacher conflict: already assigned to ${teacherConflict.sub_class.name} on ${teacherConflict.period.day_of_week} during period ${teacherConflict.period.name}`
                });
                continue;
            }

            // Find existing assignment for this specific subject+period slot
            const existingAssignment = await prisma.teacherPeriod.findFirst({
                where: {
                    sub_class_id: subclassId,
                    period_id: period.id,
                    subject_id: parsedSubjectId,
                    academic_year_id: academicYearId
                }
            });

            if (existingAssignment) {
                // Update existing assignment
                await prisma.teacherPeriod.update({
                    where: { id: existingAssignment.id },
                    data: {
                        teacher_id: parsedTeacherId,
                        subject_id: parsedSubjectId,
                        assigned_by_id: assignedById
                    }
                });
                result.updated++;
            } else {
                // Create new assignment
                await prisma.teacherPeriod.create({
                    data: {
                        teacher_id: parsedTeacherId,
                        subject_id: parsedSubjectId,
                        sub_class_id: subclassId,
                        period_id: period.id,
                        academic_year_id: academicYearId,
                        assigned_by_id: assignedById
                    }
                });
                result.created++;
            }

        } catch (error: any) {
            console.error(`Error processing slot for period ${parsedPeriodId}:`, error);
            result.errors.push({
                periodId: parsedPeriodId,
                error: error.message
            });
        }
    }
    // Return the summary of changes
    return result;
}

const DAY_ORDER: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Exports the timetable for a specific subclass as an Excel file.
 */
export async function exportSubclassTimetableExcel(subclassId: number, academicYearId?: number): Promise<{ buffer: Buffer; filename: string }> {
    const data = await getSubclassTimetable(subclassId, academicYearId);
    const workbook = XLSX.utils.book_new();

    // Get unique sorted periods (by start_time)
    const periodsMap = new Map<number, { id: number; name: string; start: string; end: string; isBreak: boolean }>();
    for (const slot of data.slots) {
        if (!periodsMap.has(slot.periodId)) {
            periodsMap.set(slot.periodId, { id: slot.periodId, name: slot.periodName, start: slot.periodStartTime, end: slot.periodEndTime, isBreak: slot.isBreak });
        }
    }
    const periods = Array.from(periodsMap.values()).sort((a, b) => a.start.localeCompare(b.start));

    // Group slots by day+period for multi-subject support
    const slotMap = new Map<string, TimetableSlotOutput[]>();
    for (const slot of data.slots) {
        const key = `${slot.day}_${slot.periodId}`;
        if (!slotMap.has(key)) slotMap.set(key, []);
        slotMap.get(key)!.push(slot);
    }

    // Build grid: rows = periods, columns = days
    const days = DAY_ORDER.filter(d => data.slots.some(s => s.day === d));
    const header = ['Period', 'Time', ...days.map(d => d.charAt(0) + d.slice(1).toLowerCase())];
    const rows: string[][] = [header];

    for (const period of periods) {
        const row: string[] = [
            period.name,
            `${period.start} - ${period.end}`,
        ];
        for (const day of days) {
            if (period.isBreak) {
                row.push('BREAK');
            } else {
                const slots = slotMap.get(`${day}_${period.id}`) || [];
                const cellLines = slots.map(s => {
                    const subj = s.subjectName || '';
                    const teacher = s.teacherName || '';
                    return teacher ? `${subj} (${teacher})` : subj;
                });
                row.push(cellLines.join(' / ') || '-');
            }
        }
        rows.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Auto-size columns
    worksheet['!cols'] = header.map((_, i) => ({ wch: i < 2 ? 18 : 30 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, data.sub_class.name.substring(0, 31));

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const filename = `timetable_${data.sub_class.name.replace(/\s+/g, '_')}.xlsx`;
    return { buffer, filename };
}

/**
 * Exports the full school timetable as an Excel file with one sheet per subclass.
 */
export async function exportFullTimetableExcel(academicYearId?: number): Promise<{ buffer: Buffer; filename: string }> {
    const data = await getFullSchoolTimetable(academicYearId);
    const workbook = XLSX.utils.book_new();

    // Group slots by subclass
    const subclassMap = new Map<number, { name: string; className: string; slots: TimetableSlotOutput[] }>();
    for (const slot of data.timetableSlots) {
        if (!subclassMap.has(slot.subClassId)) {
            subclassMap.set(slot.subClassId, { name: slot.subClassName, className: slot.className, slots: [] });
        }
        subclassMap.get(slot.subClassId)!.slots.push(slot);
    }

    // Get all unique periods across the school
    const allPeriodsMap = new Map<number, { id: number; name: string; start: string; end: string; isBreak: boolean }>();
    for (const slot of data.timetableSlots) {
        if (!allPeriodsMap.has(slot.periodId)) {
            allPeriodsMap.set(slot.periodId, { id: slot.periodId, name: slot.periodName, start: slot.periodStartTime, end: slot.periodEndTime, isBreak: slot.isBreak });
        }
    }
    const allPeriods = Array.from(allPeriodsMap.values()).sort((a, b) => a.start.localeCompare(b.start));
    const allDays = DAY_ORDER.filter(d => data.timetableSlots.some(s => s.day === d));

    // Sort subclasses by class name then subclass name
    const sortedSubclasses = Array.from(subclassMap.entries()).sort((a, b) => {
        const cmp = a[1].className.localeCompare(b[1].className);
        return cmp !== 0 ? cmp : a[1].name.localeCompare(b[1].name);
    });

    for (const [subClassId, sc] of sortedSubclasses) {
        const slotMap = new Map<string, TimetableSlotOutput[]>();
        for (const slot of sc.slots) {
            const key = `${slot.day}_${slot.periodId}`;
            if (!slotMap.has(key)) slotMap.set(key, []);
            slotMap.get(key)!.push(slot);
        }

        const header = ['Period', 'Time', ...allDays.map(d => d.charAt(0) + d.slice(1).toLowerCase())];
        const rows: string[][] = [header];

        for (const period of allPeriods) {
            const row: string[] = [period.name, `${period.start} - ${period.end}`];
            for (const day of allDays) {
                if (period.isBreak) {
                    row.push('BREAK');
                } else {
                    const slots = slotMap.get(`${day}_${period.id}`) || [];
                    const cellLines = slots.map(s => {
                        const subj = s.subjectName || '';
                        const teacher = s.teacherName || '';
                        return teacher ? `${subj} (${teacher})` : subj;
                    });
                    row.push(cellLines.join(' / ') || '-');
                }
            }
            rows.push(row);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        worksheet['!cols'] = header.map((_, i) => ({ wch: i < 2 ? 18 : 30 }));

        // Sheet names max 31 chars
        const sheetName = `${sc.className} - ${sc.name}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const filename = `timetable_full_school_${data.academicYearName.replace(/\s+/g, '_')}.xlsx`;
    return { buffer, filename };
}