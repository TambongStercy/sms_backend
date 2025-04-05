// src/api/v1/services/studentService.ts
import prisma, { Student, ParentStudent, Gender, Enrollment } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import * as feeService from './feeService'; // Import feeService

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
    academicYearIdInput?: number, // Explicitly name the input
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<any>> {
    // Determine the target academic year ID (use input or get current)
    const yearId = await getAcademicYearId(academicYearIdInput);
    if (!yearId) {
        // If no specific or current academic year found, return empty
        return {
            data: [],
            meta: { total: 0, page: paginationOptions?.page || 1, limit: paginationOptions?.limit || 10, totalPages: 0 }
        };
    }

    // Base where clause for the Student model properties
    const studentWhere: any = {};
    // Base where clause for the criteria an Enrollment record must meet
    const enrollmentCriteria: any = {
        academic_year_id: yearId
    };

    // Apply filters
    if (filterOptions) {
        for (const key in filterOptions) {
            const value = filterOptions[key];
            if (value === undefined || value === null || value === '') continue; // Skip empty/null/undefined filters

            if (key === 'name' || key === 'matricule' || key === 'gender') {
                // Apply filters directly to the Student model
                studentWhere[key] = key === 'name' ? { contains: value, mode: 'insensitive' } : value;

            } else if (key === 'id') {
                const parsedId = parseInt(value as string);
                if (!isNaN(parsedId)) {
                    studentWhere.id = parsedId;
                }
            } else if (key === 'subclass_id') {
                // Apply subclass_id filter to the Enrollment criteria
                const parsedSubclassId = parseInt(value as string);
                if (!isNaN(parsedSubclassId)) {
                    enrollmentCriteria.subclass_id = parsedSubclassId;
                }
            } else if (key === 'class_id') {
                // Apply class_id filter to the nested Subclass relation within Enrollment criteria
                const parsedClassId = parseInt(value as string);
                if (!isNaN(parsedClassId)) {
                    enrollmentCriteria.subclass = {
                        ...(enrollmentCriteria.subclass || {}),
                        class_id: parsedClassId
                    };
                }
            }
        }
    }

    // Combine student filters with the enrollment criteria
    // The student must match studentWhere AND have at least one enrollment matching enrollmentCriteria
    studentWhere.enrollments = { some: enrollmentCriteria };

    // Count total students matching the combined filters
    const total = await prisma.student.count({ where: studentWhere });

    // Pagination setup
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Build orderBy
    let orderBy: any = paginationOptions?.sortBy ? { [paginationOptions.sortBy]: paginationOptions.sortOrder || 'asc' } : undefined;

    // Fetch paginated students matching the criteria
    const students = await prisma.student.findMany({
        where: studentWhere,
        skip,
        take: limit,
        orderBy,
        include: {
            // Include only the relevant enrollment record(s) matching the criteria
            enrollments: {
                where: enrollmentCriteria, // Use the same criteria to filter included enrollments
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

    console.log(`Returning ${students.length} students for page ${page}`);

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
        photo: string | null;
        repeater?: boolean;
    }
): Promise<Enrollment> {
    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    // Get subclass and its parent class to access fee details
    const subclass = await prisma.subclass.findUnique({
        where: { id: data.subclass_id },
        include: { class: true }
    });

    if (!subclass || !subclass.class) {
        throw new Error(`Subclass with ID ${data.subclass_id} or its parent Class not found`);
    }

    // Use a transaction to create enrollment
    return prisma.$transaction(async (tx) => {
        // Create the enrollment first
        const enrollment = await tx.enrollment.create({
            data: {
                student_id,
                subclass_id: data.subclass_id,
                academic_year_id: yearId,
                repeater: data.repeater ?? false,
                photo: data.photo ?? null,
            },
        });

        // Use the dedicated fee service function to create the fee record
        await feeService.createFeeForNewEnrollment(enrollment.id);

        // Return the created enrollment record
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
