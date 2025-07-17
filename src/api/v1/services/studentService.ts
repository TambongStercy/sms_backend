// src/api/v1/services/studentService.ts
import prisma, { Student, ParentStudent, Gender, Enrollment, Prisma } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import * as feeService from './feeService'; // Import feeService
import { generateStudentMatricule } from '../../../utils/matriculeGenerator'; // Import student matricule generator
import { setFirstEnrollmentYear } from '../../../utils/studentStatus'; // Import student status utilities
import { StudentStatus } from '@prisma/client'; // Import StudentStatus enum

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
    enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'all', // Add enrollmentStatus parameter
    teacherSubClassIds?: number[] // Add teacher subclass restriction
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

    // 3. Build Combined Subclass Filter Logic
    // Combine teacher restrictions with explicit subclass filter
    let finalSubclassFilter: number | number[] | undefined = undefined;

    if (teacherSubClassIds && teacherSubClassIds.length > 0) {
        if (sub_classIdFilter !== undefined) {
            // Teacher has restrictions AND explicit subclass filter provided
            // Only allow the explicit filter if it's within teacher's allowed subclasses
            if (teacherSubClassIds.includes(sub_classIdFilter)) {
                finalSubclassFilter = sub_classIdFilter;
                console.log(`Applying combined filter: teacher-restricted subclass ${sub_classIdFilter}`);
            } else {
                // Requested subclass is not in teacher's allowed list - return empty result
                console.log(`Subclass ${sub_classIdFilter} not in teacher's allowed subclasses ${teacherSubClassIds.join(', ')}. No students will be returned.`);
                finalSubclassFilter = -1; // Use invalid ID to return no results
            }
        } else {
            // Teacher has restrictions but no explicit filter - show all their allowed subclasses
            finalSubclassFilter = teacherSubClassIds;
            console.log(`Applying teacher restriction: students must be in subclasses ${teacherSubClassIds.join(', ')}`);
        }
    } else if (sub_classIdFilter !== undefined) {
        // No teacher restrictions but explicit subclass filter provided
        finalSubclassFilter = sub_classIdFilter;
        console.log(`Applying explicit subclass filter: ${sub_classIdFilter}`);
    }

    // 4. Apply Enrollment Status Filtering
    const enrollmentCriteria: Prisma.EnrollmentWhereInput = {
        academic_year_id: targetAcademicYearId
    };

    // Apply the final subclass filter to enrollment criteria
    if (finalSubclassFilter !== undefined) {
        if (Array.isArray(finalSubclassFilter)) {
            enrollmentCriteria.sub_class_id = { in: finalSubclassFilter };
        } else {
            enrollmentCriteria.sub_class_id = finalSubclassFilter;
        }
    }

    if (enrollmentStatus === 'enrolled') {
        studentWhere.enrollments = { some: enrollmentCriteria };
        console.log("Applying filter: ENROLLED");
    } else if (enrollmentStatus === 'not_enrolled') {
        // Cannot filter by sub_class if looking for non-enrolled students
        if (sub_classIdFilter !== undefined) {
            console.warn("Subclass filter ignored when enrollmentStatus is 'not_enrolled'");
        }
        if (teacherSubClassIds && teacherSubClassIds.length > 0) {
            // For teachers, we can't show not_enrolled students as they can only see their assigned students
            studentWhere.enrollments = {
                none: {
                    academic_year_id: targetAcademicYearId,
                    sub_class_id: { in: teacherSubClassIds }
                }
            };
        } else {
            studentWhere.enrollments = { none: { academic_year_id: targetAcademicYearId } };
        }
        console.log("Applying filter: NOT ENROLLED");
    } else { // Default to 'all' if enrollmentStatus is undefined or 'all'
        if (finalSubclassFilter !== undefined) {
            // Apply subclass filter for 'all' status - only show students who have enrollments in the filtered subclasses
            studentWhere.enrollments = { some: enrollmentCriteria };
            console.log("Applying filter: ALL with subclass filter");
        } else {
            // No subclass filter - don't add enrollment conditions to studentWhere for 'all'
            // but included enrollments are still filtered by academic year in the include
            console.log("Applying filter: ALL (Default) - No subclass filter");
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
    former_school?: string;
    is_new_student?: boolean; // Add support for new/old student tracking
    status?: StudentStatus; // Add support for initial status
}): Promise<Student> {

    // Validate required fields
    if (!data.name || !data.date_of_birth || !data.place_of_birth || !data.gender || !data.residence) {
        throw new Error("Missing required fields: name, date_of_birth, place_of_birth, gender, and residence are required");
    }

    // Validate and normalize gender
    let normalizedGender: Gender;
    const genderLower = data.gender.toLowerCase();
    if (genderLower === 'male') {
        normalizedGender = Gender.Male;
    } else if (genderLower === 'female') {
        normalizedGender = Gender.Female;
    } else {
        throw new Error("Invalid gender. Choose a valid gender.");
    }

    // Validate date of birth
    const dateOfBirth = new Date(data.date_of_birth);
    if (isNaN(dateOfBirth.getTime())) {
        throw new Error("Invalid date of birth format");
    }

    // Check if date of birth is not in the future
    if (dateOfBirth > new Date()) {
        throw new Error("Date of birth cannot be in the future");
    }

    // Generate matricule if not provided
    let studentMatricule = data.matricule;
    if (!studentMatricule) {
        studentMatricule = await generateStudentMatricule();
    }

    // Check if matricule already exists
    const existingStudent = await prisma.student.findUnique({
        where: { matricule: studentMatricule }
    });

    if (existingStudent) {
        throw new Error(`Student with matricule ${studentMatricule} already exists`);
    }

    // Set defaults for new/old student and status
    const isNewStudent = data.is_new_student !== undefined ? data.is_new_student : true;
    const studentStatus = data.status || StudentStatus.NOT_ENROLLED;

    try {
        return await prisma.student.create({
            data: {
                matricule: studentMatricule,
                name: data.name.trim(),
                place_of_birth: data.place_of_birth.trim(),
                gender: normalizedGender,
                residence: data.residence.trim(),
                former_school: data.former_school?.trim() || null,
                date_of_birth: dateOfBirth,
                is_new_student: isNewStudent,
                status: studentStatus,
                // first_enrollment_year_id will be set when student is first enrolled
            },
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error("Student with this matricule already exists");
        }
        throw new Error(`Failed to create student: ${error.message}`);
    }
}

export async function updateStudent(id: number, data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<Student> {
    const updateData: Prisma.StudentUpdateInput = { ...data };

    if (data.date_of_birth && typeof data.date_of_birth === 'string') {
        updateData.date_of_birth = new Date(data.date_of_birth);
    }

    if (data.gender) {
        const genderLower = data.gender.toLowerCase();
        if (genderLower === 'male') {
            updateData.gender = Gender.Male;
        } else if (genderLower === 'female') {
            updateData.gender = Gender.Female;
        } else {
            throw new Error("Invalid gender. Choose a valid gender.");
        }
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
    // First verify that both student and parent exist
    const student = await prisma.student.findUnique({
        where: { id: student_id }
    });

    if (!student) {
        throw new Error(`Student with ID ${student_id} not found`);
    }

    const parent = await prisma.user.findUnique({
        where: { id: data.parent_id }
    });

    if (!parent) {
        throw new Error(`Parent with ID ${data.parent_id} not found`);
    }

    // Check if relationship already exists
    const existingLink = await prisma.parentStudent.findFirst({
        where: {
            student_id: student_id,
            parent_id: data.parent_id
        }
    });

    if (existingLink) {
        throw new Error(`Parent ${data.parent_id} is already linked to student ${student_id}`);
    }

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

/**
 * Assigns a student to a class (creates enrollment with class only)
 * Sets student status to ASSIGNED_TO_CLASS
 */
export async function assignStudentToClass(
    student_id: number,
    data: {
        class_id: number;
        academic_year_id?: number;
        photo?: string | null;
        repeater?: boolean;
    }
): Promise<Enrollment & { fee_id: number }> {
    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    // Get class details
    const classData = await prisma.class.findUnique({
        where: { id: data.class_id }
    });

    if (!classData) {
        throw new Error(`Class with ID ${data.class_id} not found`);
    }

    // Check if student is already enrolled in this academic year
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_academic_year_id: {
                student_id: student_id,
                academic_year_id: yearId
            }
        },
        include: {
            school_fees: true
        }
    });

    let enrollment: Enrollment;
    let fee_id: number;

    if (existingEnrollment) {
        // Check if already assigned to a subclass
        if (existingEnrollment.sub_class_id) {
            throw new Error("Student is already assigned to a subclass. Cannot reassign to class only.");
        }

        // Update existing enrollment with class assignment
        enrollment = await prisma.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
                class_id: data.class_id,
                photo: data.photo ?? existingEnrollment.photo,
                repeater: data.repeater ?? existingEnrollment.repeater,
            }
        });

        // Create or update fee record based on the new class assignment
        const fee = await feeService.createOrUpdateFeeForEnrollment(enrollment.id, data.class_id);
        fee_id = fee.id;
    } else {
        // Create new enrollment with class only
        enrollment = await prisma.enrollment.create({
            data: {
                student_id,
                class_id: data.class_id,
                sub_class_id: null, // No subclass assignment yet
                academic_year_id: yearId,
                repeater: data.repeater ?? false,
                photo: data.photo ?? null,
            },
        });

        // Set first enrollment year if this is the student's first enrollment
        await setFirstEnrollmentYear(student_id, yearId);

        // Create fee record for the enrollment based on class
        const fee = await feeService.createOrUpdateFeeForEnrollment(enrollment.id, data.class_id);
        fee_id = fee.id;
    }

    // Update student status to ASSIGNED_TO_CLASS
    await prisma.student.update({
        where: { id: student_id },
        data: { status: StudentStatus.ASSIGNED_TO_CLASS }
    });

    console.log('Student assigned to class:', enrollment);
    return { ...enrollment, fee_id };
}

