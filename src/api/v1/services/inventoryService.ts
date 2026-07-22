import prisma from '../../../config/db';
import { Prisma, InventoryTransferStatus, InventoryLedgerReason, Role } from '@prisma/client';
import { emitToUser } from '../../../realtime/socket';
import { sendNotification } from './notificationService';

// ---------- Types ----------

export interface CreateItemInput {
    name: string;
    description?: string;
    unit?: string;
}

export interface UpdateItemInput {
    name?: string;
    description?: string | null;
    unit?: string;
    is_active?: boolean;
}

export interface GrantInput {
    userId: number;
    itemId: number;
    quantity: number;
    note?: string;
}

export interface AdjustInput {
    userId: number;
    itemId: number;
    delta: number; // may be negative
    note?: string;
}

export interface TransferInput {
    itemId: number;
    toUserId: number;
    quantity: number;
    note?: string;
}

// ---------- Helpers ----------

function badRequest(message: string): Error {
    const e: any = new Error(message);
    e.statusCode = 400;
    return e;
}
function notFound(message: string): Error {
    const e: any = new Error(message);
    e.statusCode = 404;
    return e;
}
function forbidden(message: string): Error {
    const e: any = new Error(message);
    e.statusCode = 403;
    return e;
}
function conflict(message: string): Error {
    const e: any = new Error(message);
    e.statusCode = 409;
    return e;
}

async function userHasRoleParent(userId: number): Promise<boolean> {
    const roles = await prisma.userRole.findMany({
        where: { user_id: userId },
        select: { role: true },
    });
    return roles.some((r) => r.role === Role.PARENT);
}

async function assertActiveItem(itemId: number) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw notFound('Inventory item not found');
    if (!item.is_active) throw badRequest('Inventory item is inactive');
    return item;
}

async function upsertHoldingDelta(
    tx: Prisma.TransactionClient,
    userId: number,
    itemId: number,
    delta: number,
    reason: InventoryLedgerReason,
    actorId: number,
    transferId?: number,
    note?: string,
) {
    const existing = await tx.inventoryHolding.findUnique({
        where: { user_id_item_id: { user_id: userId, item_id: itemId } },
    });
    const nextQty = (existing?.quantity ?? 0) + delta;
    if (nextQty < 0) {
        throw badRequest('Operation would make holding negative');
    }
    if (existing) {
        await tx.inventoryHolding.update({
            where: { id: existing.id },
            data: { quantity: nextQty },
        });
    } else {
        await tx.inventoryHolding.create({
            data: { user_id: userId, item_id: itemId, quantity: nextQty },
        });
    }
    await tx.inventoryLedger.create({
        data: {
            user_id: userId,
            item_id: itemId,
            delta,
            reason,
            transfer_id: transferId ?? null,
            actor_id: actorId,
            note: note ?? null,
        },
    });
}

// ---------- Catalog (Manager) ----------

export async function listItems(opts: { includeInactive?: boolean; search?: string } = {}) {
    return prisma.inventoryItem.findMany({
        where: {
            ...(opts.includeInactive ? {} : { is_active: true }),
            ...(opts.search
                ? { name: { contains: opts.search, mode: 'insensitive' } }
                : {}),
        },
        orderBy: { name: 'asc' },
    });
}

export async function createItem(actorId: number, input: CreateItemInput) {
    if (!input.name?.trim()) throw badRequest('name required');
    try {
        return await prisma.inventoryItem.create({
            data: {
                name: input.name.trim(),
                description: input.description?.trim() || null,
                unit: input.unit?.trim() || 'pcs',
                created_by_id: actorId,
            },
        });
    } catch (e: any) {
        if (e?.code === 'P2002') throw conflict('An item with this name already exists');
        throw e;
    }
}

