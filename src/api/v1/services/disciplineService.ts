// src/api/v1/services/disciplineService.ts
import { StudentAbsence, TeacherAbsence, DisciplineIssue } from '@prisma/client';
import prisma from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

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
            subclass: {
                class_id: parseInt(filterOptions.class_id as string)
            }
        };
        delete processedFilters.class_id;
    }

    // Filter by subclass
    if (filterOptions?.subclass_id) {
        processedFilters.enrollment = {
            ...(processedFilters.enrollment || {}),
            subclass_id: parseInt(filterOptions.subclass_id as string)
        };
        delete processedFilters.subclass_id;
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
                subclass: {
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
