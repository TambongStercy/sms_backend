import { Request, Response } from 'express';
import prisma from '../../../config/db';

/**
 * Get timetable for a specific sub_class
 */
export const getSubclassTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check for sub_class_id (converted from subClassId by middleware)
        const sub_class_id = req.finalQuery.sub_class_id;

        if (!sub_class_id) {
            res.status(400).json({
                success: false,
                error: 'subClassId is required'
            });
            return;
        }

        const parsedSubclassId = parseInt(sub_class_id as string);
        if (isNaN(parsedSubclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subClassId format'
            });
            return;
        }

        // Verify the sub_class exists
        const sub_class = await prisma.subClass.findUnique({
            where: { id: parsedSubclassId },
            include: { class: true }
        });

        if (!sub_class) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found'
            });
            return;
        }

        // Fetch academic year if needed (using current if not specified)
        let academicYearId = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        if (!academicYearId) {
            // Get current academic year
            const currentYear = await prisma.academicYear.findFirst({
                where: {
                    start_date: { lte: new Date() },
                    end_date: { gte: new Date() }
                },
                orderBy: { start_date: 'desc' }
            });

            if (!currentYear) {
                res.status(404).json({
                    success: false,
                    error: 'No active academic year found'
                });
                return;
            }

            academicYearId = currentYear.id;
        }

        // Get all teacher periods for this sub_class
        const teacherPeriods = await prisma.teacherPeriod.findMany({
            where: {
                sub_class_id: parsedSubclassId,
                academic_year_id: academicYearId
            },
            include: {
                period: true,
                subject_teacher: {
                    include: {
                        subject: true,
                        teacher: true
                    }
                }
            }
        });

        // Transform data to desired format for frontend
        const timetableSlots = teacherPeriods.map(tp => ({
            id: tp.id,
            sub_classId: tp.sub_class_id,
            day: tp.period.day_of_week,
            periodId: tp.period.id,
            period: {
                id: tp.period.id,
                name: tp.period.name,
                startTime: tp.period.start_time,
                endTime: tp.period.end_time,
                isBreak: tp.period.is_break
            },
            subjectId: tp.subject_teacher.subject.id,
            subject: {
                id: tp.subject_teacher.subject.id,
                name: tp.subject_teacher.subject.name,
                category: tp.subject_teacher.subject.category
            },
            teacherId: tp.subject_teacher.teacher.id,
            teacher: {
                id: tp.subject_teacher.teacher.id,
                name: tp.subject_teacher.teacher.name
            }
        }));

        res.json({
            success: true,
            data: {
                sub_class: {
                    id: sub_class.id,
                    name: sub_class.name,
                    class: {
                        id: sub_class.class.id,
                        name: sub_class.class.name
                    }
                },
                academicYearId,
                slots: timetableSlots
            }
        });
    } catch (error: any) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update multiple timetable slots at once for a specific sub_class
 */
