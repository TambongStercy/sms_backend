import { Request, Response } from 'express';
import * as enrollmentService from '../services/enrollmentService';

/**
 * STEP 1: Bursar registers student into a class
 * POST /enrollment/register
 */
export const registerStudentToClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name,
            date_of_birth,
            place_of_birth,
            gender,
            residence,
            former_school,
            class_id,
            academic_year_id,
            is_new_student
        } = req.body;

        // Validate required fields
        if (!name || !date_of_birth || !place_of_birth || !gender || !residence || !class_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: name, date_of_birth, place_of_birth, gender, residence, class_id'
            });
            return;
        }

        const result = await enrollmentService.registerStudentToClass({
            name,
            date_of_birth,
            place_of_birth,
            gender,
            residence,
            former_school,
            class_id: parseInt(class_id),
            academic_year_id: academic_year_id ? parseInt(academic_year_id) : undefined,
            is_new_student: is_new_student ?? true
        });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully. Awaiting VP interview.',
            data: result
        });
    } catch (error: any) {
        console.error('Error registering student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * STEP 2: VP records interview marks
 * POST /enrollment/interview
 */
export const recordInterviewMark = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            student_id,
            score,
            comments,
            academic_year_id
        } = req.body;

        // Get interviewer ID from authenticated user
        const interviewer_id = req.user?.id;

        if (!student_id || score === undefined || !interviewer_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: student_id, score. Interviewer must be authenticated.'
            });
            return;
        }

        const result = await enrollmentService.recordInterviewMark({
            student_id: parseInt(student_id),
            interviewer_id,
            score: parseFloat(score),
            comments,
            academic_year_id: academic_year_id ? parseInt(academic_year_id) : undefined
        });

        res.status(201).json({
            success: true,
            message: 'Interview mark recorded successfully. Student ready for subclass assignment.',
            data: result
        });
    } catch (error: any) {
        console.error('Error recording interview mark:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * STEP 3: VP assigns student to subclass
 * POST /enrollment/assign-subclass
 */
export const assignStudentToSubclass = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            student_id,
            sub_class_id,
            academic_year_id
        } = req.body;

        // Get assigned_by_id from authenticated user
        const assigned_by_id = req.user?.id;

        if (!student_id || !sub_class_id || !assigned_by_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: student_id, sub_class_id. User must be authenticated.'
            });
            return;
        }

        const result = await enrollmentService.assignStudentToSubclass({
            student_id: parseInt(student_id),
            sub_class_id: parseInt(sub_class_id),
            academic_year_id: academic_year_id ? parseInt(academic_year_id) : undefined,
            assigned_by_id
        });

        res.status(200).json({
            success: true,
            message: 'Student successfully assigned to subclass. Enrollment complete.',
            data: result
        });
    } catch (error: any) {
        console.error('Error assigning student to subclass:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * VP Dashboard: Get all students awaiting subclass assignment
 * GET /enrollment/unassigned
 */
export const getUnassignedStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academic_year_id } = req.query;

        const students = await enrollmentService.getUnassignedStudents(
            academic_year_id ? parseInt(academic_year_id as string) : undefined
        );

        res.status(200).json({
            success: true,
            message: 'Unassigned students retrieved successfully',
            data: students,
            count: students.length
        });
    } catch (error: any) {
        console.error('Error fetching unassigned students:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get available subclasses for a specific class
 * GET /enrollment/available-subclasses/:classId
 */
export const getAvailableSubclasses = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId } = req.params;
        const { academic_year_id } = req.query;

        if (!classId || isNaN(parseInt(classId))) {
            res.status(400).json({
                success: false,
                error: 'Valid class ID is required'
            });
            return;
        }

        const subclasses = await enrollmentService.getAvailableSubclasses(
            parseInt(classId),
            academic_year_id ? parseInt(academic_year_id as string) : undefined
        );

        res.status(200).json({
            success: true,
            message: 'Available subclasses retrieved successfully',
            data: subclasses
        });
    } catch (error: any) {
        console.error('Error fetching available subclasses:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get enrollment workflow statistics
 * GET /enrollment/stats
 */
export const getEnrollmentStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { academic_year_id } = req.query;

        const stats = await enrollmentService.getEnrollmentStats(
            academic_year_id ? parseInt(academic_year_id as string) : undefined
        );

        res.status(200).json({
            success: true,
            message: 'Enrollment statistics retrieved successfully',
            data: stats
        });
    } catch (error: any) {
        console.error('Error fetching enrollment stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get enrollment workflow status for a specific student
 * GET /enrollment/status/:studentId
 */
export const getStudentEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        // Handle both parameter names: :studentId and :id
        const studentId = req.params.studentId || req.params.id;
        const { academic_year_id } = req.query;

        if (!studentId || isNaN(parseInt(studentId))) {
            res.status(400).json({
                success: false,
                error: 'Valid student ID is required'
            });
            return;
        }

        // Get student with enrollment and interview info
        const student = await enrollmentService.getStudentEnrollmentStatus(
            parseInt(studentId),
            academic_year_id ? parseInt(academic_year_id as string) : undefined
        );

        if (!student) {
            res.status(404).json({
                success: false,
                error: 'Student not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Student enrollment status retrieved successfully',
            data: student
        });
    } catch (error: any) {
        console.error('Error fetching student enrollment status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 