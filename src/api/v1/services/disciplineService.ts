// src/api/v1/services/disciplineService.ts
import { StudentAbsence, TeacherAbsence, DisciplineIssue, DisciplineType, AbsenceType } from '@prisma/client';
import prisma from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

// SDM Lateness tracking interface
export interface LatenessRecord {
    student_id: number;
    minutes_late?: number;
    reason?: string;
    arrival_time?: string; // HH:MM format
}

export interface BulkLatenessData {
    date: string; // YYYY-MM-DD
    records: LatenessRecord[];
    academic_year_id?: number;
}

/**
 * Record morning lateness for a single student (SDM use)
 */
export async function recordMorningLateness(data: {
    student_id: number;
    academic_year_id?: number;
    assigned_by_id: number;
    minutes_late?: number;
    reason?: string;
    arrival_time?: string;
    date?: string;
}): Promise<StudentAbsence> {
    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    // Get student enrollment for the academic year
    const enrollment = await getStudentSubclassByStudentAndYear(data.student_id, yearId);
    if (!enrollment) {
        throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year`);
    }

    // Check if lateness already recorded for today
    const today = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingLateness = await prisma.studentAbsence.findFirst({
        where: {
            enrollment_id: enrollment.id,
            absence_type: AbsenceType.MORNING_LATENESS,
            created_at: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    if (existingLateness) {
        throw new Error(`Morning lateness already recorded for this student today`);
    }

    // Create lateness record
    const latenessRecord = await prisma.studentAbsence.create({
        data: {
            enrollment_id: enrollment.id,
            assigned_by_id: data.assigned_by_id,
            absence_type: AbsenceType.MORNING_LATENESS,
            // Store additional lateness data in a JSON field if available, or as separate fields
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    sub_class: { include: { class: true } }
                }
            },
            assigned_by: true
        }
    });

    // Also create a discipline issue for chronic lateness tracking
    await prisma.disciplineIssue.create({
        data: {
            enrollment_id: enrollment.id,
            issue_type: DisciplineType.MORNING_LATENESS,
            description: `Student arrived ${data.minutes_late || 'late'} minutes late at ${data.arrival_time || 'unknown time'}. Reason: ${data.reason || 'No reason provided'}`,
            notes: `Recorded on ${today.toISOString().split('T')[0]} by SDM`,
            assigned_by_id: data.assigned_by_id,
            reviewed_by_id: data.assigned_by_id // Auto-assign SDM as reviewer for lateness
        }
    });

    return latenessRecord;
}

/**
 * Record bulk morning lateness for multiple students (SDM daily use)
 */
export async function recordBulkMorningLateness(data: BulkLatenessData, assignedById: number): Promise<{
    success: StudentAbsence[];
    errors: { student_id: number; error: string }[];
}> {
    const results: StudentAbsence[] = [];
    const errors: { student_id: number; error: string }[] = [];

    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    for (const record of data.records) {
        try {
            const latenessRecord = await recordMorningLateness({
                student_id: record.student_id,
                academic_year_id: yearId,
                assigned_by_id: assignedById,
                minutes_late: record.minutes_late,
                reason: record.reason,
                arrival_time: record.arrival_time,
                date: data.date
            });
            results.push(latenessRecord);
        } catch (error: any) {
            errors.push({
                student_id: record.student_id,
                error: error.message
            });
        }
    }

    return { success: results, errors };
}

/**
 * Get lateness statistics for SDM dashboard
 */
export async function getLatenessStatistics(academicYearId?: number): Promise<{
    totalLatenessToday: number;
    totalLatenessThisWeek: number;
    totalLatenessThisMonth: number;
    chronicallyLateStudents: any[];
    latenessByClass: any[];
}> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found");
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalLatenessToday, totalLatenessThisWeek, totalLatenessThisMonth] = await Promise.all([
        // Today's lateness
        prisma.studentAbsence.count({
            where: {
                absence_type: AbsenceType.MORNING_LATENESS,
                created_at: { gte: startOfDay, lte: endOfDay },
                enrollment: { academic_year_id: yearId }
            }
        }),

        // This week's lateness
        prisma.studentAbsence.count({
            where: {
                absence_type: AbsenceType.MORNING_LATENESS,
                created_at: { gte: startOfWeek },
                enrollment: { academic_year_id: yearId }
            }
        }),

        // This month's lateness
        prisma.studentAbsence.count({
            where: {
                absence_type: AbsenceType.MORNING_LATENESS,
                created_at: { gte: startOfMonth },
                enrollment: { academic_year_id: yearId }
            }
        })
    ]);

    // Get chronically late students (3+ times this month)
    const chronicallyLateStudents = await prisma.studentAbsence.groupBy({
        by: ['enrollment_id'],
        where: {
            absence_type: AbsenceType.MORNING_LATENESS,
            created_at: { gte: startOfMonth },
            enrollment: { academic_year_id: yearId }
        },
        having: {
            enrollment_id: { _count: { gte: 3 } }
        },
        _count: { enrollment_id: true }
    });

    // Get detailed info for chronically late students
    const chronicStudentDetails = await Promise.all(
        chronicallyLateStudents.map(async (record) => {
            const enrollment = await prisma.enrollment.findUnique({
                where: { id: record.enrollment_id },
                include: {
                    student: true,
                    sub_class: { include: { class: true } }
                }
            });
            
            return {
                student: enrollment?.student,
                class: enrollment?.sub_class?.class?.name,
                subclass: enrollment?.sub_class?.name,
                lateness_count: record._count.enrollment_id
            };
        })
    );

    // Get lateness by class breakdown
    const latenessByClass = await prisma.studentAbsence.groupBy({
        by: ['enrollment_id'],
        where: {
            absence_type: AbsenceType.MORNING_LATENESS,
            created_at: { gte: startOfMonth },
            enrollment: { academic_year_id: yearId }
        },
        _count: { enrollment_id: true }
    });

    // Process by class
    const classBreakdown = new Map<string, number>();
    for (const record of latenessByClass) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: record.enrollment_id },
            include: { sub_class: { include: { class: true } } }
        });
        
        if (enrollment?.sub_class?.class) {
            const className = enrollment.sub_class.class.name;
            classBreakdown.set(className, (classBreakdown.get(className) || 0) + record._count.enrollment_id);
        }
    }

    return {
        totalLatenessToday,
        totalLatenessThisWeek,
        totalLatenessThisMonth,
        chronicallyLateStudents: chronicStudentDetails,
        latenessByClass: Array.from(classBreakdown.entries()).map(([className, count]) => ({
            class_name: className,
            lateness_count: count
        }))
    };
}

/**
 * Get daily lateness report for SDM
 */
export async function getDailyLatenessReport(date?: string, academicYearId?: number): Promise<any[]> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found");
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const latenessRecords = await prisma.studentAbsence.findMany({
        where: {
            absence_type: AbsenceType.MORNING_LATENESS,
            created_at: { gte: startOfDay, lte: endOfDay },
            enrollment: { academic_year_id: yearId }
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    sub_class: { include: { class: true } }
                }
            },
            assigned_by: true
        },
        orderBy: { created_at: 'asc' }
    });

    return latenessRecords.map(record => ({
        id: record.id,
        student: {
            id: record.enrollment.student.id,
            name: record.enrollment.student.name,
            matricule: record.enrollment.student.matricule
        },
        class: record.enrollment.sub_class?.class?.name,
        subclass: record.enrollment.sub_class?.name,
        recorded_time: record.created_at,
        recorded_by: record.assigned_by.name
    }));
}

export async function recordStudentAttendance(data: {
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    assigned_by_id: number;
    teacher_period_id?: number;
}): Promise<StudentAbsence> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        const enrollment = await getStudentSubclassByStudentAndYear(
            data.student_id,
            data.academic_year_id
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year`);
        }

        data.enrollment_id = enrollment.id;
    }

    return prisma.studentAbsence.create({
        data: {
            enrollment_id: data.enrollment_id!,
            assigned_by_id: data.assigned_by_id,
            teacher_period_id: data.teacher_period_id
        },
    });
}

