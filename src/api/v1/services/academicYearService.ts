// src/api/v1/services/academicYearService.ts
import prisma, { AcademicYear, Term } from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

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

export async function getCurrentYear(): Promise<AcademicYear | null> {
    return getCurrentAcademicYear();
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

export async function setAsDefault(id: number): Promise<AcademicYear> {
    // First, set all academic years as non-default
    await prisma.academicYear.updateMany({
        data: {
            is_default: false
        }
    });

    // Then set the specified one as default
    return prisma.academicYear.update({
        where: { id },
        data: {
            is_default: true,
            name: `Academic Year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}` // Add a name for the academic year
        }
    });
}

export async function addTermToYear(
    academicYearId: number,
    data: { name: string; start_date: Date; end_date: Date }
): Promise<Term> {
    return prisma.term.create({
        data: {
            name: data.name,
            number: await getNextTermNumber(),
            start_date: data.start_date,
            end_date: data.end_date,
            academic_year_id: academicYearId
        }
    });
}

async function getNextTermNumber(): Promise<number> {
    const lastTerm = await prisma.term.findFirst({
        orderBy: {
            number: 'desc'
        }
    });

    return lastTerm ? lastTerm.number + 1 : 1;
}
