// src/api/v1/services/subjectService.ts
import { Subject, SubjectTeacher, SubclassSubject, SubjectCategory } from '@prisma/client';
import prisma from '../../../config/db';
import { getAcademicYearId } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export async function getAllSubjects(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    includeOptions?: any
): Promise<PaginatedResult<Subject>> {
    // Process category filter if needed
    const processedFilters: any = { ...filterOptions };

    return paginate<Subject>(
        prisma.subject,
        paginationOptions,
        processedFilters,
        includeOptions
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

/**
 * Assigns a subject to all subclasses of a class
 * @param class_id The ID of the class
 * @param subject_id The ID of the subject to assign
 * @param data Additional data for the assignment (coefficient and main_teacher_id)
 * @returns Array of created SubclassSubject relationships
 */
export async function assignSubjectToClass(
    class_id: number,
    subject_id: number,
    data: {
        coefficient: number;
        main_teacher_id: number;
    }
): Promise<SubclassSubject[]> {
    // First get all subclasses for the given class
    const subclasses = await prisma.subclass.findMany({
        where: { class_id }
    });

    if (subclasses.length === 0) {
        throw new Error(`No subclasses found for class with ID ${class_id}`);
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
        where: { id: subject_id }
    });

    if (!subject) {
        throw new Error(`Subject with ID ${subject_id} not found`);
    }

    // Check if teacher exists
    const teacher = await prisma.user.findUnique({
        where: { id: data.main_teacher_id }
    });

    if (!teacher) {
        throw new Error(`Teacher with ID ${data.main_teacher_id} not found`);
    }

    // Create the subject-subclass relationships for each subclass
    const createdRelationships = await Promise.all(
        subclasses.map(subclass =>
            prisma.subclassSubject.create({
                data: {
                    subject_id,
                    subclass_id: subclass.id,
                    coefficient: data.coefficient,
                    main_teacher_id: data.main_teacher_id
                },
                include: {
                    subject: true,
                    subclass: {
                        include: {
                            class: true
                        }
                    },
                    main_teacher: true
                }
            }).catch(error => {
                // Handle unique constraint violation - subject may already be assigned to this subclass
                if (error.code === 'P2002') {
                    return prisma.subclassSubject.findFirst({
                        where: {
                            subject_id,
                            subclass_id: subclass.id
                        },
                        include: {
                            subject: true,
                            subclass: {
                                include: {
                                    class: true
                                }
                            },
                            main_teacher: true
                        }
                    });
                }
                throw error;
            })
        )
    );

    return createdRelationships.filter(Boolean) as SubclassSubject[];
}