export const bulkUpdateTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        // Look for sub_class_id (converted from subClassId by middleware)
        const sub_class_id = req.body.sub_class_id;
        const slots = req.body.slots;

        if (!sub_class_id || !slots || !Array.isArray(slots)) {
            res.status(400).json({
                success: false,
                error: 'subClassId and slots array are required'
            });
            return;
        }

        const parsedSubclassId = parseInt(sub_class_id);
        if (isNaN(parsedSubclassId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid subClassId format'
            });
            return;
        }

        // Verify the sub_class exists
        const sub_class = await prisma.subClass.findUnique({
            where: { id: parsedSubclassId }
        });

        if (!sub_class) {
            res.status(404).json({
                success: false,
                error: 'Subclass not found'
            });
            return;
        }

        // Get current academic year if not specified
        let academicYearId = req.body.academic_year_id;
        if (!academicYearId) {
            const currentYear = await prisma.academicYear.findFirst({
                where: {
                    start_date: { lte: new Date() },
                    end_date: { gte: new Date() }
                },
                orderBy: { start_date: 'desc' }
            });

            if (!currentYear) {
                res.status(404).json({
                    success: false,
                    error: 'No active academic year found'
                });
                return;
            }

            academicYearId = currentYear.id;
        }

        // Prepare response data to track success and errors
        const result = {
            success: true,
            data: {
                updated: 0,
                created: 0,
                deleted: 0,
                errors: [] as { periodId: number; error: string }[] // Removed 'day' from error signature
            }
        };

        // Process each slot in the array
        for (const slot of slots) {
            // Only need period_id, subject_id, teacher_id from the slot
            const { period_id, subject_id, teacher_id } = slot;

            // Validate period_id exists
            if (period_id === undefined || period_id === null) { // Check for undefined or null
                result.data.errors.push({
                    periodId: period_id || 0,
                    error: 'Missing required field: period_id'
                });
                continue;
            }

            const parsedPeriodId = parseInt(period_id);
            if (isNaN(parsedPeriodId)) {
                result.data.errors.push({
                    periodId: period_id,
                    error: 'Invalid period_id format'
                });
                continue;
            }

            try {
                // Find the period using only its ID
                const period = await prisma.period.findUnique({
                    where: {
                        id: parsedPeriodId
                    }
                });

                // Check if period was found
                if (!period) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        error: `Period with ID ${parsedPeriodId} not found`
                    });
                    continue;
                }

                // --- Logic for clearing assignment (subject and teacher are null) ---
                if (subject_id === null && teacher_id === null) {
                    const existingAssignment = await prisma.teacherPeriod.findFirst({
                        where: {
                            sub_class_id: parsedSubclassId,
                            period_id: period.id, // Use the found period's ID
                            academic_year_id: academicYearId
                        }
                    });

                    if (existingAssignment) {
                        await prisma.teacherPeriod.delete({
                            where: { id: existingAssignment.id }
                        });
                        result.data.deleted++;
                    }
                    continue; // Move to the next slot
                }

                // --- Logic for setting/updating assignment (subject and teacher provided) ---

                // Ensure both subject_id and teacher_id are provided if one is
                if ((subject_id === undefined || subject_id === null || !teacher_id) || (teacher_id === undefined || teacher_id === null || !subject_id)) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        error: 'Both subject_id and teacher_id must be provided (or both null to clear)'
                    });
                    continue;
                }

                const parsedSubjectId = parseInt(subject_id);
                const parsedTeacherId = parseInt(teacher_id);

                if (isNaN(parsedSubjectId) || isNaN(parsedTeacherId)) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        error: 'Invalid subject_id or teacher_id format'
                    });
                    continue;
                }

                // Validate the subject-teacher relationship
                const subjectTeacher = await prisma.subjectTeacher.findFirst({
                    where: {
                        subject_id: parsedSubjectId,
                        teacher_id: parsedTeacherId
                    }
                });

                if (!subjectTeacher) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        error: `Teacher ${parsedTeacherId} is not assigned to teach subject ${parsedSubjectId}`
                    });
                    continue;
                }

                // Check for teacher conflicts
                const teacherConflict = await prisma.teacherPeriod.findFirst({
                    where: {
                        subject_teacher: {
                            teacher_id: parsedTeacherId
                        },
                        period_id: period.id, // Use the found period's ID
                        academic_year_id: academicYearId,
                        sub_class_id: { not: parsedSubclassId } // Exclude current sub_class
                    },
                    include: {
                        sub_class: true,
                        period: true // Include period to get its details for the error message
                    }
                });

                if (teacherConflict) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        // Use period.day_of_week from the looked-up period
                        error: `Teacher conflict: already assigned to ${teacherConflict.sub_class.name} on ${teacherConflict.period.day_of_week} during period ${teacherConflict.period.name}`
                    });
                    continue;
                }

                // Find existing assignment for this specific slot
                const existingAssignment = await prisma.teacherPeriod.findFirst({
                    where: {
                        sub_class_id: parsedSubclassId,
                        period_id: period.id, // Use the found period's ID
                        academic_year_id: academicYearId
                    }
                });

                const assignedById = (req as any).user?.id;
                if (!assignedById) {
                    result.data.errors.push({
                        periodId: parsedPeriodId,
                        error: 'User identity not found for assignment'
                    });
                    continue;
                }

                if (existingAssignment) {
                    // Update existing assignment
                    await prisma.teacherPeriod.update({
                        where: { id: existingAssignment.id },
                        data: {
                            subject_teacher_id: subjectTeacher.id,
                            assigned_by_id: assignedById
                        }
                    });
                    result.data.updated++;
                } else {
                    // Create new assignment
                    await prisma.teacherPeriod.create({
                        data: {
                            subject_teacher_id: subjectTeacher.id,
                            sub_class_id: parsedSubclassId,
                            period_id: period.id, // Use the found period's ID
                            academic_year_id: academicYearId,
                            assigned_by_id: assignedById
                        }
                    });
                    result.data.created++;
                }

            } catch (error: any) {
                console.error(`Error processing slot for period ${parsedPeriodId}:`, error);
                result.data.errors.push({
                    periodId: parsedPeriodId,
                    error: error.message
                });
            }
        }

        // Determine final status code based on errors
        if (result.data.errors.length > 0) {
            result.success = false;
            // If all slots failed, maybe return 400? Otherwise, 207 is appropriate.
            // For now, stick with 207 if there were *any* errors.
        }

        res.status(result.success ? 200 : 207).json(result);

    } catch (error: any) {
        console.error('Error updating timetable:', error);
        // Handle potential database connection error
        if (error.code === 'P1001' || error.message.includes('Can\'t reach database server')) {
            return res.status(503).json({
                success: false,
                error: 'Database connection error. Please ensure the database is running and accessible.'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 