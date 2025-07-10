import prisma, { AcademicYear, Enrollment } from '../config/db';

/**
 * Gets the current academic year based on is_current flag first, then date logic
 * Finds the academic year where today's date falls between start_date and end_date
 * If none found, returns the most recent academic year
 */
export async function getCurrentAcademicYear(): Promise<AcademicYear | null> {
    // First try to get the academic year marked as current
    const currentByFlag = await prisma.academicYear.findFirst({
        where: { is_current: true }
    });
    
    if (currentByFlag) {
        return currentByFlag;
    }

    const today = new Date();

    // Try to find an academic year where today is between start and end dates
    const currentAcademicYear = await prisma.academicYear.findFirst({
        where: {
            AND: [
                { start_date: { lte: today } },
                { end_date: { gte: today } }
            ]
        }
    });

    // If found, return it
    if (currentAcademicYear) {
        return currentAcademicYear;
    }

    // If not found, return the most recent academic year (by start date)
    return prisma.academicYear.findFirst({
        orderBy: {
            start_date: 'desc'
        }
    });
}

/**
 * Finds a student's enrollment in a specific academic year
 */
export async function getStudentSubclassByStudentAndYear(
    student_id: number,
    academic_year_id?: number
): Promise<Enrollment | null> {
    // If academic year not provided, get current
    if (!academic_year_id) {
        const currentYear = await getCurrentAcademicYear();
        if (!currentYear) return null;
        academic_year_id = currentYear.id;
    }

    return prisma.enrollment.findFirst({
        where: {
            student_id,
            academic_year_id
        }
    });
}

/**
 * Gets all students in a sub_class for a specific academic year
 */
export async function getStudentsBySubclassAndYear(
    sub_class_id: number,
    academic_year_id?: number
): Promise<Enrollment[]> {
    // If academic year not provided, get current
    if (!academic_year_id) {
        const currentYear = await getCurrentAcademicYear();
        if (!currentYear) return [];
        academic_year_id = currentYear.id;
    }

    return prisma.enrollment.findMany({
        where: {
            sub_class_id,
            academic_year_id
        },
        include: {
            student: true
        }
    });
}

/**
 * Helper to get academic year ID (uses current if not provided)
 */
export async function getAcademicYearId(provided_id?: number): Promise<number | null> {
    if (provided_id) return provided_id;

    // First try to get the academic year marked as current
    const currentByFlag = await prisma.academicYear.findFirst({
        where: { is_current: true }
    });

    if (currentByFlag) {
        return currentByFlag.id;
    }

    // Fallback to date-based logic
    const currentYear = await getCurrentAcademicYear();
    return currentYear?.id || null;
} 