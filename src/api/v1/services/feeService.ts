// src/api/v1/services/feeService.ts
import prisma, { SchoolFees, PaymentTransaction, PaymentMethod } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';

export async function getAllFees(academicYearId?: number): Promise<SchoolFees[]> {
    const yearId = await getAcademicYearId(academicYearId);

    return prisma.schoolFees.findMany({
        where: yearId ? { academic_year_id: yearId } : undefined,
        include: {
            enrollment: {
                include: {
                    student: true
                }
            }
        }
    });
}

/**
 * Get a specific fee by ID
 * @param id The ID of the fee record
 * @returns The fee record or null if not found
 */
export async function getFeeById(id: number): Promise<SchoolFees | null> {
    return prisma.schoolFees.findUnique({
        where: { id },
        include: {
            enrollment: {
                include: {
                    student: true,
                    subclass: {
                        include: {
                            class: true
                        }
                    }
                }
            },
            academic_year: true,
            payment_transactions: true
        }
    });
}

export async function createFee(data: {
    amount_expected: number;
    amount_paid: number;
    academic_year_id?: number;
    due_date: string;
    enrollment_id?: number;
    student_id?: number;
}): Promise<SchoolFees> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        const enrollment = await getStudentSubclassByStudentAndYear(
            data.student_id,
            data.academic_year_id
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year`);
        }

        data.enrollment_id = enrollment.id;
    }

    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    return prisma.schoolFees.create({
        data: {
            amount_expected: data.amount_expected,
            amount_paid: data.amount_paid,
            academic_year_id: data.academic_year_id,
            due_date: new Date(data.due_date),
            enrollment_id: data.enrollment_id!
        }
    });
}

/**
 * Update an existing fee record
 * @param id The ID of the fee to update
 * @param data The updated fee data
 * @returns The updated fee record
 */
export async function updateFee(
    id: number,
    data: {
        amount_expected?: number;
        amount_paid?: number;
        due_date?: string;
    }
): Promise<SchoolFees> {
    // First check if the fee exists
    const fee = await prisma.schoolFees.findUnique({
        where: { id }
    });

    if (!fee) {
        throw new Error(`Fee with ID ${id} not found`);
    }

    // Build update data object
    const updateData: any = {};

    if (data.amount_expected !== undefined) {
        updateData.amount_expected = data.amount_expected;
    }

    if (data.amount_paid !== undefined) {
        updateData.amount_paid = data.amount_paid;
    }

    if (data.due_date) {
        updateData.due_date = new Date(data.due_date);
    }

    return prisma.schoolFees.update({
        where: { id },
        data: updateData,
        include: {
            enrollment: {
                include: {
                    student: true
                }
            },
            academic_year: true
        }
    });
}

/**
 * Delete a fee record
 * @param id The ID of the fee to delete
 * @returns The deleted fee record
 */
export async function deleteFee(id: number): Promise<SchoolFees> {
    // First check if there are any payments linked to this fee
    const payments = await prisma.paymentTransaction.findFirst({
        where: { fee_id: id }
    });

    if (payments) {
        throw new Error('Cannot delete fee with existing payment records. Delete the payments first.');
    }

    return prisma.schoolFees.delete({
        where: { id }
    });
}

/**
 * Get all fees for a specific student
 * @param studentId The ID of the student
 * @param academicYearId Optional academic year filter
 * @returns Array of fee records for the student
 */
export async function getStudentFees(studentId: number, academicYearId?: number): Promise<SchoolFees[]> {
    const yearId = await getAcademicYearId(academicYearId);

    return prisma.schoolFees.findMany({
        where: {
            enrollment: {
                student_id: studentId
            },
            ...(yearId && { academic_year_id: yearId })
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    subclass: true
                }
            },
            academic_year: true,
            payment_transactions: true
        },
        orderBy: {
            due_date: 'desc'
        }
    });
}

/**
 * Get fee summary for a subclass
 * @param subclassId The ID of the subclass
 * @param academicYearId Optional academic year filter
 * @returns Fee summary statistics for the subclass
 */
export async function getSubclassFeesSummary(subclassId: number, academicYearId?: number): Promise<any> {
    const yearId = await getAcademicYearId(academicYearId);

    // Get all enrollments for the subclass in the academic year
    const enrollments = await prisma.enrollment.findMany({
        where: {
            subclass_id: subclassId,
            ...(yearId && { academic_year_id: yearId })
        },
        include: {
            student: true
        }
    });

    if (enrollments.length === 0) {
        return {
            subclass_id: subclassId,
            academic_year_id: yearId,
            total_students: 0,
            total_expected: 0,
            total_paid: 0,
            payment_percentage: 0,
            students_with_fees: 0,
            students_fully_paid: 0,
            students: []
        };
    }

    // Get all fees for these enrollments
    const enrollmentIds = enrollments.map(e => e.id);
    const fees = await prisma.schoolFees.findMany({
        where: {
            enrollment_id: { in: enrollmentIds }
        },
        include: {
            enrollment: {
                include: {
                    student: true
                }
            },
            payment_transactions: true
        }
    });

    // Calculate summary statistics
    const totalExpected = fees.reduce((sum, fee) => sum + fee.amount_expected, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount_paid, 0);
    const paymentPercentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
    const studentsWithFees = new Set(fees.map(fee => fee.enrollment.student_id)).size;
    const studentsFullyPaid = fees.filter(fee => fee.amount_paid >= fee.amount_expected).length;

    // Prepare student-specific summaries
    const studentSummaries = enrollments.map(enrollment => {
        const studentFees = fees.filter(fee => fee.enrollment_id === enrollment.id);
        const expectedTotal = studentFees.reduce((sum, fee) => sum + fee.amount_expected, 0);
        const paidTotal = studentFees.reduce((sum, fee) => sum + fee.amount_paid, 0);
        const outstanding = expectedTotal - paidTotal;
        const status = outstanding <= 0 ? 'FULLY_PAID' : 'PENDING';

        return {
            student_id: enrollment.student_id,
            student_name: enrollment.student.name,
            matricule: enrollment.student.matricule,
            expected_total: expectedTotal,
            paid_total: paidTotal,
            outstanding: outstanding,
            payment_percentage: expectedTotal > 0 ? (paidTotal / expectedTotal) * 100 : 0,
            status
        };
    });

    return {
        subclass_id: subclassId,
        academic_year_id: yearId,
        total_students: enrollments.length,
        total_expected: totalExpected,
        total_paid: totalPaid,
        payment_percentage: paymentPercentage,
        students_with_fees: studentsWithFees,
        students_fully_paid: studentsFullyPaid,
        students: studentSummaries
    };
}

export async function recordPayment(data: {
    amount: number;
    payment_date: string;
    receipt_number?: string;
    payment_method: PaymentMethod;
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    fee_id: number;
}): Promise<PaymentTransaction> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        const enrollment = await getStudentSubclassByStudentAndYear(
            data.student_id,
            data.academic_year_id
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year`);
        }

        data.enrollment_id = enrollment.id;
    }

    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    // Create the payment transaction
    const transaction = await prisma.paymentTransaction.create({
        data: {
            fee_id: data.fee_id,
            amount: data.amount,
            receipt_number: data.receipt_number,
            payment_method: data.payment_method,
            enrollment_id: data.enrollment_id!,
            academic_year_id: data.academic_year_id,
            payment_date: new Date(data.payment_date),
        },
    });

    // Update the amount_paid in the SchoolFees record
    await prisma.schoolFees.update({
        where: { id: data.fee_id },
        data: {
            amount_paid: {
                increment: data.amount
            }
        }
    });

    return transaction;
}

