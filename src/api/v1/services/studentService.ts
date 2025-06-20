// src/api/v1/services/studentService.ts
import prisma, { Student, ParentStudent, Gender, Enrollment, Prisma } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import * as feeService from './feeService'; // Import feeService
import { generateStudentMatricule } from '../../../utils/matriculeGenerator'; // Import student matricule generator
import { setFirstEnrollmentYear } from '../../../utils/studentStatus'; // Import student status utilities

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
    filterOptions?: FilterOptions,
    enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'all' // Add enrollmentStatus parameter
): Promise<PaginatedResult<any>> {

    // 1. Determine Target Academic Year
    const targetAcademicYearId = academicYearIdInput ?? await getAcademicYearId();
    if (!targetAcademicYearId) {
        throw new Error("Target academic year could not be determined.");
    }

    // 2. Build Base Where Clause for Student Filters
    const studentWhere: Prisma.StudentWhereInput = {};
    let sub_classIdFilter: number | undefined = undefined; // Store sub_class filter separately

    if (filterOptions) {
        for (const key in filterOptions) {
            const value = filterOptions[key];
            if (value === undefined || value === null || value === '') continue;

            if (key === 'name' || key === 'matricule' || key === 'gender') {
                studentWhere[key] = key === 'name' ? { contains: value, mode: 'insensitive' } : value;
            } else if (key === 'id') {
                const parsedId = parseInt(value as string);
                if (!isNaN(parsedId)) {
                    studentWhere.id = parsedId;
                }
            } else if (key === 'sub_class_id') {
                // Store sub_class_id filter, apply later conditionally
                const parsedSubclassId = parseInt(value as string);
                if (!isNaN(parsedSubclassId)) {
                    sub_classIdFilter = parsedSubclassId;
                }
            }
            // Note: class_id filter is removed as it's complex to apply reliably across all enrollment statuses
            //       without potentially incorrect results. Filter by sub_class_id instead if needed.
        }
    }

    // 3. Apply Enrollment Status Filtering
    const enrollmentCriteria: Prisma.EnrollmentWhereInput = {
        academic_year_id: targetAcademicYearId
    };

    // Apply sub_class filter ONLY if filtering for 'enrolled' students
    if (enrollmentStatus === 'enrolled') { // Check specifically for 'enrolled'
        if (sub_classIdFilter !== undefined) {
            enrollmentCriteria.sub_class_id = sub_classIdFilter;
        }
        studentWhere.enrollments = { some: enrollmentCriteria };
        console.log("Applying filter: ENROLLED");
    } else if (enrollmentStatus === 'not_enrolled') {
        // Cannot filter by sub_class if looking for non-enrolled students
        if (sub_classIdFilter !== undefined) {
            console.warn("Subclass filter ignored when enrollmentStatus is 'not_enrolled'");
        }
        studentWhere.enrollments = { none: { academic_year_id: targetAcademicYearId } };
        console.log("Applying filter: NOT ENROLLED");
    } else { // Default to 'all' if enrollmentStatus is undefined or 'all'
        if (sub_classIdFilter !== undefined) {
            // Apply sub_class_id filter to the main student query for 'all' status
            studentWhere.enrollments = {
                some: {
                    academic_year_id: targetAcademicYearId,
                    sub_class_id: sub_classIdFilter
                }
            };
            // Also ensure the included enrollments are filtered by sub_class_id for consistency
            enrollmentCriteria.sub_class_id = sub_classIdFilter;
            console.log("Applying filter: ALL (Default) with sub_class_id filter on Student enrollments");
        } else {
            // If no sub_class_id filter, no specific enrollment condition on studentWhere for 'all'
            // but included enrollments are still filtered by academic year.
            console.log("Applying filter: ALL (Default) - No sub_class_id filter on Student enrollments");
        }
    }

    console.log("Final Student Where:", JSON.stringify(studentWhere));
    console.log("Enrollment Criteria for Include:", JSON.stringify(enrollmentCriteria));


    // 4. Count total students matching the combined filters
    const total = await prisma.student.count({ where: studentWhere });
    console.log(`Total matching students found: ${total}`);

    // 5. Pagination setup
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // 6. Build orderBy
    let orderBy: Prisma.StudentOrderByWithRelationInput | Prisma.StudentOrderByWithRelationInput[] | undefined;
    if (paginationOptions?.sortBy) {
        // Basic sorting on student fields
        if (['name', 'matricule', 'gender', 'id', 'date_of_birth', 'created_at'].includes(paginationOptions.sortBy)) {
            orderBy = { [paginationOptions.sortBy]: paginationOptions.sortOrder || 'asc' };
        } else {
            console.warn(`Unsupported sort_by field: ${paginationOptions.sortBy}. Ignoring sort.`);
        }
    } else {
        orderBy = { name: 'asc' }; // Default sort
    }


    // 7. Fetch paginated students matching the criteria
    const students = await prisma.student.findMany({
        where: studentWhere,
        skip,
        take: limit,
        orderBy,
        include: {
            // Always include enrollments for the target year to show status
            enrollments: {
                where: enrollmentCriteria, // Apply academic year and potentially sub_class filter here
                include: {
                    sub_class: {
                        include: {
                            class: true
                        }
                    }
                }
            },
            parents: {
                include: {
                    parent: true // Include parent details
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
    matricule?: string; // Make matricule optional in input
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

    let studentMatricule = data.matricule;
    if (!studentMatricule) {
        // Generate matricule based on the year of date_of_birth if sensible, or current year
        // For simplicity, using current year for matricule generation.
        // If student creation is tied to an academic year, that year could be used.
        studentMatricule = await generateStudentMatricule();
    }

    return prisma.student.create({
        data: {
            matricule: studentMatricule, // Use provided or generated matricule
            name: data.name,
            place_of_birth: data.place_of_birth,
            gender: data.gender as Gender,
            residence: data.residence,
            former_school: data.former_school,
            date_of_birth: new Date(data.date_of_birth),
        },
    });
}

export async function updateStudent(id: number, data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<Student> {
    const updateData: Prisma.StudentUpdateInput = { ...data };

    if (data.date_of_birth && typeof data.date_of_birth === 'string') {
        updateData.date_of_birth = new Date(data.date_of_birth);
    }

    if (data.gender && !Object.values(Gender).includes(data.gender as Gender)) {
        throw new Error("Invalid gender. Choose a valid gender.");
    }

    return prisma.student.update({
        where: { id },
        data: updateData,
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
                    sub_class: {
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
        sub_class_id: number;
        academic_year_id?: number;
        photo: string | null;
        repeater?: boolean;
    }
): Promise<Enrollment & { fee_id: number }> {
    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    // Get sub_class and its parent class to access fee details
    const sub_class = await prisma.subClass.findUnique({
        where: { id: data.sub_class_id },
        include: { class: true }
    });

    if (!sub_class || !sub_class.class) {
        throw new Error(`Subclass with ID ${data.sub_class_id} or its parent Class not found`);
    }

    // Use a transaction to create enrollment and set first enrollment year
    const enrollment = await prisma.enrollment.create({
        data: {
            student_id,
            sub_class_id: data.sub_class_id,
            academic_year_id: yearId,
            repeater: data.repeater ?? false,
            photo: data.photo ?? null,
        },
    });

    // Set first enrollment year if this is the student's first enrollment
    await setFirstEnrollmentYear(student_id, yearId);

    // Create fee record for the enrollment
    const fee = await feeService.createFeeForNewEnrollment(enrollment.id);
    console.log('Fee created:', fee);

    return { ...enrollment, fee_id: fee.id };
}

// Get students by sub_class for a specific academic year
export async function getStudentsBySubclass(
    sub_class_id: number,
    academicYearId?: number
): Promise<Enrollment[]> {
    // Get the academic year
    const yearId = await getAcademicYearId(academicYearId);
    if (!yearId) {
        return [];
    }

    // Get students enrolled in this sub_class for this academic year
    return prisma.enrollment.findMany({
        where: {
            sub_class_id,
            academic_year_id: yearId
        },
        include: {
            student: true,
            sub_class: {
                include: {
                    class: true
                }
            }
        }
    });
}

export async function unlinkParent(student_id: number, parent_id: number): Promise<void> {
    const result = await prisma.parentStudent.deleteMany({
        where: {
            student_id: student_id,
            parent_id: parent_id
        }
    });

    if (result.count === 0) {
        throw new Error('Parent-student link not found or already deleted.');
    }
}

export async function getStudentsByParentId(parentId: number, academicYearId?: number): Promise<Student[]> {
    const targetAcademicYearId = academicYearId ?? await getAcademicYearId();

    const parentStudents = await prisma.parentStudent.findMany({
        where: {
            parent_id: parentId
        },
        include: {
            student: {
                include: {
                    enrollments: targetAcademicYearId ? {
                        where: { academic_year_id: targetAcademicYearId },
                        include: {
                            sub_class: { include: { class: true } }
                        }
                    } : true,
                }
            }
        }
    });
    return parentStudents.map(ps => ps.student);
}

export async function getParentsByStudentId(studentId: number): Promise<ParentStudent[]> {
    return prisma.parentStudent.findMany({
        where: {
            student_id: studentId
        },
        include: {
            parent: true // Assuming 'parent' is the relation to the User model for parents
        }
    });
}
