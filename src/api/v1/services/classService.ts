// src/api/v1/services/classService.ts
import prisma, { Class, SubClass } from '../../../config/db';

export async function getAllClasses(): Promise<Class[]> {
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

export async function addSubClass(class_id: number, data: { name: string }): Promise<SubClass> {
    return prisma.subClass.create({
        data: {
            name: data.name,
            class_id,
        },
    });
}

export async function deleteSubClass(subClassId: number): Promise<SubClass> {
    return prisma.subClass.delete({
        where: { id: subClassId },
    });
}
