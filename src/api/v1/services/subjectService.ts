// src/api/v1/services/subjectService.ts
import { Subject, SubjectTeacher, SubclassSubject, SubjectCategory } from '@prisma/client';
import prisma from '../../../config/db';
import { getAcademicYearId } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export async function getAllSubjects(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Subject>> {
    // Process category filter if needed
    const processedFilters: any = { ...filterOptions };

    // Include related data if requested
    const include: any = {};

    // Include teachers if requested
    if (filterOptions?.includeTeachers === 'true') {
        include.subject_teachers = {
            include: {
                teacher: true
            }
        };
        delete processedFilters.includeTeachers;
    }

    // Include subclasses if requested
    if (filterOptions?.includeSubclasses === 'true') {
        include.subclass_subjects = {
            include: {
                subclass: {
                    include: {
                        class: true
                    }
                },
                main_teacher: true
            }
        };
        delete processedFilters.includeSubclasses;
    }

    return paginate<Subject>(
        prisma.subject,
        paginationOptions,
        processedFilters,
        Object.keys(include).length > 0 ? include : undefined
    );
}

export async function createSubject(data: { name: string; category: string }): Promise<Subject> {
    return prisma.subject.create({
        data: {
            name: data.name,
            category: data.category as SubjectCategory,
        },
    });
}

export async function assignTeacher(subject_id: number, data: { teacher_id: number }): Promise<SubjectTeacher> {
    return prisma.subjectTeacher.create({
        data: {
            subject_id,
            teacher_id: data.teacher_id,
        },
    });
}

export async function linkSubjectToSubClass(
    subject_id: number,
    data: {
        subclass_id: number;
        coefficient: number;
        main_teacher_id: number;
    }
): Promise<SubclassSubject> {
    return prisma.subclassSubject.create({
        data: {
            subject_id,
            subclass_id: data.subclass_id,
            coefficient: data.coefficient,
            main_teacher_id: data.main_teacher_id,
        },
    });
}

// Get subjects for a specific subclass
export async function getSubjectsForSubclass(subclass_id: number): Promise<SubclassSubject[]> {
    return prisma.subclassSubject.findMany({
        where: { subclass_id },
        include: {
            subject: true,
            main_teacher: true
        }
    });
}

// Get all subjects taught by a teacher
export async function getSubjectsByTeacher(teacher_id: number): Promise<SubjectTeacher[]> {
    return prisma.subjectTeacher.findMany({
        where: { teacher_id },
        include: {
            subject: true
        }
    });
}

// Get teacher schedule for an academic year
export async function getTeacherSchedule(teacher_id: number, academicYearId?: number): Promise<any[]> {
    // Get the academic year id
    const yearId = await getAcademicYearId(academicYearId);
    if (!yearId) {
        return [];
    }

    // Find the subject teachers for this teacher
    const subjectTeachers = await prisma.subjectTeacher.findMany({
        where: { teacher_id },
        include: { subject: true }
    });

    // Get all scheduled periods for these subject-teachers in this academic year
    const subjectTeacherIds = subjectTeachers.map(st => st.id);

    return prisma.teacherPeriod.findMany({
        where: {
            subject_teacher_id: { in: subjectTeacherIds },
            academic_year_id: yearId
        },
        include: {
            period: true,
            subclass: {
                include: {
                    class: true
                }
            },
            subject_teacher: {
                include: {
                    subject: true
                }
            }
        }
    });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
    return prisma.subject.findUnique({
        where: { id },
        include: {
            subject_teachers: {
                include: {
                    teacher: true
                }
            },
            subclass_subjects: {
                include: {
                    subclass: {
                        include: {
                            class: true
                        }
                    },
                    main_teacher: true
                }
            }
        }
    });
}

export async function updateSubject(
    id: number, 
    data: { name?: string; category?: SubjectCategory }
): Promise<Subject> {
    return prisma.subject.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category
        }
    });
}

export async function deleteSubject(id: number): Promise<Subject> {
    // First delete related subject_teachers and subclass_subjects
    await prisma.subjectTeacher.deleteMany({
        where: { subject_id: id }
    });
    
    await prisma.subclassSubject.deleteMany({
        where: { subject_id: id }
    });
    
    // Then delete the subject
    return prisma.subject.delete({
        where: { id }
    });
}
