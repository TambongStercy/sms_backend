// src/api/v1/services/userService.ts

import prisma, { Gender, User, Role, UserRole } from '../../../config/db';
import bcrypt from 'bcrypt';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import { getAcademicYearId, getCurrentAcademicYear } from '../../../utils/academicYear'; // Import the utility
import { VicePrincipalAssignment, DisciplineMasterAssignment } from '@prisma/client';

// Type definition for the input data for registering with roles
export interface RegisterWithRolesData {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    date_of_birth: string; // Expecting date string from request
    phone: string;
    address: string;
    roles: { role: Role; academic_year_id?: number }[];
}

export async function getAllUsers(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<User>> {
    // Process complex filters for users
    const processedFilters: any = { ...filterOptions };

    // Get the current academic year ID
    const currentAcademicYear = await getCurrentAcademicYear();
    const currentAcademicYearId = currentAcademicYear?.id;

    // Construct the OR condition for academic year matching for roles
    const roleAcademicYearOrCondition = currentAcademicYearId
        ? [
            { academic_year_id: currentAcademicYearId },
            { academic_year_id: null }
        ]
        : [
            { academic_year_id: null }
        ];

    // Define what relations to include and how to filter them
    const include: any = {
        // Include roles filtered by current year or null
        user_roles: {
            where: {
                OR: roleAcademicYearOrCondition
            }
        },
        // Include VP assignments filtered by current year
        vice_principal_assignments: {
            where: { academic_year_id: currentAcademicYearId },
            include: {
                sub_class: true // Include sub_class details
            }
        },
        // Include DM assignments filtered by current year
        discipline_master_assignments: {
            where: { academic_year_id: currentAcademicYearId },
            include: {
                sub_class: true // Include sub_class details
            }
        },
        // Conditionally include subject assignments if the user is a teacher
        subject_teachers: {
            include: {
                subject: true // Include the actual subject details
            }
        }
    };

    // Handle role filtering in the main query's where clause
    if (filterOptions?.role) {
        processedFilters.user_roles = {
            some: {
                role: filterOptions.role,
                OR: roleAcademicYearOrCondition // Use the same OR condition here
            }
        };
        delete processedFilters.role;
    }

    // Remove the includeRoles filter if present, as it's no longer needed
    delete processedFilters.includeRoles;


    return paginate<User>(
        prisma.user,
        paginationOptions,
        processedFilters,
        include // Pass the expanded include object
    );
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    gender: string;
    date_of_birth: string;
    phone: string;
    address: string;
}): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            gender: data.gender as Gender,
            date_of_birth: new Date(data.date_of_birth),
            phone: data.phone,
            address: data.address,
        },
    });
}

export async function registerAndAssignRoles(data: RegisterWithRolesData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
        // 1. Create the user
        const newUser = await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                gender: data.gender,
                date_of_birth: new Date(data.date_of_birth),
                phone: data.phone,
                address: data.address,
            },
        });

        // 2. Create role assignments
        if (data.roles && data.roles.length > 0) {
            const roleAssignments = data.roles.map(roleData => ({
                user_id: newUser.id,
                role: roleData.role,
                academic_year_id: roleData.academic_year_id,
            }));

            await tx.userRole.createMany({
                data: roleAssignments,
            });
        }

        // 3. Return the created user with their roles included
        const userWithRoles = await tx.user.findUnique({
            where: { id: newUser.id },
            include: {
                user_roles: true, // Include the assigned roles
            },
        });

        if (!userWithRoles) {
            // This should theoretically not happen in a successful transaction
            throw new Error("Failed to retrieve the newly created user with roles.");
        }

        return userWithRoles;
    });
}

export async function getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
        where: { id },
        include: { user_roles: true }
    });
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
        where: { id },
        data,
    });
}

export async function deleteUser(id: number): Promise<User> {
    // Use transaction to delete user and related roles
    return prisma.$transaction(async (tx) => {
        // Delete related roles first
        await tx.userRole.deleteMany({
            where: { user_id: id },
        });
        // Then delete the user
        return tx.user.delete({ where: { id } });
    });
}

export async function assignRole(user_id: number, data: { role: Role; academic_year_id?: number }): Promise<UserRole> {
    // Check if the role assignment already exists for the specific academic year or lack thereof
    const existingRole = await prisma.userRole.findFirst({
        where: {
            user_id,
            role: data.role,
            academic_year_id: data.academic_year_id, // Matches specific year or null
        }
    });

    // If the role already exists, return it to indicate idempotency
    if (existingRole) {
        return existingRole;
    }

    // Otherwise, create a new role assignment
    return prisma.userRole.create({
        data: {
            user_id,
            role: data.role,
            academic_year_id: data.academic_year_id,
        },
    });
}

