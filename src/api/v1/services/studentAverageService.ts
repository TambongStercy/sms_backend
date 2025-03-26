import prisma, { AverageStatus } from '../../../config/db';

/**
 * Calculate and save student averages for a specific exam sequence
 * @param examSequenceId The ID of the exam sequence
 * @param subclassId Optional subclass ID to filter students
 */
export const calculateAndSaveStudentAverages = async (
    examSequenceId: number,
    subclassId?: number
) => {
    try {
        // Get the exam sequence to verify it exists
        const examSequence = await prisma.examSequence.findUnique({
            where: { id: examSequenceId },
            include: {
                academic_year: true,
                term: true,
            },
        });

        if (!examSequence) {
            throw new Error(`Exam sequence with ID ${examSequenceId} not found`);
        }

        // Get all enrollments for the academic year, optionally filtered by subclass
        const enrollmentQuery: any = {
            academic_year_id: examSequence.academic_year_id,
        };

        if (subclassId) {
            enrollmentQuery.subclass_id = subclassId;
        }

        const enrollments = await prisma.enrollment.findMany({
            where: enrollmentQuery,
            include: {
                student: true,
                subclass: true,
            },
        });

        if (enrollments.length === 0) {
            throw new Error('No enrollments found for the given criteria');
        }

        // For each enrollment, calculate average and save
        const averagePromises = enrollments.map(async (enrollment) => {
            // Get all marks for this enrollment and exam sequence
            const marks = await prisma.mark.findMany({
                where: {
                    enrollment_id: enrollment.id,
                    exam_sequence_id: examSequenceId,
                },
                include: {
                    subclass_subject: true,
                },
            });

            if (marks.length === 0) {
                return null; // Skip if no marks
            }

            // Calculate weighted average
            let totalWeightedScore = 0;
            let totalCoefficient = 0;

            marks.forEach((mark) => {
                totalWeightedScore += mark.score * mark.subclass_subject.coefficient;
                totalCoefficient += mark.subclass_subject.coefficient;
            });

            // If no coefficients, skip
            if (totalCoefficient === 0) {
                return null;
            }

            const average = parseFloat((totalWeightedScore / totalCoefficient).toFixed(2));

            // Check if an average entry already exists
            const existingAverage = await prisma.studentSequenceAverage.findUnique({
                where: {
                    enrollment_id_exam_sequence_id: {
                        enrollment_id: enrollment.id,
                        exam_sequence_id: examSequenceId,
                    },
                },
            });

            if (existingAverage) {
                // Update existing record
                return prisma.studentSequenceAverage.update({
                    where: { id: existingAverage.id },
                    data: {
                        average,
                        status: AverageStatus.CALCULATED,
                    },
                });
            } else {
                // Create new record
                return prisma.studentSequenceAverage.create({
                    data: {
                        enrollment_id: enrollment.id,
                        exam_sequence_id: examSequenceId,
                        average,
                        status: AverageStatus.CALCULATED,
                    },
                });
            }
        });

        // Filter out null results (students with no marks)
        const averageResults = (await Promise.all(averagePromises)).filter(Boolean);

        // Calculate and update rankings
        if (averageResults.length > 0) {
            await updateRankings(examSequenceId, subclassId);
        }

        return averageResults;
    } catch (error) {
        console.error('Error calculating student averages:', error);
        throw error;
    }
};

/**
 * Update rankings for all students in a sequence (optionally filtered by subclass)
 * @param examSequenceId The ID of the exam sequence
 * @param subclassId Optional subclass ID to filter students
 */
export const updateRankings = async (examSequenceId: number, subclassId?: number) => {
    try {
        // Get all enrollments for the subclass (if specified)
        let enrollmentFilter: any = {};

        if (subclassId) {
            // Get all averages for students in this subclass
            const enrollments = await prisma.enrollment.findMany({
                where: { subclass_id: subclassId },
                select: { id: true },
            });

            enrollmentFilter = {
                enrollment_id: { in: enrollments.map(e => e.id) },
            };
        }

        // Get all averages for this exam sequence
        const averages = await prisma.studentSequenceAverage.findMany({
            where: {
                exam_sequence_id: examSequenceId,
                ...enrollmentFilter,
            },
            orderBy: {
                average: 'desc',
            },
            include: {
                enrollment: true,
            },
        });

        // Update rankings
        const totalStudents = averages.length;
        const updatePromises = averages.map((avg, index) => {
            return prisma.studentSequenceAverage.update({
                where: { id: avg.id },
                data: {
                    rank: index + 1, // Ranking starts from 1
                    total_students: totalStudents,
                    status: AverageStatus.VERIFIED,
                },
            });
        });

        return Promise.all(updatePromises);
    } catch (error) {
        console.error('Error updating rankings:', error);
        throw error;
    }
};

/**
 * Get student average by enrollment ID and exam sequence ID
 */
export const getStudentAverage = async (enrollmentId: number, examSequenceId: number) => {
    return prisma.studentSequenceAverage.findUnique({
        where: {
            enrollment_id_exam_sequence_id: {
                enrollment_id: enrollmentId,
                exam_sequence_id: examSequenceId,
            },
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    subclass: {
                        include: {
                            class: true,
                        },
                    },
                },
            },
            exam_sequence: {
                include: {
                    term: true,
                    academic_year: true,
                },
            },
        },
    });
};

/**
 * Get all student averages for a specific exam sequence
 * @param examSequenceId The ID of the exam sequence
 * @param subclassId Optional subclass ID to filter students
 */
export const getStudentAverages = async (examSequenceId: number, subclassId?: number) => {
    let whereClause: any = {
        exam_sequence_id: examSequenceId,
    };

    if (subclassId) {
        // Get enrollments for this subclass
        const enrollments = await prisma.enrollment.findMany({
            where: { subclass_id: subclassId },
            select: { id: true },
        });

        whereClause.enrollment_id = {
            in: enrollments.map(e => e.id),
        };
    }

    return prisma.studentSequenceAverage.findMany({
        where: whereClause,
        orderBy: {
            rank: 'asc',
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    subclass: {
                        include: {
                            class: true,
                        },
                    },
                },
            },
            exam_sequence: {
                include: {
                    term: true,
                    academic_year: true,
                },
            },
        },
    });
};

/**
 * Update decision for a student average
 */
export const updateDecision = async (id: number, decision: string) => {
    return prisma.studentSequenceAverage.update({
        where: { id },
        data: { decision },
    });
}; 