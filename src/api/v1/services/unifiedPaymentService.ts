// src/api/v1/services/unifiedPaymentService.ts
import prisma, { SchoolFees, ControlSchoolFees, PaymentTransaction, ControlPaymentTransaction, PaymentMethod } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { shouldPayNewStudentFees } from '../../../utils/studentStatus';

/**
 * Normalizes payment method string to an enum value
 */
function normalizePaymentMethod(method: string): 'EXPRESS_UNION' | 'CCA' | 'F3DC' {
    const upperMethod = method.toUpperCase();
    if (Object.values(PaymentMethod).includes(upperMethod as PaymentMethod)) {
        return upperMethod as 'EXPRESS_UNION' | 'CCA' | 'F3DC';
    }
    throw new Error(`Invalid payment method: ${method}`);
}

/**
 * Calculate fee amount for a student based on their class
 */
async function calculateStudentFeeAmount(enrollmentId: number, academicYearId: number): Promise<number> {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            student: true,
            sub_class: {
                include: { class: true }
            }
        }
    });

    if (!enrollment || !enrollment.sub_class?.class) {
        throw new Error('Enrollment or class information not found');
    }

    const classInfo = enrollment.sub_class.class;
    let feeAmount = classInfo.base_fee;

    // Add all term fees
    feeAmount += classInfo.first_term_fee;
    feeAmount += classInfo.second_term_fee;
    feeAmount += classInfo.third_term_fee;

    // Add miscellaneous fees
    feeAmount += classInfo.miscellaneous_fee;

    // Add new/old student fees
    const shouldPayNewFees = await shouldPayNewStudentFees(enrollment.student_id, academicYearId);
    if (shouldPayNewFees) {
        feeAmount += classInfo.new_student_fee;
    } else {
        feeAmount += classInfo.old_student_fee;
    }

    return feeAmount;
}

/**
 * Record payment for primary fees - creates fee if it doesn't exist
 */
export async function recordPrimaryPaymentWithFee(data: {
    amount: number;
    payment_date: string;
    receipt_number?: string;
    payment_method: string;
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    recorded_by_id?: number;
}): Promise<{ payment: PaymentTransaction; fee: SchoolFees; feeCreated: boolean }> {

    // Convert student_id to enrollment_id if needed
    if (data.student_id && !data.enrollment_id) {
        const studentId = typeof data.student_id === 'string' ? parseInt(data.student_id, 10) : data.student_id;
        const yearId = data.academic_year_id || await getAcademicYearId();
        if (!yearId) {
            throw new Error("Academic year ID is required to find enrollment by student ID, but none was provided or found.");
        }
        const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);
        if (!enrollment) {
            throw new Error(`Student with ID ${studentId} not enrolled in academic year ${yearId}`);
        }
        data.enrollment_id = enrollment.id;
    }

    if (!data.enrollment_id) {
        throw new Error('Enrollment ID is required to record a payment.');
    }

    const normalizedPaymentMethod = normalizePaymentMethod(data.payment_method);
    const academicYearId = data.academic_year_id || await getAcademicYearId();
    if (!academicYearId) {
        throw new Error("Academic year ID is required to record a payment, but none was provided or found.");
    }

    // Check if fee already exists
    let fee = await prisma.schoolFees.findFirst({
        where: {
            enrollment_id: data.enrollment_id,
            academic_year_id: academicYearId
        }
    });

    let feeCreated = false;

    // Create fee if it doesn't exist
    if (!fee) {
        const expectedAmount = await calculateStudentFeeAmount(data.enrollment_id, academicYearId);

        // Get academic year for due date
        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId }
        });

        fee = await prisma.schoolFees.create({
            data: {
                enrollment_id: data.enrollment_id,
                academic_year_id: academicYearId,
                amount_expected: expectedAmount,
                amount_paid: 0,
                due_date: academicYear?.end_date || new Date(new Date().getFullYear(), 11, 31)
            }
        });
        feeCreated = true;
    }

    // Create payment transaction
    const createData: any = {
        fee_id: fee.id,
        enrollment_id: data.enrollment_id,
        academic_year_id: academicYearId,
        amount: data.amount,
        payment_date: new Date(data.payment_date),
        receipt_number: data.receipt_number,
        payment_method: normalizedPaymentMethod,
    };

    if (data.recorded_by_id !== undefined) {
        createData.recorded_by_id = data.recorded_by_id;
    }

    const payment = await prisma.paymentTransaction.create({
        data: createData,
    });

    // Update the amount_paid in the SchoolFees record
    const updatedFee = await prisma.schoolFees.update({
        where: { id: fee.id },
        data: {
            amount_paid: {
                increment: data.amount
            }
        }
    });

    return { payment, fee: updatedFee, feeCreated };
}

/**
 * Record payment for control fees - creates fee if it doesn't exist
 */
export async function recordControlPaymentWithFee(data: {
    amount: number;
    payment_date: string;
    receipt_number?: string;
    payment_method: string;
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    recorded_by_id?: number;
}): Promise<{ payment: ControlPaymentTransaction; fee: ControlSchoolFees; feeCreated: boolean }> {

    // Convert student_id to enrollment_id if needed
    if (data.student_id && !data.enrollment_id) {
        const studentId = typeof data.student_id === 'string' ? parseInt(data.student_id, 10) : data.student_id;
        const yearId = data.academic_year_id || await getAcademicYearId();
        if (!yearId) {
            throw new Error("Academic year ID is required to find enrollment by student ID, but none was provided or found.");
        }
        const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);
        if (!enrollment) {
            throw new Error(`Student with ID ${studentId} not enrolled in academic year ${yearId}`);
        }
        data.enrollment_id = enrollment.id;
    }

    if (!data.enrollment_id) {
        throw new Error('Enrollment ID is required to record a control payment.');
    }

    const normalizedPaymentMethod = normalizePaymentMethod(data.payment_method);
    const academicYearId = data.academic_year_id || await getAcademicYearId();
    if (!academicYearId) {
        throw new Error("Academic year ID is required to record a control payment, but none was provided or found.");
    }

    // Check if control fee already exists
    let fee = await prisma.controlSchoolFees.findFirst({
        where: {
            enrollment_id: data.enrollment_id,
            academic_year_id: academicYearId
        }
    });

    let feeCreated = false;

    // Create control fee if it doesn't exist
    if (!fee) {
        const expectedAmount = await calculateStudentFeeAmount(data.enrollment_id, academicYearId);

        // Get academic year for due date
        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId }
        });

        fee = await prisma.controlSchoolFees.create({
            data: {
                enrollment_id: data.enrollment_id,
                academic_year_id: academicYearId,
                amount_expected: expectedAmount,
                amount_paid: 0,
                due_date: academicYear?.end_date || new Date(new Date().getFullYear(), 11, 31)
            }
        });
        feeCreated = true;
    }

    // Create control payment transaction
    const createData: any = {
        control_fee_id: fee.id,
        enrollment_id: data.enrollment_id,
        academic_year_id: academicYearId,
        amount: data.amount,
        payment_date: new Date(data.payment_date),
        receipt_number: data.receipt_number,
        payment_method: normalizedPaymentMethod,
    };

    if (data.recorded_by_id !== undefined) {
        createData.recorded_by_id = data.recorded_by_id;
    }

    const payment = await prisma.controlPaymentTransaction.create({
        data: createData,
    });

    // Update the amount_paid in the ControlSchoolFees record
    const updatedFee = await prisma.controlSchoolFees.update({
        where: { id: fee.id },
        data: {
            amount_paid: {
                increment: data.amount
            }
        }
    });

    return { payment, fee: updatedFee, feeCreated };
}