export async function exportFeeReports(academicYearId?: number): Promise<any> {
    // Implementation for exporting fee reports
    // This is a placeholder - actual implementation would generate the report
    return { message: "Fee report exported successfully" };
}

/**
 * Retrieves all payment transactions for a specific fee record
 * @param feeId The ID of the fee record
 * @returns Array of payment transactions or null if the fee doesn't exist
 */
export async function getFeePayments(feeId: number): Promise<PaymentTransaction[] | null> {
    // First check if the fee exists
    const feeExists = await prisma.schoolFees.findUnique({
        where: { id: feeId }
    });

    if (!feeExists) {
        return null;
    }

    // Get all payment transactions for this fee
    return prisma.paymentTransaction.findMany({
        where: { fee_id: feeId },
        orderBy: { payment_date: 'desc' }
    });
}

/**
 * Updates all student fees when a class fee structure changes
 * @param classId The ID of the class that had its fee structure updated
 * @param academicYearId Optional academic year ID (defaults to current)
 * @returns The number of updated fee records
 */
export async function updateFeesOnClassFeeChange(classId: number, academicYearId?: number): Promise<number> {
    // Get current academic year if not provided
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to update fees, but none was provided or found.");
    }

    // Get the updated class info
    const classInfo = await prisma.class.findUnique({
        where: { id: classId }
    });

    if (!classInfo) {
        throw new Error(`Class with ID ${classId} not found`);
    }

    // Find all enrollments for this class in the given academic year
    const enrollments = await prisma.enrollment.findMany({
        where: {
            academic_year_id: yearId,
            subclass: {
                class_id: classId
            }
        },
        include: {
            student: true,
            subclass: true,
            school_fees: {
                where: {
                    academic_year_id: yearId // Ensure we only get fees for this academic year
                }
            }
        }
    });

    console.log(`Found ${enrollments.length} enrollments to update fees for class ${classId}`);

    // Track the number of updates
    let updatedCount = 0;

    // For each enrollment, update or create their fees based on class structure
    for (const enrollment of enrollments) {
        // Calculate the expected fee amount based on class structure
        // This can be customized based on your fee structure logic
        let feeAmount = classInfo.base_fee;

        // Add term-specific fees based on the current term
        const currentTerm = await prisma.term.findFirst({
            where: {
                academic_year_id: yearId,
                start_date: { lte: new Date() },
                end_date: { gte: new Date() }
            }
        });

        if (currentTerm) {
            if (currentTerm.name.toLowerCase().includes('first')) {
                feeAmount += classInfo.first_term_fee;
            } else if (currentTerm.name.toLowerCase().includes('second')) {
                feeAmount += classInfo.second_term_fee;
            } else if (currentTerm.name.toLowerCase().includes('third')) {
                feeAmount += classInfo.third_term_fee;
            }
        }

        // Add miscellaneous fees
        feeAmount += classInfo.miscellaneous_fee;

        // Add extra fees for new students if applicable
        if (enrollment.repeater) {
            feeAmount += classInfo.old_student_add_fee;
        } else {
            feeAmount += classInfo.new_student_add_fee;
        }

        console.log(`Calculated fee amount for student ${enrollment.student.name}: ${feeAmount}`);

        // Check if this enrollment already has fee records for this academic year
        if (enrollment.school_fees.length > 0) {
            // Update existing fee records
            for (const fee of enrollment.school_fees) {
                const updatedFee = await prisma.schoolFees.update({
                    where: { id: fee.id },
                    data: {
                        amount_expected: feeAmount
                    }
                });
                console.log(`Updated fee record ${fee.id} for student ${enrollment.student.name}. New expected amount: ${updatedFee.amount_expected}`);
                updatedCount++;
            }
        } else {
            // Create a new fee record if none exists
            const newFee = await prisma.schoolFees.create({
                data: {
                    enrollment_id: enrollment.id,
                    academic_year_id: yearId,
                    amount_expected: feeAmount,
                    amount_paid: 0,
                    due_date: currentTerm ? currentTerm.fee_deadline || new Date() : new Date()
                }
            });
            console.log(`Created new fee record ${newFee.id} for student ${enrollment.student.name}. Expected amount: ${newFee.amount_expected}`);
            updatedCount++;
        }
    }

    return updatedCount;
}

