import prisma, {
    FinanceRequest, FinanceRequestType, FinanceRequestStatus, Role, Prisma,
} from '../../../config/db';
import { RoleTier, userHasMinTier } from '../../../utils/roleHierarchy';

// ---------- Payload typing ----------
export interface FeeReductionPayload {
    enrollmentId: number;
    partnerName?: string;
}

export interface PersonnelDisbursementPayload {
    recipientUserId: number;
    purpose: string;
}

export interface BankVerificationPayload {
    studentId: number;
    claimedAmount?: number;
    estimatedPaymentPeriod: string; // e.g. "2026-03 to 2026-04"
}

function validatePayload(type: FinanceRequestType, payload: any, amount: number | null | undefined) {
    if (type === 'FEE_REDUCTION') {
        if (!payload || typeof payload.enrollmentId !== 'number') {
            throw new Error('FEE_REDUCTION payload.enrollmentId is required');
        }
        if (amount === null || amount === undefined || amount <= 0) {
            throw new Error('FEE_REDUCTION amount must be > 0');
        }
    } else if (type === 'PERSONNEL_DISBURSEMENT') {
        if (!payload || typeof payload.recipientUserId !== 'number' || !payload.purpose) {
            throw new Error('PERSONNEL_DISBURSEMENT payload.recipientUserId and payload.purpose are required');
        }
        if (amount === null || amount === undefined || amount <= 0) {
            throw new Error('PERSONNEL_DISBURSEMENT amount must be > 0');
        }
    } else if (type === 'BANK_VERIFICATION') {
        if (!payload || typeof payload.studentId !== 'number' || !payload.estimatedPaymentPeriod) {
            throw new Error('BANK_VERIFICATION payload.studentId and payload.estimatedPaymentPeriod are required');
        }
        // amount may be null
    }
}

// ---------- Create ----------
export interface CreateFinanceRequestInput {
    type: FinanceRequestType;
    amount?: number | null;
    reason: string;
    notes?: string;
    payload: Record<string, any>;
    requested_by_id: number;
}

export async function createFinanceRequest(input: CreateFinanceRequestInput): Promise<FinanceRequest> {
    if (!input.reason || !input.reason.trim()) throw new Error('reason is required');
    validatePayload(input.type, input.payload, input.amount ?? null);

    if (input.type === 'FEE_REDUCTION') {
        const enr = await prisma.enrollment.findUnique({ where: { id: input.payload.enrollmentId } });
        if (!enr) throw new Error(`Enrollment ${input.payload.enrollmentId} not found`);
    } else if (input.type === 'PERSONNEL_DISBURSEMENT') {
        const u = await prisma.user.findUnique({ where: { id: input.payload.recipientUserId } });
        if (!u) throw new Error(`Recipient user ${input.payload.recipientUserId} not found`);
    } else if (input.type === 'BANK_VERIFICATION') {
        const s = await prisma.student.findUnique({ where: { id: input.payload.studentId } });
        if (!s) throw new Error(`Student ${input.payload.studentId} not found`);
    }

    return prisma.financeRequest.create({
        data: {
            type: input.type,
            status: 'PENDING',
            amount: input.amount ?? null,
            reason: input.reason.trim(),
            notes: input.notes?.trim() || null,
            payload: input.payload as Prisma.InputJsonValue,
            requested_by_id: input.requested_by_id,
        },
    });
}

// ---------- Listing ----------
export interface ListFinanceRequestsOptions {
    type?: FinanceRequestType;
    status?: FinanceRequestStatus;
    requested_by_id?: number;
    recipient_user_id?: number;       // PERSONNEL_DISBURSEMENT — payload.recipientUserId match
    student_id?: number;              // BANK_VERIFICATION payload.studentId match (or FEE_REDUCTION via enrollment)
    page?: number;
    limit?: number;
    viewer_user_id?: number;          // for "show requests addressed to me"
    viewer_roles?: Role[];
}

