// src/api/v1/services/academicYearService.ts
import prisma, { AcademicYear } from '../../../config/db';


export async function getAllAcademicYears(): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany();
}

export async function createAcademicYear(data: { start_date: string; end_date: string }): Promise<AcademicYear> {
    return prisma.academicYear.create({
        data: {
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
        },
    });
}

export async function getAcademicYearById(id: number): Promise<AcademicYear | null> {
    return prisma.academicYear.findUnique({ where: { id } });
}

export async function updateAcademicYear(
    id: number,
    data: { start_date?: string; end_date?: string }
): Promise<AcademicYear> {
    return prisma.academicYear.update({
        where: { id },
        data: {
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            end_date: data.end_date ? new Date(data.end_date) : undefined,
        },
    });
}

export async function deleteAcademicYear(id: number): Promise<AcademicYear> {
    return prisma.academicYear.delete({ where: { id } });
}
