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

    return prisma.paymentTransaction.create({
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