export async function updateItem(itemId: number, input: UpdateItemInput) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw notFound('Inventory item not found');
    try {
        return await prisma.inventoryItem.update({
            where: { id: itemId },
            data: {
                ...(input.name !== undefined ? { name: input.name.trim() } : {}),
                ...(input.description !== undefined
                    ? { description: input.description?.trim() || null }
                    : {}),
                ...(input.unit !== undefined ? { unit: input.unit.trim() || 'pcs' } : {}),
                ...(input.is_active !== undefined ? { is_active: !!input.is_active } : {}),
            },
        });
    } catch (e: any) {
        if (e?.code === 'P2002') throw conflict('An item with this name already exists');
        throw e;
    }
}

export async function deactivateItem(itemId: number) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw notFound('Inventory item not found');
    return prisma.inventoryItem.update({
        where: { id: itemId },
        data: { is_active: false },
    });
}

// ---------- Manager stock ops ----------

export async function grantStock(actorId: number, input: GrantInput) {
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        throw badRequest('quantity must be a positive integer');
    }
    const target = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!target) throw notFound('Target user not found');
    if (await userHasRoleParent(input.userId)) {
        throw badRequest('Parents cannot hold inventory');
    }
    await assertActiveItem(input.itemId);

    await prisma.$transaction(async (tx) => {
        await upsertHoldingDelta(
            tx,
            input.userId,
            input.itemId,
            input.quantity,
            InventoryLedgerReason.MANAGER_GRANT,
            actorId,
            undefined,
            input.note,
        );
    });

    const holding = await prisma.inventoryHolding.findUnique({
        where: { user_id_item_id: { user_id: input.userId, item_id: input.itemId } },
        include: { item: true },
    });
    // Realtime + push for the recipient
    emitToUser(input.userId, 'inventory.holding.updated', holding);
    sendNotification({
        user_id: input.userId,
        message: `Inventory: +${input.quantity} ${holding?.item?.unit ?? 'pcs'} ${holding?.item?.name ?? ''} granted by manager`,
    }).catch(() => {});
    return holding;
}

export async function adjustStock(actorId: number, input: AdjustInput) {
    if (!Number.isInteger(input.delta) || input.delta === 0) {
        throw badRequest('delta must be a non-zero integer');
    }
    const target = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!target) throw notFound('Target user not found');
    if (await userHasRoleParent(input.userId)) {
        throw badRequest('Parents cannot hold inventory');
    }
    await assertActiveItem(input.itemId);

    await prisma.$transaction(async (tx) => {
        await upsertHoldingDelta(
            tx,
            input.userId,
            input.itemId,
            input.delta,
            InventoryLedgerReason.MANAGER_ADJUST,
            actorId,
            undefined,
            input.note,
        );
    });

    const holding = await prisma.inventoryHolding.findUnique({
        where: { user_id_item_id: { user_id: input.userId, item_id: input.itemId } },
        include: { item: true },
    });
    emitToUser(input.userId, 'inventory.holding.updated', holding);
    return holding;
}

// ---------- Read holdings & history ----------

export async function listHoldings(userId: number) {
    return prisma.inventoryHolding.findMany({
        where: { user_id: userId },
        include: { item: true },
        orderBy: { item: { name: 'asc' } },
    });
}

