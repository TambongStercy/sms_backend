// src/api/v1/services/academicYearService.ts
import prisma, { AcademicYear, Term } from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

export async function getAllAcademicYears(): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({
        include: {
            terms: true
        }
    });
}

export async function createAcademicYear(data: {
    start_date: string;
    end_date: string,
    name: string;
    terms?: {
        name: string;
        start_date: string;
        end_date: string;
        fee_deadline?: string;
    }[]
}): Promise<AcademicYear> {
    const { terms, ...academicYearData } = data;

    return prisma.academicYear.create({
        data: {
            start_date: new Date(academicYearData.start_date),
            end_date: new Date(academicYearData.end_date),
            name: academicYearData.name,
            ...(terms && terms.length > 0 && {
                terms: {
                    create: terms.map(term => ({
                        name: term.name,
                        start_date: new Date(term.start_date),
                        end_date: new Date(term.end_date),
                        fee_deadline: term.fee_deadline ? new Date(term.fee_deadline) : null
                    }))
                }
            })
        },
        include: {
            terms: true
        }
    });
}

export async function getAcademicYearById(id: number): Promise<AcademicYear | null> {
    return prisma.academicYear.findUnique({
        where: { id },
        include: {
            terms: true
        }
    });
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
        include: {
            terms: true
        }
    });
}

export async function deleteAcademicYear(id: number): Promise<AcademicYear> {
    return prisma.academicYear.delete({
        where: { id },
        include: {
            terms: true
        }
    });
}

export async function addTermToYear(
    academicYearId: number,
    data: { name: string; start_date: Date; end_date: Date; fee_deadline?: Date }
): Promise<Term> {
    return prisma.term.create({
        data: {
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
            fee_deadline: data.fee_deadline || null,
            academic_year_id: academicYearId
        }
    });
}

export async function getTermsByAcademicYearId(academicYearId: number): Promise<Term[]> {
    return prisma.term.findMany({
        where: {
            academic_year_id: academicYearId
        },
        orderBy: {
            start_date: 'asc'
        }
    });
}
