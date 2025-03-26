// src/api/v1/services/classService.ts
import prisma, { Class, Subclass } from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import { getCurrentAcademicYear, getAcademicYearId } from '../../../utils/academicYear';

export async function getAllClasses(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Class>> {
    const result = await paginate<Class>(
        prisma.class,
        paginationOptions,
        filterOptions,
        { subclasses: true }
    );

    // Get current academic year
    const currentYear = await getCurrentAcademicYear();
    const academicYearId = currentYear?.id;

    // Enhance classes with student counts
    const classesWithCounts = await Promise.all(
        result.data.map(async (classItem: any) => {
            // Get all subclass IDs for this class
            const subclassIds = classItem.subclasses.map((subclass: any) => subclass.id);

            // Count students enrolled in any subclass of this class in the current academic year
            const studentCount = await prisma.enrollment.count({
                where: {
                    subclass_id: {
                        in: subclassIds
                    },
                    ...(academicYearId && { academic_year_id: academicYearId })
                }
            });

            // Add the count to the class object
            return {
                ...classItem,
                studentCount,
                academicYearId  // Include the academic year ID for reference
            };
        })
    );

    return {
        ...result,
        data: classesWithCounts
    };
}

export async function getAllSubclasses(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Subclass>> {
    const processedFilters: any = { ...filterOptions };

    // Special handling for class_id filter
    if (filterOptions?.classId) {
        processedFilters.class_id = parseInt(filterOptions.classId as string);
        delete processedFilters.classId;
    }

    const result = await paginate<Subclass>(
        prisma.subclass,
        paginationOptions,
        processedFilters,
        { class: true }
    );

    // Get current academic year
    const currentYear = await getCurrentAcademicYear();
    const academicYearId = currentYear?.id;

    // Enhance subclasses with student counts
    const subclassesWithCounts = await Promise.all(
        result.data.map(async (subclass: any) => {
            // Count students enrolled in this subclass in the current academic year
            const studentCount = await prisma.enrollment.count({
                where: {
                    subclass_id: subclass.id,
                    ...(academicYearId && { academic_year_id: academicYearId })
                }
            });

            // Add the count to the subclass object
            return {
                ...subclass,
                studentCount,
                academicYearId  // Include the academic year ID for reference
            };
        })
    );

    return {
        ...result,
        data: subclassesWithCounts
    };
}

// Original function for backwards compatibility - now with student counts
export async function getAllClassesWithSubclasses(): Promise<any[]> {
    const classes = await prisma.class.findMany({
        include: {
            subclasses: true,
        },
    });

    // Get current academic year
    const currentYear = await getCurrentAcademicYear();
    const academicYearId = currentYear?.id;

    // Enhance classes and subclasses with student counts
    return Promise.all(
        classes.map(async (classItem: any) => {
            // Add student counts to each subclass
            const subclassesWithCounts = await Promise.all(
                classItem.subclasses.map(async (subclass: any) => {
                    const studentCount = await prisma.enrollment.count({
                        where: {
                            subclass_id: subclass.id,
                            ...(academicYearId && { academic_year_id: academicYearId })
                        }
                    });
                    return {
                        ...subclass,
                        studentCount
                    };
                })
            );

            // Calculate total student count for class
            const totalStudentCount = subclassesWithCounts.reduce(
                (total, subclass) => total + subclass.studentCount, 0
            );

            return {
                ...classItem,
                subclasses: subclassesWithCounts,
                studentCount: totalStudentCount,
                academicYearId // Include the academic year ID for reference
            };
        })
    );
}

export async function createClass(data: {
    name: string;
    level?: number;
    fee_amount?: number;
}): Promise<Class> {
    return prisma.class.create({
        data,
    });
}

export async function getClassById(id: number): Promise<any> {
    const classData = await prisma.class.findUnique({
        where: { id },
        include: { subclasses: true },
    });

    if (!classData) return null;

    // Get current academic year
    const currentYear = await getCurrentAcademicYear();
    const academicYearId = currentYear?.id;

    // Add student counts to each subclass
    const subclassesWithCounts = await Promise.all(
        classData.subclasses.map(async (subclass: any) => {
            const studentCount = await prisma.enrollment.count({
                where: {
                    subclass_id: subclass.id,
                    ...(academicYearId && { academic_year_id: academicYearId })
                }
            });
            return {
                ...subclass,
                studentCount
            };
        })
    );

    // Calculate total student count for class
    const totalStudentCount = subclassesWithCounts.reduce(
        (total, subclass) => total + subclass.studentCount, 0
    );

    return {
        ...classData,
        subclasses: subclassesWithCounts,
        studentCount: totalStudentCount,
        academicYearId // Include the academic year ID for reference
    };
}

export async function addSubClass(class_id: number, data: { name: string }): Promise<Subclass> {
    return prisma.subclass.create({
        data: {
            name: data.name,
            class_id,
        },
    });
}

export async function checkSubClassExists(subclassId: number, classId: number): Promise<Subclass | null> {
    return prisma.subclass.findFirst({
        where: {
            id: subclassId,
            class_id: classId
        }
    });
}

export async function deleteSubClass(subClassId: number): Promise<Subclass> {
    return prisma.subclass.delete({
        where: { id: subClassId },
    });
}
