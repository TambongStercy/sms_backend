import { Request, Response, NextFunction } from 'express';
import { hasTeacherAccess, getTeacherSubClassIds, getTeacherSubjectIds } from '../services/teacherService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        userId: number;
    };
    teacherSubClassIds?: number[];
    teacherSubjectIds?: number[];
}

/**
 * Middleware to validate that a teacher has access to a specific subject/subclass
 * Use this middleware on routes that require subject or subclass specific access
 */
export const validateTeacherSubjectAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const teacherId = req.user?.id;
        if (!teacherId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Get subject and subclass from query params or body
        const subjectId = req.query.subjectId || req.body.subjectId || req.query.subject_id || req.body.subject_id;
        const subClassId = req.query.subClassId || req.body.subClassId || req.query.sub_class_id || req.body.sub_class_id;
        const academicYearId = req.query.academicYearId || req.body.academicYearId || req.query.academic_year_id || req.body.academic_year_id;

        // Parse IDs to numbers if they exist
        const parsedSubjectId = subjectId ? parseInt(subjectId as string) : undefined;
        const parsedSubClassId = subClassId ? parseInt(subClassId as string) : undefined;
        const parsedAcademicYearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        // Check if teacher has access to this subject/subclass combination
        if (parsedSubjectId || parsedSubClassId) {
            const hasAccess = await hasTeacherAccess(
                teacherId,
                parsedSubjectId,
                parsedSubClassId,
                parsedAcademicYearId
            );

            if (!hasAccess) {
                res.status(403).json({
                    success: false,
                    error: 'Access denied: You are not assigned to teach this subject in this class'
                });
                return;
            }
        }

        next();
    } catch (error: any) {
        console.error('Teacher access validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate teacher access'
        });
    }
};

/**
 * Middleware to ensure student access is limited to teacher's assigned subclasses
 * Use this on student-related endpoints for teachers
 */
export const validateTeacherStudentAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const teacherId = req.user?.id;
        if (!teacherId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Get student ID from params (if present)
        const studentId = req.params.id || req.params.studentId;
        const academicYearId = req.query.academicYearId || req.query.academic_year_id;
        const parsedAcademicYearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        if (studentId) {
            // Check if this student is in any of the teacher's assigned subclasses
            const teacherSubClassIds = await getTeacherSubClassIds(teacherId, parsedAcademicYearId);

            if (teacherSubClassIds.length === 0) {
                res.status(403).json({
                    success: false,
                    error: 'Access denied: You have no assigned classes'
                });
                return;
            }

            // Check if student is enrolled in any of teacher's subclasses
            const prisma = require('../../../config/db').default;
            const studentEnrollment = await prisma.enrollment.findFirst({
                where: {
                    student_id: parseInt(studentId),
                    sub_class_id: { in: teacherSubClassIds },
                    ...(parsedAcademicYearId && { academic_year_id: parsedAcademicYearId })
                }
            });

            if (!studentEnrollment) {
                res.status(403).json({
                    success: false,
                    error: 'Access denied: This student is not in your assigned classes'
                });
                return;
            }
        }

        // Add teacher's accessible subclass IDs to request for further filtering
        req.teacherSubClassIds = await getTeacherSubClassIds(teacherId, parsedAcademicYearId);
        req.teacherSubjectIds = await getTeacherSubjectIds(teacherId, parsedAcademicYearId);

        next();
    } catch (error: any) {
        console.error('Teacher student access validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate teacher student access'
        });
    }
};

/**
 * Middleware to validate marks entry access
 * Ensures teacher can only enter marks for subjects they teach in assigned subclasses
 */
export const validateTeacherMarksAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const teacherId = req.user?.id;
        if (!teacherId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Get marks data from body or query
        const subjectId = req.body.subjectId || req.body.subject_id || req.query.subjectId || req.query.subject_id;
        const subClassId = req.body.subClassId || req.body.sub_class_id || req.query.subClassId || req.query.sub_class_id;
        const subClassSubjectId = req.body.subClassSubjectId || req.body.sub_class_subject_id;

        // If we have subClassSubjectId, we need to verify it belongs to teacher
        if (subClassSubjectId) {
            const prisma = require('../../../config/db').default;
            const subClassSubject = await prisma.subClassSubject.findUnique({
                where: { id: parseInt(subClassSubjectId) },
                include: { subject: true, sub_class: true }
            });

            if (!subClassSubject) {
                res.status(404).json({
                    success: false,
                    error: 'Subject-class combination not found'
                });
                return;
            }

            const hasAccess = await hasTeacherAccess(
                teacherId,
                subClassSubject.subject_id,
                subClassSubject.sub_class_id
            );

            if (!hasAccess) {
                res.status(403).json({
                    success: false,
                    error: 'Access denied: You are not assigned to teach this subject in this class'
                });
                return;
            }
        } else if (subjectId && subClassId) {
            // Direct subject and subclass validation
            const hasAccess = await hasTeacherAccess(
                teacherId,
                parseInt(subjectId),
                parseInt(subClassId)
            );

            if (!hasAccess) {
                res.status(403).json({
                    success: false,
                    error: 'Access denied: You are not assigned to teach this subject in this class'
                });
                return;
            }
        }

        next();
    } catch (error: any) {
        console.error('Teacher marks access validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate teacher marks access'
        });
    }
};

/**
 * Middleware to check if user has TEACHER role
 * Use this as a prerequisite for teacher-specific routes
 */
export const requireTeacherRole = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Check if user has TEACHER role
        const prisma = require('../../../config/db').default;
        const teacherRole = await prisma.userRole.findFirst({
            where: {
                user_id: userId,
                role: 'TEACHER'
            }
        });

        if (!teacherRole) {
            res.status(403).json({
                success: false,
                error: 'Access denied: Teacher role required'
            });
            return;
        }

        next();
    } catch (error: any) {
        console.error('Teacher role validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate teacher role'
        });
    }
};

// Extend Request interface to include teacher data
declare global {
    namespace Express {
        interface Request {
            teacherSubClassIds?: number[];
            teacherSubjectIds?: number[];
        }
    }
} 