// src/api/v1/services/taskService.ts
//
// Tasks that a senior staff member delegates to a specific user.
// Creating a task automatically fires a MobileNotification (TASK_ASSIGNED)
// to the assignee. Progress updates emit TASK_UPDATE notifications to the
// task's creator.

import prisma, { Prisma, Task, TaskPriority, TaskStatus } from '../../../config/db';
import * as notificationService from './notificationService';

function notifyAsync(fn: () => Promise<unknown>) {
    fn().catch((err) => console.error('Notification emit failed:', err));
}

const taskInclude = {
    assigned_to: { select: { id: true, name: true, matricule: true, email: true } },
    assigned_by: { select: { id: true, name: true, matricule: true, email: true } },
} satisfies Prisma.TaskInclude;

export interface CreateTaskInput {
    title: string;
    description: string;
    assigned_to_id: number;
    priority?: TaskPriority;
    category?: string;
    deadline?: string; // ISO string
    notes?: string;
}

export async function createTask(input: CreateTaskInput, caller: { id: number }) {
    if (!input.title?.trim()) throw new Error('title is required');
    if (!input.description?.trim()) throw new Error('description is required');
    if (!Number.isInteger(input.assigned_to_id) || input.assigned_to_id <= 0) {
        throw new Error('assignedToId is required');
    }

    const assignee = await prisma.user.findUnique({ where: { id: input.assigned_to_id } });
    if (!assignee) throw new Error('Assignee not found');

    const task = await prisma.task.create({
        data: {
            title: input.title.trim(),
            description: input.description.trim(),
            priority: input.priority ?? 'MEDIUM',
            category: input.category?.trim() || 'GENERAL',
            deadline: input.deadline ? new Date(input.deadline) : null,
            assigned_to_id: input.assigned_to_id,
            assigned_by_id: caller.id,
            notes: input.notes?.trim() || null,
        },
        include: taskInclude,
    });

    notifyAsync(() =>
        notificationService.sendNotification({
            user_id: input.assigned_to_id,
            sender_id: caller.id,
            title: `New task assigned: ${task.title}`,
            message: task.description,
            category: 'TASK_ASSIGNED',
            entity_type: 'Task',
            entity_id: task.id,
            action_url: `/tasks/${task.id}`,
        })
    );

    return task;
}

export interface ListTasksFilter {
    assigned_to_id?: number;
    assigned_by_id?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
}

export async function listTasks(filter: ListTasksFilter) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));

    const where: Prisma.TaskWhereInput = {
        ...(filter.assigned_to_id ? { assigned_to_id: filter.assigned_to_id } : {}),
        ...(filter.assigned_by_id ? { assigned_by_id: filter.assigned_by_id } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.priority ? { priority: filter.priority } : {}),
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.overdue
            ? {
                  deadline: { lt: new Date() },
                  status: { notIn: ['COMPLETED', 'CANCELLED'] },
              }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.task.findMany({
            where,
            include: taskInclude,
            orderBy: [{ status: 'asc' }, { deadline: 'asc' }, { created_at: 'desc' }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.task.count({ where }),
    ]);
    return { items, page, limit, total, total_pages: Math.ceil(total / limit) };
}

export async function getTask(id: number): Promise<Task> {
    const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new Error('Task not found');
    return task as unknown as Task;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: string;
    progress?: number;
    deadline?: string | null;
    notes?: string | null;
}

/** Assignee updates status/progress; creator can update any field. */
export async function updateTask(
    id: number,
    patch: UpdateTaskInput,
    caller: { id: number; roles: string[] }
) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    const isCreator = task.assigned_by_id === caller.id;
    const isAssignee = task.assigned_to_id === caller.id;
    const isSenior = caller.roles.some((r) => ['SUPER_MANAGER', 'PRINCIPAL'].includes(r));
    if (!isCreator && !isAssignee && !isSenior) {
        throw new Error('Forbidden: only the assignee, the creator, or a senior may update this task');
    }

    // Assignees are limited to status/progress/notes updates
    if (isAssignee && !isCreator && !isSenior) {
        const allowed: (keyof UpdateTaskInput)[] = ['status', 'progress', 'notes'];
        for (const key of Object.keys(patch)) {
            if (!allowed.includes(key as keyof UpdateTaskInput)) {
                throw new Error(`Forbidden: assignees may only update ${allowed.join(', ')}`);
            }
        }
    }

    if (patch.progress != null && (patch.progress < 0 || patch.progress > 100)) {
        throw new Error('progress must be between 0 and 100');
    }

    const data: Prisma.TaskUpdateInput = {
        ...(patch.title !== undefined && { title: patch.title.trim() }),
        ...(patch.description !== undefined && { description: patch.description.trim() }),
        ...(patch.priority !== undefined && { priority: patch.priority }),
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.category !== undefined && { category: patch.category.trim() }),
        ...(patch.progress !== undefined && { progress: patch.progress }),
        ...(patch.deadline !== undefined && {
            deadline: patch.deadline ? new Date(patch.deadline) : null,
        }),
        ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
    };

    if (patch.status === 'COMPLETED' && task.status !== 'COMPLETED') {
        data.completed_at = new Date();
        data.progress = 100;
    } else if (patch.status && patch.status !== 'COMPLETED') {
        data.completed_at = null;
    }

    const updated = await prisma.task.update({ where: { id }, data, include: taskInclude });

    // Notify the creator when the assignee changes status/progress
    const statusChanged = patch.status && patch.status !== task.status;
    const progressChanged = patch.progress != null && patch.progress !== task.progress;
    if ((statusChanged || progressChanged) && caller.id !== task.assigned_by_id) {
        notifyAsync(() =>
            notificationService.sendNotification({
                user_id: task.assigned_by_id,
                sender_id: caller.id,
                title: `Task update: ${updated.title}`,
                message: statusChanged
                    ? `Status changed to ${updated.status}`
                    : `Progress: ${updated.progress}%`,
                category: 'TASK_UPDATE',
                entity_type: 'Task',
                entity_id: updated.id,
                action_url: `/tasks/${updated.id}`,
            })
        );
    }
    return updated;
}

export async function deleteTask(id: number, caller: { id: number; roles: string[] }) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');
    const isCreator = task.assigned_by_id === caller.id;
    const isSenior = caller.roles.some((r) => ['SUPER_MANAGER', 'PRINCIPAL'].includes(r));
    if (!isCreator && !isSenior) {
        throw new Error('Forbidden: only the task creator or a senior may delete this task');
    }
    await prisma.task.delete({ where: { id } });
    return { id, deleted: true };
}

/** Small counter for dashboard badge — tasks assigned to a user still open. */
export async function getTaskCountersForUser(userId: number) {
    const [pending, inProgress, overdue] = await Promise.all([
        prisma.task.count({ where: { assigned_to_id: userId, status: 'PENDING' } }),
        prisma.task.count({ where: { assigned_to_id: userId, status: 'IN_PROGRESS' } }),
        prisma.task.count({
            where: {
                assigned_to_id: userId,
                status: { notIn: ['COMPLETED', 'CANCELLED'] },
                deadline: { lt: new Date() },
            },
        }),
    ]);
    return { pending, in_progress: inProgress, overdue };
}