export async function listLedger(
    userId: number,
    opts: { itemId?: number; limit?: number; before?: string } = {},
) {
    const limit = Math.min(opts.limit && opts.limit > 0 ? opts.limit : 50, 200);
    return prisma.inventoryLedger.findMany({
        where: {
            user_id: userId,
            ...(opts.itemId ? { item_id: opts.itemId } : {}),
            ...(opts.before ? { created_at: { lt: new Date(opts.before) } } : {}),
        },
        include: {
            item: { select: { id: true, name: true, unit: true } },
            actor: { select: { id: true, name: true } },
            transfer: {
                select: {
                    id: true,
                    from_user_id: true,
                    to_user_id: true,
                    status: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
    });
}

// ---------- Transfers ----------

export async function initiateTransfer(actorId: number, input: TransferInput) {
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        throw badRequest('quantity must be a positive integer');
    }
    if (input.toUserId === actorId) throw badRequest('Cannot transfer to yourself');

    const [target, item] = await Promise.all([
        prisma.user.findUnique({ where: { id: input.toUserId } }),
        prisma.inventoryItem.findUnique({ where: { id: input.itemId } }),
    ]);
    if (!target) throw notFound('Recipient user not found');
    if (!item) throw notFound('Inventory item not found');
    if (!item.is_active) throw badRequest('Inventory item is inactive');
    if (await userHasRoleParent(input.toUserId)) {
        throw badRequest('Cannot transfer to a parent');
    }

    const senderHolding = await prisma.inventoryHolding.findUnique({
        where: { user_id_item_id: { user_id: actorId, item_id: input.itemId } },
    });
    if (!senderHolding || senderHolding.quantity < input.quantity) {
        throw badRequest('Insufficient stock for this transfer');
    }

    const transfer = await prisma.$transaction(async (tx) => {
        const t = await tx.inventoryTransfer.create({
            data: {
                item_id: input.itemId,
                from_user_id: actorId,
                to_user_id: input.toUserId,
                quantity: input.quantity,
                note: input.note?.trim() || null,
            },
        });
        // Debit the sender immediately; will be refunded on reject/cancel.
        await upsertHoldingDelta(
            tx,
            actorId,
            input.itemId,
            -input.quantity,
            InventoryLedgerReason.TRANSFER_SENT,
            actorId,
            t.id,
            input.note,
        );
        return t;
    });

    const full = await prisma.inventoryTransfer.findUnique({
        where: { id: transfer.id },
        include: {
            item: true,
            from_user: { select: { id: true, name: true } },
            to_user: { select: { id: true, name: true } },
        },
    });

    // Realtime: notify both sides
    emitToUser(input.toUserId, 'inventory.transfer.received', full);
    emitToUser(actorId, 'inventory.transfer.sent', full);

    sendNotification({
        user_id: input.toUserId,
        message: `Inventory: ${full?.from_user.name} wants to transfer ${input.quantity} ${full?.item.unit} ${full?.item.name} to you — please accept or reject`,
    }).catch(() => {});

    return full;
}

async function loadPendingTransferOrThrow(transferId: number) {
    const t = await prisma.inventoryTransfer.findUnique({ where: { id: transferId } });
    if (!t) throw notFound('Transfer not found');
    if (t.status !== InventoryTransferStatus.PENDING) {
        throw conflict(`Transfer is already ${t.status.toLowerCase()}`);
    }
    return t;
}

export async function acceptTransfer(actorId: number, transferId: number) {
    const t = await loadPendingTransferOrThrow(transferId);
    if (t.to_user_id !== actorId) throw forbidden('Only the recipient can accept this transfer');

    const updated = await prisma.$transaction(async (tx) => {
        await upsertHoldingDelta(
            tx,
            t.to_user_id,
            t.item_id,
            t.quantity,
            InventoryLedgerReason.TRANSFER_RECEIVED,
            actorId,
            t.id,
        );
        return tx.inventoryTransfer.update({
            where: { id: t.id },
            data: {
                status: InventoryTransferStatus.ACCEPTED,
                resolved_at: new Date(),
                resolved_by_id: actorId,
            },
            include: {
                item: true,
                from_user: { select: { id: true, name: true } },
                to_user: { select: { id: true, name: true } },
            },
        });
    });

    emitToUser(t.from_user_id, 'inventory.transfer.resolved', updated);
    emitToUser(t.to_user_id, 'inventory.transfer.resolved', updated);
    sendNotification({
        user_id: t.from_user_id,
        message: `Inventory: ${updated.to_user.name} accepted your transfer of ${t.quantity} ${updated.item.unit} ${updated.item.name}`,
    }).catch(() => {});
    return updated;
}

export async function rejectTransfer(actorId: number, transferId: number) {
    const t = await loadPendingTransferOrThrow(transferId);
    if (t.to_user_id !== actorId) throw forbidden('Only the recipient can reject this transfer');

    const updated = await prisma.$transaction(async (tx) => {
        // Refund the sender
        await upsertHoldingDelta(
            tx,
            t.from_user_id,
            t.item_id,
            t.quantity,
            InventoryLedgerReason.TRANSFER_REFUNDED,
            actorId,
            t.id,
        );
        return tx.inventoryTransfer.update({
            where: { id: t.id },
            data: {
                status: InventoryTransferStatus.REJECTED,
                resolved_at: new Date(),
                resolved_by_id: actorId,
            },
            include: {
                item: true,
                from_user: { select: { id: true, name: true } },
                to_user: { select: { id: true, name: true } },
            },
        });
    });

    emitToUser(t.from_user_id, 'inventory.transfer.resolved', updated);
    emitToUser(t.to_user_id, 'inventory.transfer.resolved', updated);
    sendNotification({
        user_id: t.from_user_id,
        message: `Inventory: ${updated.to_user.name} rejected your transfer of ${t.quantity} ${updated.item.unit} ${updated.item.name} — stock refunded`,
    }).catch(() => {});
    return updated;
}

export async function cancelTransfer(actorId: number, transferId: number) {
    const t = await loadPendingTransferOrThrow(transferId);
    if (t.from_user_id !== actorId) throw forbidden('Only the sender can cancel this transfer');

    const updated = await prisma.$transaction(async (tx) => {
        // Refund the sender
        await upsertHoldingDelta(
            tx,
            t.from_user_id,
            t.item_id,
            t.quantity,
            InventoryLedgerReason.TRANSFER_REFUNDED,
            actorId,
            t.id,
        );
        return tx.inventoryTransfer.update({
            where: { id: t.id },
            data: {
                status: InventoryTransferStatus.CANCELLED,
                resolved_at: new Date(),
                resolved_by_id: actorId,
            },
            include: {
                item: true,
                from_user: { select: { id: true, name: true } },
                to_user: { select: { id: true, name: true } },
            },
        });
    });

    emitToUser(t.from_user_id, 'inventory.transfer.resolved', updated);
    emitToUser(t.to_user_id, 'inventory.transfer.resolved', updated);
    return updated;
}

export async function getTransfer(actorId: number, transferId: number, isManager: boolean) {
    const t = await prisma.inventoryTransfer.findUnique({
        where: { id: transferId },
        include: {
            item: true,
            from_user: { select: { id: true, name: true } },
            to_user: { select: { id: true, name: true } },
            resolved_by: { select: { id: true, name: true } },
        },
    });
    if (!t) throw notFound('Transfer not found');
    if (!isManager && t.from_user_id !== actorId && t.to_user_id !== actorId) {
        throw forbidden('You are not a party to this transfer');
    }
    return t;
}

export async function listMyTransfers(
    userId: number,
    opts: { direction?: 'incoming' | 'outgoing'; status?: InventoryTransferStatus; limit?: number },
) {
    const limit = Math.min(opts.limit && opts.limit > 0 ? opts.limit : 50, 200);
    const where: Prisma.InventoryTransferWhereInput = {
        ...(opts.status ? { status: opts.status } : {}),
    };
    if (opts.direction === 'incoming') where.to_user_id = userId;
    else if (opts.direction === 'outgoing') where.from_user_id = userId;
    else where.OR = [{ from_user_id: userId }, { to_user_id: userId }];

    return prisma.inventoryTransfer.findMany({
        where,
        include: {
            item: true,
            from_user: { select: { id: true, name: true } },
            to_user: { select: { id: true, name: true } },
        },
        orderBy: { initiated_at: 'desc' },
        take: limit,
    });
}