export async function recordTeacherAttendance(data: {
    teacher_id: number;
    assigned_by_id: number;
    reason: string;
    teacher_period_id?: number;
}): Promise<TeacherAbsence> {
    return prisma.teacherAbsence.create({
        data,
    });
}

export async function recordDisciplineIssue(data: {
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    issue_type: DisciplineType;
    description: string;
    notes?: string;
    assigned_by_id: number;
    reviewed_by_id: number;
}): Promise<DisciplineIssue> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        const enrollment = await getStudentSubclassByStudentAndYear(
            data.student_id,
            data.academic_year_id
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year`);
        }

        data.enrollment_id = enrollment.id;
    }

    return prisma.disciplineIssue.create({
        data: {
            enrollment_id: data.enrollment_id!,
            issue_type: data.issue_type,
            description: data.description,
            notes: data.notes,
            assigned_by_id: data.assigned_by_id,
            reviewed_by_id: data.reviewed_by_id
        },
    });
}

export async function getAllDisciplineIssues(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    academicYearId?: number
): Promise<PaginatedResult<DisciplineIssue>> {
    // Get current academic year if not explicitly provided
    const yearId = await getAcademicYearId(academicYearId);

    // Process complex filters
    const processedFilters: any = { ...filterOptions };

    // Filter by student ID across academic years
    if (filterOptions?.student_id) {
        const studentId = parseInt(filterOptions.student_id as string);

        if (yearId) {
            // If academic year is specified, get the specific enrollment
            const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);
            if (enrollment) {
                processedFilters.enrollment_id = enrollment.id;
            } else {
                // If no enrollment found for this student in this year, return empty result
                return {
                    data: [],
                    meta: {
                        total: 0,
                        page: paginationOptions?.page || 1,
                        limit: paginationOptions?.limit || 10,
                        totalPages: 0
                    }
                };
            }
        } else {
            // If no specific academic year, get all enrollments for this student
            processedFilters.enrollment = {
                student_id: studentId
            };
        }
        delete processedFilters.student_id;
    }

    // Filter by class
    if (filterOptions?.class_id) {
        processedFilters.enrollment = {
            ...(processedFilters.enrollment || {}),
            sub_class: {
                class_id: parseInt(filterOptions.class_id as string)
            }
        };
        delete processedFilters.class_id;
    }

    // Filter by sub_class
    if (filterOptions?.sub_class_id) {
        processedFilters.enrollment = {
            ...(processedFilters.enrollment || {}),
            sub_class_id: parseInt(filterOptions.sub_class_id as string)
        };
        delete processedFilters.sub_class_id;
    }

    // Filter by date range
    if (filterOptions?.start_date && filterOptions?.end_date) {
        processedFilters.created_at = {
            gte: new Date(filterOptions.start_date as string),
            lte: new Date(filterOptions.end_date as string)
        };
        delete processedFilters.start_date;
        delete processedFilters.end_date;
    }

    // Include relations
    const include: any = {};

    // Include staff who assigned the issue
    if (filterOptions?.includeAssignedBy === 'true') {
        include.assigned_by = true;
        delete processedFilters.includeAssignedBy;
    }

    // Include staff who reviewed the issue
    if (filterOptions?.includeReviewedBy === 'true') {
        include.reviewed_by = true;
        delete processedFilters.includeReviewedBy;
    }

    // Include student information
    if (filterOptions?.includeStudent === 'true') {
        include.enrollment = {
            include: {
                student: true,
                sub_class: {
                    include: {
                        class: true
                    }
                }
            }
        };
        delete processedFilters.includeStudent;
    }

    return paginate<DisciplineIssue>(
        prisma.disciplineIssue,
        paginationOptions,
        processedFilters,
        Object.keys(include).length > 0 ? include : undefined
    );
}

export async function getDisciplineHistory(
    studentId?: number,
    studentSubclassId?: number,
    academicYearId?: number
): Promise<DisciplineIssue[]> {
    // If studentId is provided but not studentSubclassId, find the appropriate enrollment
    if (studentId && !studentSubclassId) {
        const studentSubclass = await getStudentSubclassByStudentAndYear(studentId, academicYearId);
        if (studentSubclass) {
            studentSubclassId = studentSubclass.id;
        }
    }

    // Filter by studentSubclassId if provided
    if (studentSubclassId) {
        return prisma.disciplineIssue.findMany({
            where: { enrollment_id: studentSubclassId },
        });
    }

    // If we have studentId but couldn't find a valid enrollment, return empty array
    if (studentId) {
        return [];
    }

    // If neither studentId nor studentSubclassId provided, return all discipline issues
    return prisma.disciplineIssue.findMany();
}
