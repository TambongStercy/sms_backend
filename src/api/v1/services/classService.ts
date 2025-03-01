// src/api/v1/services/classService.ts
import prisma, { Class, Subclass } from '../../../config/db';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export async function getAllClasses(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<Class>> {
    return paginate<Class>(
        prisma.class,
        paginationOptions,
        filterOptions,
        { subclasses: true }
    );
}

// Original function for backwards compatibility
export async function getAllClassesWithSubclasses(): Promise<Class[]> {
    return prisma.class.findMany({
        include: {
            subclasses: true,
        },
    });
}

export async function createClass(data: { name: string }): Promise<Class> {
    return prisma.class.create({
        data,
    });
}

export async function getClassById(id: number): Promise<Class | null> {
    return prisma.class.findUnique({
        where: { id },
        include: { subclasses: true },
    });
}

export async function addSubClass(class_id: number, data: { name: string }): Promise<Subclass> {
    return prisma.subclass.create({
        data: {
            name: data.name,
            class_id,
        },
    });
}

export async function deleteSubClass(subClassId: number): Promise<Subclass> {
    return prisma.subclass.delete({
        where: { id: subClassId },
    });
}
