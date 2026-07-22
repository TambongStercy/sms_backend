import prisma, { Refund, RefundMethod, Prisma } from '../../../config/db';
import { getAcademicYearId } from '../../../utils/academicYear';
import * as XLSX from 'xlsx';

export interface OverpaidRow {
    school_fees_id: number;
    enrollment_id: number;
    student_id: number;
    matricule: string;
    name: string;
    class_name: string | null;
    sub_class_name: string | null;
    amount_expected: number;
    amount_paid: number;
    overpayment: number;
    total_refunded: number;
    current_overpayment: number;
    refunds_count: number;
}

export interface ListOverpaidOptions {
    academic_year_id?: number;
    class_id?: number;
    sub_class_id?: number;
    min_overpayment?: number;
    page?: number;
    limit?: number;
}

export interface ListOverpaidResult {
    data: OverpaidRow[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

async function buildOverpaidRows(opts: {
    academic_year_id: number;
    class_id?: number;
    sub_class_id?: number;
    min_overpayment: number;
    skip?: number;
    take?: number;
}): Promise<{ rows: OverpaidRow[]; total: number }> {
    // Find candidate SchoolFees where the cached amount_paid > amount_expected.
    // We will then subtract refunds in JS to compute current_overpayment.
    const where: Prisma.SchoolFeesWhereInput = {
        academic_year_id: opts.academic_year_id,
        ...(opts.class_id || opts.sub_class_id
            ? {
                enrollment: {
                    ...(opts.class_id ? { class_id: opts.class_id } : {}),
                    ...(opts.sub_class_id ? { sub_class_id: opts.sub_class_id } : {}),
                },
            }
            : {}),
    };

    const candidates = await prisma.schoolFees.findMany({
        where,
        include: {
            refunds: { select: { amount: true } },
            enrollment: {
                include: {
                    student: { select: { id: true, matricule: true, name: true } },
                    class: { select: { id: true, name: true } },
                    sub_class: { select: { id: true, name: true } },
                },
            },
        },
    });

    const rows: OverpaidRow[] = [];
    for (const sf of candidates) {
        const totalRefunded = sf.refunds.reduce((s, r) => s + r.amount, 0);
        const overpayment = sf.amount_paid - sf.amount_expected;
        const currentOverpayment = overpayment - totalRefunded;
        if (currentOverpayment < opts.min_overpayment) continue;

        rows.push({
            school_fees_id: sf.id,
            enrollment_id: sf.enrollment_id,
            student_id: sf.enrollment.student.id,
            matricule: sf.enrollment.student.matricule,
            name: sf.enrollment.student.name,
            class_name: sf.enrollment.class?.name ?? null,
            sub_class_name: sf.enrollment.sub_class?.name ?? null,
            amount_expected: sf.amount_expected,
            amount_paid: sf.amount_paid,
            overpayment,
            total_refunded: totalRefunded,
            current_overpayment: currentOverpayment,
            refunds_count: sf.refunds.length,
        });
    }

    rows.sort((a, b) => b.current_overpayment - a.current_overpayment);

    const total = rows.length;
    const sliced = opts.skip !== undefined && opts.take !== undefined
        ? rows.slice(opts.skip, opts.skip + opts.take)
        : rows;

    return { rows: sliced, total };
}

export async function listOverpaid(opts: ListOverpaidOptions): Promise<ListOverpaidResult> {
    const yearId = opts.academic_year_id ?? await getAcademicYearId();
    if (!yearId) throw new Error('Academic year is required');

    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 50;
    const min_overpayment = opts.min_overpayment ?? 1;

    const { rows, total } = await buildOverpaidRows({
        academic_year_id: yearId,
        class_id: opts.class_id,
        sub_class_id: opts.sub_class_id,
        min_overpayment,
        skip: (page - 1) * limit,
        take: limit,
    });

    return {
        data: rows,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function exportOverpaidExcel(opts: Omit<ListOverpaidOptions, 'page' | 'limit'>): Promise<{ buffer: Buffer; filename: string }> {
    const yearId = opts.academic_year_id ?? await getAcademicYearId();
    if (!yearId) throw new Error('Academic year is required');
    const min_overpayment = opts.min_overpayment ?? 1;

    const { rows } = await buildOverpaidRows({
        academic_year_id: yearId,
        class_id: opts.class_id,
        sub_class_id: opts.sub_class_id,
        min_overpayment,
    });

    // Pull parent contact info for the export
    const studentIds = rows.map(r => r.student_id);
    const parents = await prisma.parentStudent.findMany({
        where: { student_id: { in: studentIds } },
        include: { parent: { select: { id: true, name: true, phone: true, email: true } } },
    });
    const parentsByStudent = new Map<number, Array<{ name: string; phone: string; email: string }>>();
    for (const ps of parents) {
        const arr = parentsByStudent.get(ps.student_id) ?? [];
        if (ps.parent) arr.push({ name: ps.parent.name, phone: ps.parent.phone ?? '', email: ps.parent.email ?? '' });
        parentsByStudent.set(ps.student_id, arr);
    }

    const sheet = [
        ['Matricule', 'Name', 'Class', 'Subclass', 'Amount Expected', 'Amount Paid', 'Overpayment', 'Total Refunded', 'Current Overpayment', 'Parent Name', 'Parent Phone', 'Parent Email'],
        ...rows.map(r => {
            const ps = parentsByStudent.get(r.student_id) ?? [];
            const p = ps[0] ?? { name: '', phone: '', email: '' };
            return [
                r.matricule, r.name, r.class_name ?? '', r.sub_class_name ?? '',
                r.amount_expected, r.amount_paid, r.overpayment, r.total_refunded, r.current_overpayment,
                p.name, p.phone, p.email,
            ];
        }),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheet);
    worksheet['!cols'] = sheet[0].map((_, i) => ({ wch: i === 1 ? 28 : 16 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Overpayments');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const filename = `overpayments_${yearId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    return { buffer, filename };
}

function normalizeRefundMethod(method: string): RefundMethod {
    const m = (method ?? '').toUpperCase().replace(/[\s-]/g, '_');
    const allowed: RefundMethod[] = ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'EXPRESS_UNION', 'CCA', 'F3DC', 'AFRILAND_FIRST_BANK'];
    if (allowed.includes(m as RefundMethod)) return m as RefundMethod;
    throw new Error(`Unsupported refund method: ${method}`);
}

export interface RecordRefundInput {
    enrollment_id: number;
    amount: number;
    refund_date: string;
    refund_method: string;
    reason: string;
    notes?: string;
    recorded_by_id: number;
}

export interface RecordRefundResult {
    refund: Refund;
    feeAfter: { amount_expected: number; amount_paid: number; current_overpayment: number };
}

export async function recordRefund(input: RecordRefundInput): Promise<RecordRefundResult> {
    if (input.amount <= 0) throw new Error('amount must be greater than 0');
    if (!input.reason || !input.reason.trim()) throw new Error('reason is required');
    const method = normalizeRefundMethod(input.refund_method);

    return prisma.$transaction(async (tx) => {
        // Find the current-year SchoolFees row for this enrollment
        const enrollment = await tx.enrollment.findUnique({
            where: { id: input.enrollment_id },
            include: {
                school_fees: { include: { refunds: { select: { amount: true } } } },
            },
        });
        if (!enrollment) throw new Error(`Enrollment ${input.enrollment_id} not found`);

        const fees = enrollment.school_fees[0];
        if (!fees) throw new Error(`Enrollment ${input.enrollment_id} has no SchoolFees record`);

        const totalRefunded = fees.refunds.reduce((s, r) => s + r.amount, 0);
        const currentOverpayment = fees.amount_paid - fees.amount_expected - totalRefunded;

        if (currentOverpayment <= 0) {
            throw new Error('Enrollment has no current overpayment to refund');
        }
        if (input.amount > currentOverpayment) {
            throw new Error(`Refund amount (${input.amount}) exceeds current overpayment (${currentOverpayment})`);
        }

        const refund = await tx.refund.create({
            data: {
                enrollment_id: input.enrollment_id,
                school_fees_id: fees.id,
                amount: input.amount,
                refund_date: new Date(input.refund_date),
                refund_method: method,
                reason: input.reason.trim(),
                notes: input.notes?.trim() || null,
                recorded_by_id: input.recorded_by_id,
            },
        });

        const updated = await tx.schoolFees.update({
            where: { id: fees.id },
            data: { amount_paid: { decrement: input.amount } },
        });

        return {
            refund,
            feeAfter: {
                amount_expected: updated.amount_expected,
                amount_paid: updated.amount_paid,
                current_overpayment: currentOverpayment - input.amount,
            },
        };
    });
}

export interface ListRefundsOptions {
    student_id?: number;
    enrollment_id?: number;
    academic_year_id?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export async function listRefunds(opts: ListRefundsOptions) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 50;

    const where: Prisma.RefundWhereInput = {
        ...(opts.enrollment_id ? { enrollment_id: opts.enrollment_id } : {}),
        ...(opts.student_id ? { enrollment: { student_id: opts.student_id } } : {}),
        ...(opts.academic_year_id ? { enrollment: { academic_year_id: opts.academic_year_id } } : {}),
        ...(opts.from || opts.to
            ? {
                refund_date: {
                    ...(opts.from ? { gte: new Date(opts.from) } : {}),
                    ...(opts.to ? { lte: new Date(opts.to) } : {}),
                },
            }
            : {}),
    };

    const [total, refunds] = await Promise.all([
        prisma.refund.count({ where }),
        prisma.refund.findMany({
            where,
            include: {
                enrollment: {
                    include: {
                        student: { select: { id: true, matricule: true, name: true } },
                        academic_year: { select: { id: true, name: true } },
                        class: { select: { id: true, name: true } },
                        sub_class: { select: { id: true, name: true } },
                    },
                },
                recorded_by: { select: { id: true, name: true, matricule: true } },
            },
            orderBy: { refund_date: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: refunds,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getRefundById(id: number) {
    return prisma.refund.findUnique({
        where: { id },
        include: {
            enrollment: {
                include: {
                    student: { select: { id: true, matricule: true, name: true } },
                    academic_year: { select: { id: true, name: true } },
                    class: { select: { id: true, name: true } },
                    sub_class: { select: { id: true, name: true } },
                },
            },
            school_fees: { select: { id: true, amount_expected: true, amount_paid: true } },
            recorded_by: { select: { id: true, name: true, matricule: true } },
        },
    });
}
