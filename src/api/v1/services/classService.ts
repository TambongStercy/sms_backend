// src/api/v1/services/classService.ts
import prisma, { Class, Subclass, User } from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import { getCurrentAcademicYear, getAcademicYearId } from '../../../utils/academicYear';

// Interface for create/update data to ensure type safety
interface ClassData {
    name: string;
    level?: number;
    base_fee?: number;
    new_student_add_fee?: number;
    old_student_add_fee?: number;
    miscellaneous_fee?: number;
    first_term_fee?: number;
    second_term_fee?: number;
    third_term_fee?: number;
}

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
    const include: any = { class: true, class_master: true }; // Start with default includes

    // Special handling for class_id filter
    if (filterOptions?.classId) {
        processedFilters.class_id = parseInt(filterOptions.classId as string);
        delete processedFilters.classId;
    }

    // Check if subjects should be included
    if (filterOptions?.includeSubjects === 'true') {
        include.subclass_subjects = {
            include: {
                subject: true // Include the subject details
            }
        };
        // Remove the flag from filters passed to paginate
        delete processedFilters.includeSubjects;
    }

    const result = await paginate<Subclass>(
        prisma.subclass,
        paginationOptions,
        processedFilters, // Filters excluding the include flag
        include // Pass the dynamically built include object
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

export async function createClass(data: ClassData): Promise<Class> {
    return prisma.class.create({
        data: {
            name: data.name,
            level: data.level,
            base_fee: data.base_fee,
            new_student_add_fee: data.new_student_add_fee,
            old_student_add_fee: data.old_student_add_fee,
            miscellaneous_fee: data.miscellaneous_fee,
            first_term_fee: data.first_term_fee,
            second_term_fee: data.second_term_fee,
            third_term_fee: data.third_term_fee,
        },
    });
}

export async function getClassById(id: number): Promise<any> {
    const classData = await prisma.class.findUnique({
        where: { id },
        include: {
            subclasses: {
                include: {
                    class_master: true // Include class master information
                }
            }
        },
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

export async function updateClass(id: number, data: Partial<ClassData>): Promise<Class> {
    return prisma.class.update({
        where: { id },
        data: {
            name: data.name,
            level: data.level,
            base_fee: data.base_fee,
            new_student_add_fee: data.new_student_add_fee,
            old_student_add_fee: data.old_student_add_fee,
            miscellaneous_fee: data.miscellaneous_fee,
            first_term_fee: data.first_term_fee,
            second_term_fee: data.second_term_fee,
            third_term_fee: data.third_term_fee,
        },
    });
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
    // Check if there are any enrollments associated with this subclass
    const enrollmentCount = await prisma.enrollment.count({
        where: { subclass_id: subClassId },
    });

    if (enrollmentCount > 0) {
        // Throw a specific error if enrollments exist
        throw new Error('SUBCLASS_HAS_ENROLLMENTS');
    }

    // If no enrollments, proceed with deletion
    return prisma.subclass.delete({
        where: { id: subClassId },
    });
}

export async function updateSubClass(subClassId: number, data: { name?: string }): Promise<Subclass> {
    return prisma.subclass.update({
        where: { id: subClassId },
        data: {
            name: data.name,
        },
    });
}

/**
 * Assign a class master to a subclass
 * @param subclassId The ID of the subclass
 * @param userId The ID of the user to be assigned as class master
 * @returns The updated subclass with class master information
 */
export async function assignClassMaster(subclassId: number, userId: number): Promise<Subclass> {
    // Check if the user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            user_roles: true
        }
    });

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    // Get current academic year ID before using it in the some() callback
    const currentAcademicYearId = await getAcademicYearId();

    // Check if the user has a teacher role
    const hasTeacherRole = user.user_roles.some(role =>
        role.role === 'TEACHER' &&
        (role.academic_year_id === null || // Global role
            role.academic_year_id === currentAcademicYearId) // Current year role
    );

    if (!hasTeacherRole) {
        throw new Error(`User with ID ${userId} does not have a teacher role in the current academic year`);
    }

    // Check if the subclass exists
    const subclass = await prisma.subclass.findUnique({
        where: { id: subclassId }
    });

    if (!subclass) {
        throw new Error(`Subclass with ID ${subclassId} not found`);
    }

    // Assign the user as class master
    return prisma.subclass.update({
        where: { id: subclassId },
        data: {
            class_master_id: userId
        },
        include: {
            class_master: true,
            class: true
        }
    });
}

/**
 * Get the class master of a subclass
 * @param subclassId The ID of the subclass
 * @returns The class master of the subclass or null if none
 */
export async function getSubclassClassMaster(subclassId: number): Promise<User | null> {
    const subclass = await prisma.subclass.findUnique({
        where: { id: subclassId },
        include: {
            class_master: true
        }
    });

    if (!subclass) {
        throw new Error(`Subclass with ID ${subclassId} not found`);
    }

    return subclass.class_master;
}

/**
 * Remove the class master from a subclass
 * @param subclassId The ID of the subclass
 * @returns The updated subclass
 */
export async function removeClassMaster(subclassId: number): Promise<Subclass> {
    const subclass = await prisma.subclass.findUnique({
        where: { id: subclassId }
    });

    if (!subclass) {
        throw new Error(`Subclass with ID ${subclassId} not found`);
    }

    return prisma.subclass.update({
        where: { id: subclassId },
        data: {
            class_master_id: null
        },
        include: {
            class: true
        }
    });
}

/**
 * Get all subjects associated with a specific subclass, including their coefficients.
 * @param subclassId The ID of the subclass
 * @returns Array of subject objects, each augmented with the coefficient for that subclass.
 */
export async function getSubjectsForSubclass(subclassId: number): Promise<any[]> {
    // Optional: Check if subclass exists first
    const subclassExists = await prisma.subclass.findUnique({ where: { id: subclassId } });
    if (!subclassExists) {
        throw new Error(`Subclass with ID ${subclassId} not found`);
    }

    // Fetch the SubclassSubject join records including the related Subject
    const subclassSubjects = await prisma.subclassSubject.findMany({
        where: { subclass_id: subclassId },
        include: {
            subject: true, // Include the full subject details
        },
        orderBy: {
            subject: { name: 'asc' } // Optional: Order by subject name
        }
    });

    // Transform the result to return an array of subjects, each with its coefficient
    return subclassSubjects.map(ss => {
        if (!ss.subject) return null; // Handle potential edge case where subject might be missing
        return {
            ...ss.subject, // Spread all subject fields (id, name, category, etc.)
            coefficient: ss.coefficient, // Add the coefficient specific to this subclass-subject link
        };
    }).filter(Boolean); // Filter out any null results
}