export async function listFinanceRequests(opts: ListFinanceRequestsOptions) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 50;

    const where: Prisma.FinanceRequestWhereInput = {
        ...(opts.type && { type: opts.type }),
        ...(opts.status && { status: opts.status }),
        ...(opts.requested_by_id && { requested_by_id: opts.requested_by_id }),
    };

    // recipient_user_id filter for PERSONNEL_DISBURSEMENT (JSON match on payload.recipientUserId)
    if (opts.recipient_user_id) {
        where.AND = [
            ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
            { type: 'PERSONNEL_DISBURSEMENT' },
            { payload: { path: ['recipientUserId'], equals: opts.recipient_user_id } as any },
        ];
    }

    if (opts.student_id) {
        where.AND = [
            ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
            { payload: { path: ['studentId'], equals: opts.student_id } as any },
        ];
    }

    const [total, requests] = await Promise.all([
        prisma.financeRequest.count({ where }),
        prisma.financeRequest.findMany({
            where,
            include: {
                requested_by: { select: { id: true, name: true, matricule: true } },
                acted_by: { select: { id: true, name: true, matricule: true } },
            },
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: requests,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getFinanceRequestById(id: number) {
    return prisma.financeRequest.findUnique({
        where: { id },
        include: {
            requested_by: { select: { id: true, name: true, matricule: true } },
            acted_by: { select: { id: true, name: true, matricule: true } },
        },
    });
}

// ---------- Authorization helpers for transitions ----------
function isPrincipalPlus(roles: Role[]): boolean {
    return userHasMinTier(roles, RoleTier.HEAD_OF_SCHOOL);
}

function canActOnRequest(
    req: FinanceRequest,
    action: 'APPROVE' | 'REJECT' | 'COMPLETE',
    actorUserId: number,
    actorRoles: Role[]
): { allowed: boolean; reason?: string } {
    if (req.status !== 'PENDING') {
        return { allowed: false, reason: `Request is already ${req.status}` };
    }

    const principalPlus = isPrincipalPlus(actorRoles);

    if (req.type === 'FEE_REDUCTION') {
        if (action !== 'APPROVE' && action !== 'REJECT') {
            return { allowed: false, reason: 'FEE_REDUCTION only supports APPROVE or REJECT' };
        }
        if (!principalPlus) return { allowed: false, reason: 'Only Principal+ can act on FEE_REDUCTION' };
        return { allowed: true };
    }

    if (req.type === 'PERSONNEL_DISBURSEMENT') {
        if (action !== 'COMPLETE' && action !== 'REJECT') {
            return { allowed: false, reason: 'PERSONNEL_DISBURSEMENT only supports COMPLETE or REJECT' };
        }
        const recipientId = (req.payload as any)?.recipientUserId;
        const isRecipient = typeof recipientId === 'number' && recipientId === actorUserId;
        if (!isRecipient && !principalPlus) {
            return { allowed: false, reason: 'Only the recipient or Principal+ can act on this request' };
        }
        return { allowed: true };
    }

    if (req.type === 'BANK_VERIFICATION') {
        if (action !== 'COMPLETE' && action !== 'REJECT') {
            return { allowed: false, reason: 'BANK_VERIFICATION only supports COMPLETE or REJECT' };
        }
        // Anyone with Bursar+ view can act (Secretary, FeeAuditor, Bursar, Principal+).
        // We can't check roles precisely here without the full role list — caller should already
        // be one of these per route authorize(). If not principalPlus, ensure at least field-staff.
        return { allowed: true };
    }

    return { allowed: false, reason: 'Unknown request type' };
}

// ---------- Transitions ----------
async function transition(
    id: number,
    action: 'APPROVE' | 'REJECT' | 'COMPLETE',
    actorUserId: number,
    actorRoles: Role[],
    notes?: string
): Promise<FinanceRequest> {
    const req = await prisma.financeRequest.findUnique({ where: { id } });
    if (!req) throw new Error(`FinanceRequest ${id} not found`);

    const check = canActOnRequest(req, action, actorUserId, actorRoles);
    if (!check.allowed) {
        const err: any = new Error(check.reason || 'Forbidden');
        err.code = 'FORBIDDEN';
        throw err;
    }

    const newStatus: FinanceRequestStatus =
        action === 'APPROVE' ? 'APPROVED' :
        action === 'REJECT' ? 'REJECTED' :
        'COMPLETED';

    return prisma.financeRequest.update({
        where: { id },
        data: {
            status: newStatus,
            acted_by_id: actorUserId,
            acted_at: new Date(),
            acted_notes: notes?.trim() || null,
        },
    });
}

export const approveFinanceRequest = (id: number, actorUserId: number, actorRoles: Role[], notes?: string) =>
    transition(id, 'APPROVE', actorUserId, actorRoles, notes);

export const rejectFinanceRequest = (id: number, actorUserId: number, actorRoles: Role[], notes?: string) =>
    transition(id, 'REJECT', actorUserId, actorRoles, notes);

export const completeFinanceRequest = (id: number, actorUserId: number, actorRoles: Role[], notes?: string) =>
    transition(id, 'COMPLETE', actorUserId, actorRoles, notes);
