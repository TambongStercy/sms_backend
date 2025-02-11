// src/api/v1/services/feeService.ts
import prisma, { SchoolFees, PaymentTransaction, PaymentMethod } from '../../../config/db';


export async function getAllFees(): Promise<SchoolFees[]> {
    return prisma.schoolFees.findMany();
}

export async function createFee(data: {
    amount_expected: number;
    amount_paid: number;
    academic_year_id: number;
    due_date: string;
    student_id: number;
}): Promise<SchoolFees> {
    return prisma.schoolFees.create({
        data: {
            ...data,
            due_date: new Date(data.due_date),
        },
    });
}

export async function recordPayment(id: number, data: {
    amount: number;
    payment_date: string;
    receipt_number: string;
    payment_method: string;
    student_id: number;
    academic_year_id: number;
}): Promise<PaymentTransaction> {
    return prisma.paymentTransaction.create({
        data: {
            amount: data.amount,
            receipt_number: data.receipt_number,
            payment_method: data.payment_method as PaymentMethod,
            student_id: data.student_id,
            academic_year_id: data.academic_year_id,
            payment_date: new Date(data.payment_date),
        },
    });
}

export async function exportFeeReports(): Promise<any> {
    // Implement your report export logic (Excel, PDF, etc.)
    return { message: 'Fee report generated' };
}