/**
 * Enrolls a student in a subclass (assigns to subclass)
 * Sets student status to ENROLLED
 * Can be used for both new enrollments and updating existing ones
 */
export async function enrollStudentInSubclass(
    student_id: number,
    data: {
        sub_class_id: number;
        academic_year_id?: number;
        photo?: string | null;
        repeater?: boolean;
    }
): Promise<Enrollment & { fee_id: number }> {
    // Get current academic year if not provided
    const yearId = data.academic_year_id ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    // Get sub_class and its parent class
    const sub_class = await prisma.subClass.findUnique({
        where: { id: data.sub_class_id },
        include: { class: true }
    });

    if (!sub_class || !sub_class.class) {
        throw new Error(`Subclass with ID ${data.sub_class_id} or its parent Class not found`);
    }

    // Check if student is already enrolled in this academic year
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_academic_year_id: {
                student_id: student_id,
                academic_year_id: yearId
            }
        },
        include: {
            school_fees: true
        }
    });

    let enrollment: Enrollment;
    let fee_id: number;

    if (existingEnrollment) {
        // Update existing enrollment with subclass assignment
        enrollment = await prisma.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
                sub_class_id: data.sub_class_id,
                class_id: sub_class.class_id,
                photo: data.photo ?? existingEnrollment.photo,
                repeater: data.repeater ?? existingEnrollment.repeater,
            }
        });

        // Create or update fee record based on the class of the subclass
        const fee = await feeService.createOrUpdateFeeForEnrollment(enrollment.id, sub_class.class_id);
        fee_id = fee.id;
    } else {
        // Create new enrollment with subclass (for old students directly enrolling in subclass)
        enrollment = await prisma.enrollment.create({
            data: {
                student_id,
                class_id: sub_class.class_id,
                sub_class_id: data.sub_class_id,
                academic_year_id: yearId,
                repeater: data.repeater ?? false,
                photo: data.photo ?? null,
            },
        });

        // Set first enrollment year if this is the student's first enrollment
        await setFirstEnrollmentYear(student_id, yearId);

        // Create fee record for the enrollment based on the class of the subclass
        const fee = await feeService.createOrUpdateFeeForEnrollment(enrollment.id, sub_class.class_id);
        fee_id = fee.id;
    }

    // Update student status to ENROLLED when assigned to subclass
    await prisma.student.update({
        where: { id: student_id },
        data: { status: StudentStatus.ENROLLED }
    });

    console.log('Student enrolled in subclass:', enrollment);
    return { ...enrollment, fee_id };
}

