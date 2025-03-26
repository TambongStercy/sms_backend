// src/api/v1/services/studentService.ts
import prisma, { Student, ParentStudent, Gender, Enrollment } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

// Get all students with pagination and filtering
export async function getAllStudents(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Student>> {
    return paginate<Student>(
        prisma.student,
        paginationOptions,
        filterOptions
    );
}

// Get all students with their current enrollment info with pagination and filtering
export async function getAllStudentsWithCurrentEnrollment(
    academicYearId?: number,
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<any>> {
    // Get the academic year id
    const yearId = await getAcademicYearId(academicYearId);
    if (!yearId) {
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

    // Process complex filters that span relations
    const where: any = {};
    const processedFilters: any = { ...filterOptions };

    // Handle special filters
    if (filterOptions) {
        // Filter by class
        if (filterOptions.class_id) {
            processedFilters.enrollments = {
                some: {
                    academic_year_id: yearId,
                    subclass: {
                        class_id: parseInt(filterOptions.class_id as string)
                    }
                }
            };
            delete processedFilters.class_id;
        }

        // Filter by subclass
        if (filterOptions.subclass_id) {
            processedFilters.enrollments = {
                ...(processedFilters.enrollments || {}),
                some: {
                    ...(processedFilters.enrollments?.some || {}),
                    academic_year_id: yearId,
                    subclass_id: parseInt(filterOptions.subclass_id as string)
                }
            };
            delete processedFilters.subclass_id;
        }

        // Handle name filtering
        if (filterOptions.name) {
            processedFilters.name = {
                contains: filterOptions.name,
                mode: 'insensitive'
            };
        }

        // Apply processed filters
        Object.assign(where, processedFilters);
    }

    // Count total students matching the filter
    const total = await prisma.student.count({ where });

    // Default pagination values
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const skip = (page - 1) * limit;

    // Build orderBy
    let orderBy: any = undefined;
    if (paginationOptions?.sortBy) {
        orderBy = {
            [paginationOptions.sortBy]: paginationOptions.sortOrder || 'asc'
        };
    }

    // Get paginated students with their enrollment for the specified academic year
    const students = await prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
            enrollments: {
                where: {
                    academic_year_id: yearId
                },
                include: {
                    subclass: {
                        include: {
                            class: true
                        }
                    }
                }
            },
            parents: {
                include: {
                    parent: true
                }
            }
        }
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
        data: students,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
}

export async function createStudent(data: {
    matricule: string;
    name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    residence: string;
    former_school: string;
}): Promise<Student> {

    if (!Object.values(Gender).includes(data.gender as Gender)) {
        throw new Error("Invalid gender. Choose a valid gender.");
    }


    return prisma.student.create({
        data: {
            matricule: data.matricule,
            name: data.name,
            place_of_birth: data.place_of_birth,
            gender: data.gender as Gender,
            residence: data.residence,
            former_school: data.former_school,
            date_of_birth: new Date(data.date_of_birth),
        },
    });
}

export async function getStudentById(id: number, academicYearId?: number): Promise<any> {
    // Get the academic year if provided
    let yearId = undefined;
    if (academicYearId !== undefined) {
        yearId = academicYearId;
    } else {
        yearId = await getAcademicYearId();
    }

    return prisma.student.findUnique({
        where: { id },
        include: {
            parents: {
                include: {
                    parent: true
                }
            },
            enrollments: yearId ? {
                where: {
                    academic_year_id: yearId
                },
                include: {
                    subclass: {
                        include: {
                            class: true
                        }
                    }
                }
            } : true,
        },
    });
}

export async function linkParent(student_id: number, data: { parent_id: number }): Promise<ParentStudent> {
    return prisma.parentStudent.create({
        data: {
            student: {
                connect: { id: student_id }
            },
            parent: {
                connect: { id: data.parent_id }
            }
        }
    });
}

export async function enrollStudent(
    student_id: number,
    data: {
        subclass_id: number;
        academic_year_id?: number;
        photo: string;
        repeater?: boolean;
    }
): Promise<Enrollment> {
    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    // First, get the class information to access its fee_amount
    const subclass = await prisma.subclass.findUnique({
        where: { id: data.subclass_id },
        include: { class: true }
    });

    if (!subclass) {
        throw new Error("Subclass not found");
    }

    // Get the fee amount from the parent class
    const feeAmount = subclass.class.fee_amount;

    // Use a transaction to create both enrollment and school fee records
    return prisma.$transaction(async (tx) => {
        // Create the enrollment first
        const enrollment = await tx.enrollment.create({
            data: {
                student_id,
                subclass_id: data.subclass_id,
                academic_year_id: data.academic_year_id!,
                photo: data.photo,
                repeater: data.repeater || false,
            },
        });

        // Then create the school fee record with the class fee amount
        // Set the due date to 3 months from now by default
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 3);

        await tx.schoolFees.create({
            data: {
                amount_expected: feeAmount,
                amount_paid: 0, // Initially no payment made
                academic_year_id: data.academic_year_id!,
                due_date: dueDate,
                enrollment_id: enrollment.id,
            }
        });

        return enrollment;
    });
}

// Get students by subclass for a specific academic year
export async function getStudentsBySubclass(
    subclass_id: number,
    academicYearId?: number
): Promise<Enrollment[]> {
    // Get the academic year
    const yearId = await getAcademicYearId(academicYearId);
    if (!yearId) {
        return [];
    }

    // Get students enrolled in this subclass for this academic year
    return prisma.enrollment.findMany({
        where: {
            subclass_id,
            academic_year_id: yearId
        },
        include: {
            student: true,
            subclass: {
                include: {
                    class: true
                }
            }
        }
    });
}
