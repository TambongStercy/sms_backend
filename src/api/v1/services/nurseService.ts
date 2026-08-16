import prisma, { NurseVisitLog, Prisma } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';

export interface CreateNurseVisitInput {
    student_id: number;
    academic_year_id?: number;
    period_id?: number;
    visit_date?: string | Date;
    reason: string;
    treatment_given?: string;
    medication_given?: string;
    notes?: string;
    sent_home?: boolean;
    logged_by_id: number;
}

export async function createNurseVisit(input: CreateNurseVisitInput): Promise<NurseVisitLog> {
    if (!input.reason?.trim()) throw new Error('reason is required');

    const yearId = input.academic_year_id ?? await getAcademicYearId();
    if (!yearId) throw new Error('No academic year found');

    const enrollment = await getStudentSubclassByStudentAndYear(input.student_id, yearId);
    if (!enrollment) {
        throw new Error(`Student ${input.student_id} is not enrolled in academic year ${yearId}`);
    }

    if (input.period_id !== undefined) {
        const period = await prisma.period.findUnique({ where: { id: input.period_id } });
        if (!period) throw new Error(`Period ${input.period_id} not found`);
    }

    return prisma.nurseVisitLog.create({
        data: {
            enrollment_id: enrollment.id,
            period_id: input.period_id ?? null,
            visit_date: input.visit_date ? new Date(input.visit_date) : new Date(),
            reason: input.reason.trim(),
            treatment_given: input.treatment_given?.trim() || null,
            medication_given: input.medication_given?.trim() || null,
            notes: input.notes?.trim() || null,
            sent_home: input.sent_home ?? false,
            logged_by_id: input.logged_by_id,
        },
        include: nurseVisitInclude,
    });
}

export interface ListNurseVisitOptions {
    student_id?: number;
    enrollment_id?: number;
    from?: string;
    to?: string;
    academic_year_id?: number;
    page?: number;
    limit?: number;
}

export async function listNurseVisits(opts: ListNurseVisitOptions) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 50;
    const yearId = opts.academic_year_id ?? await getAcademicYearId();

    const where: Prisma.NurseVisitLogWhereInput = {
        ...(opts.enrollment_id && { enrollment_id: opts.enrollment_id }),
        ...((opts.from || opts.to) && {
            visit_date: {
                ...(opts.from && { gte: new Date(opts.from) }),
                ...(opts.to && { lte: new Date(opts.to) }),
            },
        }),
        ...(opts.student_id && {
            enrollment: {
                student_id: opts.student_id,
                ...(yearId && { academic_year_id: yearId }),
            },
        }),
        ...(!opts.student_id && !opts.enrollment_id && yearId && {
            enrollment: { academic_year_id: yearId },
        }),
    };

    const [total, items] = await Promise.all([
        prisma.nurseVisitLog.count({ where }),
        prisma.nurseVisitLog.findMany({
            where,
            include: nurseVisitInclude,
            orderBy: { visit_date: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getNurseVisitById(id: number) {
    return prisma.nurseVisitLog.findUnique({
        where: { id },
        include: nurseVisitInclude,
    });
}

export interface UpdateNurseVisitInput {
    period_id?: number | null;
    visit_date?: string | Date;
    reason?: string;
    treatment_given?: string | null;
    medication_given?: string | null;
    notes?: string | null;
    sent_home?: boolean;
}

export async function updateNurseVisit(id: number, data: UpdateNurseVisitInput): Promise<NurseVisitLog> {
    const existing = await prisma.nurseVisitLog.findUnique({ where: { id } });
    if (!existing) throw new Error(`NurseVisitLog ${id} not found`);

    if (data.reason !== undefined && !data.reason.trim()) {
        throw new Error('reason cannot be blank');
    }
    if (data.period_id !== undefined && data.period_id !== null) {
        const period = await prisma.period.findUnique({ where: { id: data.period_id } });
        if (!period) throw new Error(`Period ${data.period_id} not found`);
    }

    return prisma.nurseVisitLog.update({
        where: { id },
        data: {
            ...(data.period_id !== undefined && { period_id: data.period_id }),
            ...(data.visit_date !== undefined && { visit_date: new Date(data.visit_date) }),
            ...(data.reason !== undefined && { reason: data.reason.trim() }),
            ...(data.treatment_given !== undefined && { treatment_given: data.treatment_given?.trim() || null }),
            ...(data.medication_given !== undefined && { medication_given: data.medication_given?.trim() || null }),
            ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
            ...(data.sent_home !== undefined && { sent_home: data.sent_home }),
        },
        include: nurseVisitInclude,
    });
}

export async function deleteNurseVisit(id: number): Promise<void> {
    const existing = await prisma.nurseVisitLog.findUnique({ where: { id } });
    if (!existing) throw new Error(`NurseVisitLog ${id} not found`);
    await prisma.nurseVisitLog.delete({ where: { id } });
}

export async function getStudentHealthProfile(studentId: number, academicYearId?: number) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            matricule: true,
            name: true,
            date_of_birth: true,
            gender: true,
            health_conditions: true,
            medical_notes: true,
        },
    });
    if (!student) throw new Error(`Student ${studentId} not found`);

    const yearId = academicYearId ?? await getAcademicYearId();

    const enrollment = yearId
        ? await prisma.enrollment.findFirst({
            where: { student_id: studentId, academic_year_id: yearId },
            include: {
                academic_year: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
                sub_class: { select: { id: true, name: true } },
            },
        })
        : null;

    const recentVisits = await prisma.nurseVisitLog.findMany({
        where: {
            enrollment: {
                student_id: studentId,
                ...(yearId && { academic_year_id: yearId }),
            },
        },
        include: nurseVisitInclude,
        orderBy: { visit_date: 'desc' },
        take: 20,
    });

    return { student, enrollment, recentVisits };
}

const nurseVisitInclude = {
    enrollment: {
        include: {
            student: { select: { id: true, name: true, matricule: true } },
            sub_class: { select: { id: true, name: true, class: { select: { name: true } } } },
        },
    },
    period: true,
    logged_by: { select: { id: true, name: true, matricule: true } },
} satisfies Prisma.NurseVisitLogInclude;