// Keep the old enrollStudent function for backward compatibility
// but make it call enrollStudentInSubclass
export async function enrollStudent(
    student_id: number,
    data: {
        sub_class_id: number;
        academic_year_id?: number;
        photo: string | null;
        repeater?: boolean;
    }
): Promise<Enrollment & { fee_id: number }> {
    return enrollStudentInSubclass(student_id, data);
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

/**
 * Assigns a student to a subclass if they have an existing enrollment in the academic year and no current subclass.
 * @param studentId The ID of the student.
 * @param subClassId The ID of the subclass to assign.
 * @param academicYearId Optional academic year ID (defaults to current).
 * @returns The updated Enrollment record.
 */
export async function assignStudentToSubclass(
    studentId: number,
    subClassId: number,
    academicYearId?: number
): Promise<Enrollment> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error("No academic year found and none provided.");
    }

    // Find the existing enrollment for the student in the specified academic year
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_academic_year_id: {
                student_id: studentId,
                academic_year_id: yearId
            }
        },
        include: { sub_class: true }
    });

    if (!enrollment) {
        throw new Error(`Student with ID ${studentId} is not enrolled in academic year ${yearId}.`);
    }

    if (enrollment.sub_class_id !== null) {
        throw new Error(`Student with ID ${studentId} is already assigned to a subclass (${enrollment.sub_class?.name || enrollment.sub_class_id}) for academic year ${yearId}.`);
    }

    // Verify the subclass exists
    const subClass = await prisma.subClass.findUnique({
        where: { id: subClassId }
    });

    if (!subClass) {
        throw new Error(`Subclass with ID ${subClassId} not found.`);
    }

    // Update the enrollment with the new subclass ID
    const updatedEnrollment = await prisma.enrollment.update({
        where: {
            id: enrollment.id
        },
        data: {
            sub_class_id: subClassId,
            // status: 'ASSIGNED_TO_CLASS' as StudentStatus // Update student status if applicable
        },
        include: {
            student: true,
            sub_class: { include: { class: true } }
        }
    });

    // Optionally, update the student's main status if they were previously NOT_ENROLLED
    await prisma.student.update({
        where: { id: studentId },
        data: { status: StudentStatus.ASSIGNED_TO_CLASS }
    });

    return updatedEnrollment;
}

