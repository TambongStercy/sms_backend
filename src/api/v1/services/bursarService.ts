import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';
import { generateStaffMatricule } from '../../../utils/matriculeGenerator';
import { StudentStatus, Gender, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

// Types for bursar operations
export interface StudentWithParentData {
    // Student information
    student_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: Gender;
    residence: string;
    former_school?: string;
    class_id: number;
    is_new_student?: boolean;
    academic_year_id?: number;

    // Parent information
    parent_name: string;
    parent_phone: string;
    parent_whatsapp?: string;
    parent_email?: string;
    parent_address: string;
    relationship?: string; // Father, Mother, Guardian
}

export interface LinkExistingParentData {
    student_id: number;
    parent_id: number;
    relationship?: string;
}

export interface ParentSearchResult {
    id: number;
    name: string;
    email: string;
    phone: string;
    matricule: string;
    children_count: number;
    children: Array<{
        id: number;
        name: string;
        matricule: string;
        class_name?: string;
    }>;
}

export interface RegistrationResult {
    student: {
        id: number;
        matricule: string;
        name: string;
        status: string;
    };
    parent: {
        id: number;
        matricule: string;
        name: string;
        phone: string;
        email: string;
        temporary_password: string;
    };
    enrollment: {
        id: number;
        class_name: string;
        status: string;
    };
    fee_record?: {
        id: number;
        amount_expected: number;
    };
}

/**
 * Create a student with automatic parent account creation
 * This is the main Bursar function for registering new students
 */
export async function createStudentWithParent(data: StudentWithParentData): Promise<RegistrationResult> {
    try {
        const yearId = data.academic_year_id || (await getCurrentAcademicYear())?.id;
        if (!yearId) {
            throw new Error('No current academic year found and none provided.');
        }

        // Check if class exists and get its base fee
        const classExists = await prisma.class.findUnique({
            where: { id: data.class_id },
            select: { id: true, name: true, base_fee: true }
        });
        if (!classExists) {
            throw new Error(`Class with ID ${data.class_id} not found.`);
        }

        // Generate matricule for student
        const studentMatricule = await generateStaffMatricule([]);

        // Hash password for parent
        const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

        return await prisma.$transaction(async (tx) => {
            // 1. Create student
            const student = await tx.student.create({
                data: {
                    matricule: studentMatricule,
                    name: data.student_name,
                    date_of_birth: new Date(data.date_of_birth),
                    place_of_birth: data.place_of_birth,
                    gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase() as Gender,
                    residence: data.residence,
                    former_school: data.former_school,
                    is_new_student: data.is_new_student ?? true,
                    status: StudentStatus.NOT_ENROLLED
                }
            });

            // 2. Create parent user
            const parentUser = await tx.user.create({
                data: {
                    name: data.parent_name,
                    email: data.parent_email || `${data.parent_name.toLowerCase().replace(' ', '.')}@school.com`,
                    phone: data.parent_phone,
                    whatsapp_number: data.parent_whatsapp,
                    address: data.parent_address,
                    password: hashedPassword,
                    gender: Gender.Male, // Default, can be updated later
                    date_of_birth: new Date('1980-01-01'), // Default, can be updated later
                    matricule: await generateStaffMatricule([Role.PARENT])
                }
            });

            // 3. Create parent role
            await tx.userRole.create({
                data: {
                    user_id: parentUser.id,
                    role: Role.PARENT,
                    academic_year_id: yearId
                }
            });

            // 4. Create enrollment
            const enrollment = await tx.enrollment.create({
                data: {
                    student_id: student.id,
                    class_id: data.class_id,
                    academic_year_id: yearId,
                    repeater: false
                }
            });

            // 5. Link parent to student
            await tx.parentStudent.create({
                data: {
                    parent_id: parentUser.id,
                    student_id: student.id
                }
            });

            // 6. Create initial fee record if class has base fee
            let feeRecord = null;
            if (classExists.base_fee && classExists.base_fee > 0) {
                feeRecord = await tx.schoolFees.create({
                    data: {
                        enrollment_id: enrollment.id,
                        amount_expected: classExists.base_fee,
                        amount_paid: 0,
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        academic_year_id: yearId
                    }
                });
            }

            return {
                student: {
                    id: student.id,
                    matricule: student.matricule,
                    name: student.name,
                    status: student.status
                },
                parent: {
                    id: parentUser.id,
                    matricule: parentUser.matricule,
                    name: parentUser.name,
                    email: parentUser.email,
                    phone: parentUser.phone,
                    temporary_password: 'defaultPassword123' // In production, send this securely
                },
                enrollment: {
                    id: enrollment.id,
                    class_name: classExists.name,
                    status: 'CREATED' // Status for frontend display
                },
                fee_record: feeRecord ? {
                    id: feeRecord.id,
                    amount_expected: feeRecord.amount_expected
                } : undefined
            };
        });
    } catch (error) {
        console.error('Error creating student with parent:', error);
        throw error;
    }
}

/**
 * Link an existing student to an existing parent
 */
export async function linkExistingParent(data: LinkExistingParentData): Promise<any> {
    try {
        // Check if parent exists
        const parent = await prisma.user.findUnique({
            where: { id: data.parent_id },
            include: {
                user_roles: {
                    where: { role: Role.PARENT }
                }
            }
        });

        if (!parent) {
            throw new Error('Parent not found');
        }

        // Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: data.student_id }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // Check if link already exists
        const existingLink = await prisma.parentStudent.findFirst({
            where: {
                parent_id: data.parent_id,
                student_id: data.student_id
            }
        });

        if (existingLink) {
            throw new Error('Parent is already linked to this student');
        }

        // Create the link
        const link = await prisma.parentStudent.create({
            data: {
                parent_id: data.parent_id,
                student_id: data.student_id
            }
        });

        return {
            success: true,
            message: 'Parent linked to student successfully',
            data: link
        };
    } catch (error) {
        console.error('Error linking parent to student:', error);
        throw error;
    }
}

/**
 * Get available parents for selection (search and browse)
 */
export async function getAvailableParents(searchTerm?: string, limit: number = 20): Promise<ParentSearchResult[]> {
    try {
        const whereClause: any = {
            user_roles: {
                some: {
                    role: Role.PARENT
                }
            }
        };

        if (searchTerm) {
            whereClause.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        const parents = await prisma.user.findMany({
            where: whereClause,
            include: {
                parent_students: {
                    include: {
                        student: {
                            include: {
                                enrollments: {
                                    include: {
                                        class: true
                                    },
                                    take: 1,
                                    orderBy: {
                                        created_at: 'desc'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: limit
        });

        return parents.map(parent => ({
            id: parent.id,
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            matricule: parent.matricule,
            children_count: parent.parent_students.length,
            children: parent.parent_students.map(link => ({
                id: link.student.id,
                name: link.student.name,
                matricule: link.student.matricule,
                class_name: link.student.enrollments?.[0]?.class?.name
            }))
        }));
    } catch (error) {
        console.error('Error fetching available parents:', error);
        throw error;
    }
}

/**
 * Get bursar dashboard statistics
 */
export async function getBursarDashboard(academicYearId?: number): Promise<any> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;
        if (!yearId) {
            throw new Error('No current academic year found and none provided.');
        }

        const [
            totalFees,
            totalPayments,
            recentPayments,
            newStudents,
            studentsWithParents,
            studentsWithoutParents
        ] = await Promise.all([
            // Total fees expected
            prisma.schoolFees.aggregate({
                where: { academic_year_id: yearId },
                _sum: { amount_expected: true }
            }),

            // Total payments received
            prisma.schoolFees.aggregate({
                where: { academic_year_id: yearId },
                _sum: { amount_paid: true }
            }),

            // Recent payments - using schoolFees as a proxy since feePayment doesn't exist
            prisma.schoolFees.findMany({
                where: {
                    academic_year_id: yearId,
                    amount_paid: { gt: 0 }
                },
                include: {
                    enrollment: {
                        include: {
                            student: {
                                include: {
                                    parents: {
                                        include: {
                                            parent: true
                                        }
                                    }
                                }
                            },
                            class: true // Include the class directly from enrollment
                        }
                    }
                },
                orderBy: { updated_at: 'desc' },
                take: 5
            }),

            // New students this month
            prisma.student.count({
                where: {
                    created_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Students with parents
            prisma.student.count({
                where: {
                    parents: {
                        some: {}
                    }
                }
            }),

            // Students without parents
            prisma.student.count({
                where: {
                    parents: {
                        none: {}
                    }
                }
            })
        ]);

        const totalFeesExpected = totalFees._sum.amount_expected || 0;
        const totalFeesCollected = totalPayments._sum.amount_paid || 0;
        const pendingPayments = totalFeesExpected - totalFeesCollected;
        const collectionRate = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

        return {
            totalFeesExpected,
            totalFeesCollected,
            pendingPayments,
            collectionRate,
            recentTransactions: recentPayments.length,
            newStudentsThisMonth: newStudents,
            studentsWithParents,
            studentsWithoutParents,
            paymentMethods: [
                { method: 'EXPRESS_UNION', count: 0, totalAmount: 0 },
                { method: 'CCA', count: 0, totalAmount: 0 },
                { method: '3DC', count: 0, totalAmount: 0 }
            ],
            recentRegistrations: recentPayments.slice(0, 5).map(payment => ({
                studentName: payment.enrollment.student.name,
                parentName: payment.enrollment.student.parents[0]?.parent?.name || 'N/A', // Get the first parent's name
                registrationDate: payment.enrollment.created_at,
                className: payment.enrollment.class?.name || 'N/A'
            }))
        };
    } catch (error) {
        console.error('Error fetching bursar dashboard:', error);
        throw error;
    }
} 