/**
 * Creates a school fee record automatically when a student is enrolled
 * @param enrollmentId The ID of the newly created enrollment
 * @returns The created school fee record
 */
export async function createFeeForNewEnrollment(enrollmentId: number): Promise<SchoolFees> {
    // Get the enrollment details
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            subclass: {
                include: {
                    class: true
                }
            },
            academic_year: true
        }
    });

    if (!enrollment) {
        throw new Error(`Enrollment with ID ${enrollmentId} not found`);
    }

    // Get the class fee structure
    const classInfo = enrollment.subclass.class;

    // Calculate the expected fee amount
    let feeAmount = classInfo.base_fee;

    // Add term-specific fees based on the current term
    const currentTerm = await prisma.term.findFirst({
        where: {
            academic_year_id: enrollment.academic_year_id,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() }
        }
    });

    if (currentTerm) {
        if (currentTerm.name.toLowerCase().includes('first')) {
            feeAmount += classInfo.first_term_fee;
        } else if (currentTerm.name.toLowerCase().includes('second')) {
            feeAmount += classInfo.second_term_fee;
        } else if (currentTerm.name.toLowerCase().includes('third')) {
            feeAmount += classInfo.third_term_fee;
        }
    }

    // Add miscellaneous fees
    feeAmount += classInfo.miscellaneous_fee;

    // Add extra fees for new students if applicable
    if (enrollment.repeater) {
        feeAmount += classInfo.old_student_add_fee;
    } else {
        feeAmount += classInfo.new_student_add_fee;
    }

    // Create the fee record
    return prisma.schoolFees.create({
        data: {
            enrollment_id: enrollmentId,
            academic_year_id: enrollment.academic_year_id,
            amount_expected: feeAmount,
            amount_paid: 0,
            due_date: currentTerm?.fee_deadline || new Date()
        }
    });
}