/**
 * Search students by name or matricule
 */
export async function searchStudents(
    searchQuery: string,
    academicYearId?: number,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<any>> {
    try {
        // Determine target academic year
        const targetAcademicYearId = academicYearId ?? await getAcademicYearId();

        // Build search criteria
        const searchCriteria: Prisma.StudentWhereInput = {
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { matricule: { contains: searchQuery, mode: 'insensitive' } }
            ]
        };

        // Count total matching students
        const total = await prisma.student.count({ where: searchCriteria });

        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);

        // Fetch students with pagination
        const students = await prisma.student.findMany({
            where: searchCriteria,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
                enrollments: targetAcademicYearId ? {
                    where: { academic_year_id: targetAcademicYearId },
                    include: {
                        sub_class: {
                            include: {
                                class: true
                            }
                        }
                    }
                } : undefined,
                parents: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        return {
            data: students,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error searching students:', error);
        throw error;
    }
}


/**
 * Retrieves a student's data based on their enrollment ID.
 * @param enrollmentId The ID of the enrollment.
 * @returns The student object with their latest enrollment details.
 */
export async function getStudentByEnrollmentId(enrollmentId: number): Promise<any> {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            student: {
                include: {
                    parents: {
                        include: {
                            parent: true,
                        },
                    },
                },
            },
            sub_class: {
                include: {
                    class: true,
                },
            },
        },
    });

    if (!enrollment) {
        return null;
    }

    const { student, sub_class } = enrollment;

    return {
        ...student,
        class: sub_class?.class?.name || null,
        subClass: sub_class?.name || null,
    };
}