export async function removeRole(user_id: number, user_role_id: number): Promise<void> {
    // Ensure the role belongs to the user before deleting
    const roleToDelete = await prisma.userRole.findUnique({
        where: { id: user_role_id }
    });

    if (!roleToDelete || roleToDelete.user_id !== user_id) {
        throw new Error('Role assignment not found or does not belong to the user.');
    }

    await prisma.userRole.delete({
        where: { id: user_role_id },
    });
}

/**
 * Sets (replaces) the roles for a specific user within the current academic year.
 * It first deletes all existing roles for the user in the current academic year,
 * then creates the new roles provided.
 * @param userId - The ID of the user.
 * @param roles - An array of Role enums to assign to the user for the current academic year.
 * @returns A promise resolving to the list of created UserRole objects.
 * @throws Error if there is no current academic year defined.
 */
export async function setUserRolesForAcademicYear(userId: number, roles: Role[]): Promise<UserRole[]> {
    const currentAcademicYear = await getCurrentAcademicYear();
    if (!currentAcademicYear) {
        throw new Error('Cannot set roles: No current academic year is defined.');
    }
    const academicYearId = currentAcademicYear.id;

    // Ensure the user exists
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    // Deduplicate the input roles array
    const uniqueRoles = [...new Set(roles)];

    return prisma.$transaction(async (tx) => {
        // 1. Delete existing roles for the user in the current academic year
        await tx.userRole.deleteMany({
            where: {
                user_id: userId,
                academic_year_id: academicYearId,
            },
        });

        // 2. Prepare data for new unique roles
        const newRoleData = uniqueRoles.map(role => ({
            user_id: userId,
            role: role,
            academic_year_id: academicYearId,
        }));

        // 3. Create the new roles if any unique roles were provided
        if (newRoleData.length > 0) {
            await tx.userRole.createMany({
                data: newRoleData,
            });
        }

        // 4. Return the newly created roles
        return tx.userRole.findMany({
            where: {
                user_id: userId,
                academic_year_id: academicYearId,
            },
        });
    });
}

// Note: Keeping createUserWithRole for potential specific use cases, but registerAndAssignRoles is more general
export async function createUserWithRole(userData: {
    email: string;
    password: string;
    name: string;
    gender: Gender;
    date_of_birth: Date;
    phone: string;
    address: string;
    role: Role;
    parentAssignments?: { studentId: number }[];
    teacherAssignments?: { subjectId: number }[];
}): Promise<any> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
        // 1. Create the user
        const newUser = await tx.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                gender: userData.gender,
                date_of_birth: userData.date_of_birth,
                phone: userData.phone,
                address: userData.address,
            },
        });

        // 2. Assign the role
        await tx.userRole.create({
            data: {
                user_id: newUser.id,
                role: userData.role,
            },
        });

        // 3. Handle parent-student assignments if role is PARENT
        if (userData.role === 'PARENT' && userData.parentAssignments?.length) {
            const parentAssignmentPromises = userData.parentAssignments.map(assignment =>
                tx.parentStudent.create({
                    data: {
                        parent_id: newUser.id,
                        student_id: assignment.studentId,
                    },
                })
            );
            await Promise.all(parentAssignmentPromises);
        }

        // 4. Handle teacher-subject assignments if role is TEACHER
        if (userData.role === 'TEACHER' && userData.teacherAssignments?.length) {
            const teacherAssignmentPromises = userData.teacherAssignments.map(assignment =>
                tx.subjectTeacher.create({
                    data: {
                        teacher_id: newUser.id,
                        subject_id: assignment.subjectId,
                    },
                })
            );
            await Promise.all(teacherAssignmentPromises);
        }

        // Return the created user with role and assignments
        return tx.user.findUnique({
            where: { id: newUser.id },
            include: {
                user_roles: true,
                ...(userData.role === 'PARENT' ? {
                    parent_students: {
                        include: { student: true }
                    }
                } : {}),
                ...(userData.role === 'TEACHER' ? {
                    subject_teachers: {
                        include: { subject: true }
                    }
                } : {})
            }
        });
    });
}

/**
 * Assigns a user as Vice Principal for a specific sub_class, defaulting to the current academic year.
 * Ensures the user has the VICE_PRINCIPAL role for the target year.
 */
