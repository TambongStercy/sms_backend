// src/api/v1/services/academicYearService.ts
import prisma, { AcademicYear, Term } from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

export async function getAllAcademicYears(): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({
        include: {
            terms: true,
            exam_sequences: true,
        }
    });
}

export async function createAcademicYear(data: {
    start_date: string;
    end_date: string,
    name: string;
    terms?: {
        name: string;
        start_date?: string;
        end_date?: string;
        fee_deadline?: string;
    }[]
}): Promise<AcademicYear> {
    const { terms, ...academicYearData } = data;

    // Create default terms if none provided
    const termsToCreate = terms && terms.length > 0 ? terms : [
        { name: 'Term 1' },
        { name: 'Term 2' },
        { name: 'Term 3' }
    ];

    return prisma.academicYear.create({
        data: {
            start_date: new Date(academicYearData.start_date),
            end_date: new Date(academicYearData.end_date),
            name: academicYearData.name,
            terms: {
                create: termsToCreate.map(term => ({
                    name: term.name,
                    start_date: term.start_date ? new Date(term.start_date) : null,
                    end_date: term.end_date ? new Date(term.end_date) : null,
                    fee_deadline: term.fee_deadline ? new Date(term.fee_deadline) : null
                }))
            }
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
    // Check for dependent records before deletion
    const dependencies = await Promise.all([
        prisma.enrollment.count({ where: { academic_year_id: id } }),
        prisma.examPaper.count({ where: { academic_year_id: id } }),
        prisma.examSequence.count({ where: { academic_year_id: id } }),
        prisma.generatedReport.count({ where: { academic_year_id: id } }),
        prisma.paymentTransaction.count({ where: { academic_year_id: id } }),
        prisma.schoolFees.count({ where: { academic_year_id: id } }),
        prisma.teacherPeriod.count({ where: { academic_year_id: id } }),
        prisma.userRole.count({ where: { academic_year_id: id } }),
        prisma.student.count({ where: { first_enrollment_year_id: id } }),
        prisma.term.count({ where: { academic_year_id: id } }),
        prisma.roleAssignment.count({ where: { academic_year_id: id } }),
        prisma.announcement.count({ where: { academic_year_id: id } })
    ]);

    const [
        enrollmentCount,
        examPaperCount,
        examSequenceCount,
        generatedReportCount,
        paymentTransactionCount,
        schoolFeesCount,
        teacherPeriodCount,
        userRoleCount,
        studentCount,
        termCount,
        roleAssignmentCount,
        announcementCount
    ] = dependencies;

    // Check if any dependencies exist
    if (
        enrollmentCount > 0 ||
        examPaperCount > 0 ||
        examSequenceCount > 0 ||
        generatedReportCount > 0 ||
        paymentTransactionCount > 0 ||
        schoolFeesCount > 0 ||
        teacherPeriodCount > 0 ||
        userRoleCount > 0 ||
        studentCount > 0 ||
        termCount > 0 ||
        roleAssignmentCount > 0 ||
        announcementCount > 0
    ) {
        const dependencyDetails = [];
        if (enrollmentCount > 0) dependencyDetails.push(`${enrollmentCount} enrollment(s)`);
        if (examPaperCount > 0) dependencyDetails.push(`${examPaperCount} exam paper(s)`);
        if (examSequenceCount > 0) dependencyDetails.push(`${examSequenceCount} exam sequence(s)`);
        if (generatedReportCount > 0) dependencyDetails.push(`${generatedReportCount} generated report(s)`);
        if (paymentTransactionCount > 0) dependencyDetails.push(`${paymentTransactionCount} payment transaction(s)`);
        if (schoolFeesCount > 0) dependencyDetails.push(`${schoolFeesCount} school fee(s)`);
        if (teacherPeriodCount > 0) dependencyDetails.push(`${teacherPeriodCount} teacher period(s)`);
        if (userRoleCount > 0) dependencyDetails.push(`${userRoleCount} user role(s)`);
        if (studentCount > 0) dependencyDetails.push(`${studentCount} student(s) with first enrollment`);
        if (termCount > 0) dependencyDetails.push(`${termCount} term(s)`);
        if (roleAssignmentCount > 0) dependencyDetails.push(`${roleAssignmentCount} role assignment(s)`);
        if (announcementCount > 0) dependencyDetails.push(`${announcementCount} announcement(s)`);

        throw new Error(`Cannot delete academic year. It is referenced by: ${dependencyDetails.join(', ')}`);
    }

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
        include: {
            exam_sequences: true
        },
        orderBy: {
            start_date: 'asc'
        }
    });
}

export async function setCurrentAcademicYear(id: number): Promise<AcademicYear> {
    // First, set all academic years to not current
    await prisma.academicYear.updateMany({
        data: {
            is_current: false
        }
    });

    // Then set the specified academic year as current
    return prisma.academicYear.update({
        where: { id },
        data: {
            is_current: true
        },
        include: {
            terms: true
        }
    });
}