export async function assignVicePrincipalToSubclass(
    userId: number,
    subClassId: number,
    academicYearId?: number
): Promise<VicePrincipalAssignment> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error('Academic Year ID is required but could not be determined.');
    }

    // Verify user exists and has the VICE_PRINCIPAL role for the target year or globally
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            user_roles: {
                some: {
                    role: Role.VICE_PRINCIPAL,
                    OR: [
                        { academic_year_id: yearId },
                        { academic_year_id: null }
                    ]
                }
            }
        }
    });
    if (!user) {
        throw new Error(`User with ID ${userId} not found or does not have the VICE_PRINCIPAL role for the academic year ${yearId}.`);
    }

    // Verify sub_class exists
    const sub_class = await prisma.subClass.findUnique({ where: { id: subClassId } });
    if (!sub_class) {
        throw new Error(`Subclass with ID ${subClassId} not found.`);
    }

    // Create or update the assignment (using upsert to handle potential duplicates cleanly)
    return prisma.vicePrincipalAssignment.upsert({
        where: {
            user_id_sub_class_id_academic_year_id: {
                user_id: userId,
                sub_class_id: subClassId,
                academic_year_id: yearId
            }
        },
        update: {},
        create: {
            user_id: userId,
            sub_class_id: subClassId,
            academic_year_id: yearId,
        }
    });
}

/**
 * Removes a Vice Principal assignment from a sub_class for a specific academic year.
 */
export async function removeVicePrincipalFromSubclass(
    userId: number,
    subClassId: number,
    academicYearId?: number
): Promise<void> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error('Academic Year ID is required but could not be determined.');
    }

    await prisma.vicePrincipalAssignment.deleteMany({
        where: {
            user_id: userId,
            sub_class_id: subClassId,
            academic_year_id: yearId
        }
    });
}

/**
 * Assigns a user as Discipline Master for a specific sub_class, defaulting to the current academic year.
 * Ensures the user has the DISCIPLINE_MASTER role for the target year.
 */
export async function assignDisciplineMasterToSubclass(
    userId: number,
    subClassId: number,
    academicYearId?: number
): Promise<DisciplineMasterAssignment> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error('Academic Year ID is required but could not be determined.');
    }

    // Verify user exists and has the DISCIPLINE_MASTER role for the target year or globally
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            user_roles: {
                some: {
                    role: Role.DISCIPLINE_MASTER,
                    OR: [
                        { academic_year_id: yearId },
                        { academic_year_id: null }
                    ]
                }
            }
        }
    });
    if (!user) {
        throw new Error(`User with ID ${userId} not found or does not have the DISCIPLINE_MASTER role for the academic year ${yearId}.`);
    }

    // Verify sub_class exists
    const sub_class = await prisma.subClass.findUnique({ where: { id: subClassId } });
    if (!sub_class) {
        throw new Error(`Subclass with ID ${subClassId} not found.`);
    }

    // Create or update the assignment
    return prisma.disciplineMasterAssignment.upsert({
        where: {
            user_id_sub_class_id_academic_year_id: {
                user_id: userId,
                sub_class_id: subClassId,
                academic_year_id: yearId
            }
        },
        update: {},
        create: {
            user_id: userId,
            sub_class_id: subClassId,
            academic_year_id: yearId,
        }
    });
}

/**
 * Removes a Discipline Master assignment from a sub_class for a specific academic year.
 */
export async function removeDisciplineMasterFromSubclass(
    userId: number,
    subClassId: number,
    academicYearId?: number
): Promise<void> {
    const yearId = academicYearId ?? await getAcademicYearId();
    if (!yearId) {
        throw new Error('Academic Year ID is required but could not be determined.');
    }

    await prisma.disciplineMasterAssignment.deleteMany({
        where: {
            user_id: userId,
            sub_class_id: subClassId,
            academic_year_id: yearId
        }
    });
}

export interface Teacher {
    id: number;
    name: string;
    email: string;
    gender: Gender;
    subjects: {
        id: number;
        name: string;
        category: string;
    }[];
}

export async function getAllTeachers(subjectId?: number): Promise<Teacher[]> {
    // Find users with TEACHER role
    const teachers = await prisma.user.findMany({
        where: {
            user_roles: {
                some: {
                    role: 'TEACHER'
                }
            },
            // If subject_id is provided, filter teachers who teach that subject
            ...(subjectId && {
                subject_teachers: {
                    some: {
                        subject_id: subjectId
                    }
                }
            })
        },
        include: {
            subject_teachers: {
                include: {
                    subject: true
                }
            }
        }
    });

    // Transform data to desired format
    return teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        gender: teacher.gender,
        subjects: teacher.subject_teachers.map(st => ({
            id: st.subject.id,
            name: st.subject.name,
            category: st.subject.category
        }))
    }));
}
