// src/api/v1/controllers/studentController.ts
import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import { transformUser } from './userController'; // Assuming transformUser is exported from userController
import { User, ParentStudent } from '@prisma/client'; // Import User and ParentStudent
import { getStudentStatus, getStudentsWithStatus } from '../../../utils/studentStatus'; // Import student status utilities
import { getAcademicYearId } from '../../../utils/academicYear'; // Import academic year utilities

// Define an interface for ParentStudent with the parent relation included
interface ParentStudentWithParent extends ParentStudent {
    parent?: User | null; // Or your specific User type if different
}

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for students using snake_case
        // enrollmentStatus is handled separately, not as a direct Prisma filter here
        const allowedFilters = ['name', 'gender', 'matricule', 'id', 'sub_class_id', 'academic_year_id'];
        // // Add enrollmentStatus as an allowed finalQuery param (though handled specially)
        // const allowedParams = [...allowedFilters, 'sort_by', 'sort_order', 'academic_year_id', 'enrollment_status'];


        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);




        // Extract enrollmentStatus separately
        const enrollment_status_input = req.finalQuery.status as string | undefined; // e.g., 'enrolled', 'not_enrolled', 'all'
        let valid_enrollment_status: 'enrolled' | 'not_enrolled' | 'all' | undefined = 'all';

        if (enrollment_status_input) {
            if (['enrolled', 'not_enrolled', 'all'].includes(enrollment_status_input.toLocaleLowerCase())) {
                valid_enrollment_status = enrollment_status_input.toLocaleLowerCase() as 'enrolled' | 'not_enrolled' | 'all';
            } else {
                // Optionally handle invalid status, e.g., return 400 error or log warning
                console.warn(`Invalid enrollment_status provided: '${enrollment_status_input}'. Defaulting to 'all'.`);
                // Or: return res.status(400).json({ success: false, error: "Invalid enrollmentStatus. Must be one of: enrolled, not_enrolled, all" });
            }
        }


        // Always fetch students with their current enrollment info to handle filters like sub_class_id
        // Get academic year from finalQuery - middleware handles conversion
        const academic_year_id = req.finalQuery.academic_year_id ?
            parseInt(req.finalQuery.academic_year_id as string) : undefined;

        // Call the service function that handles enrollment-based filtering
        const result = await studentService.getAllStudentsWithCurrentEnrollment(
            academic_year_id,
            paginationOptions,
            filterOptions, // Pass the filters extracted (including sub_class_id)
            valid_enrollment_status // Pass the validated enrollment status filter
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        // Use the body directly - middleware handles conversion
        const studentData = req.body;
        const newStudent = await studentService.createStudent(studentData);

        res.status(201).json({
            success: true,
            data: newStudent
        });
    } catch (error: any) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getStudentById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const student = await studentService.getStudentById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error: any) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid student ID format' });
        }

        const studentData = req.body; // Middleware handles case conversion


        // Basic validation: Ensure at least one field is being updated
        if (Object.keys(studentData).length === 0) {
            return res.status(400).json({ success: false, error: 'No data provided for update' });
        }

        const updatedStudent = await studentService.updateStudent(id, studentData);
        res.json({
            success: true,
            data: updatedStudent
        });
    } catch (error: any) {
        console.error('Error updating student:', error);
        if (error.code === 'P2025') { // Prisma error code for record to update not found
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        if (error.message.includes('Invalid gender')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const linkParent = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.id);

        // Use the body directly with student_id - middleware handles conversion
        const linkData = {
            ...req.body,
            student_id: studentId
        };

        const newLink = await studentService.linkParent(studentId, linkData);
        res.status(201).json({
            success: true,
            data: newLink
        });
    } catch (error: any) {
        console.error('Error linking parent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const unlinkParent = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.studentId);
        const parentId = parseInt(req.params.parentId);

        if (isNaN(studentId) || isNaN(parentId)) {
            return res.status(400).json({ success: false, error: 'Invalid Student ID or Parent ID format' });
        }

        await studentService.unlinkParent(studentId, parentId);
        res.json({ success: true, message: 'Parent-student link removed successfully' });
    } catch (error: any) {
        console.error('Error unlinking parent:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getParentsByStudentId = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.studentId);
        if (isNaN(studentId)) {
            return res.status(400).json({ success: false, error: 'Invalid Student ID format' });
        }

        // The service now returns ParentStudentWithParent[] implicitly due to the include
        const parentStudentLinks = await studentService.getParentsByStudentId(studentId) as ParentStudentWithParent[];

        if (!parentStudentLinks || parentStudentLinks.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const parentsData = parentStudentLinks
            .map(link => link.parent ? transformUser(link.parent) : null)
            .filter(p => p !== null);

        res.json({ success: true, data: parentsData });
    } catch (error: any) {
        console.error('Error fetching parents for student:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const enrollStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const studentId = parseInt(req.params.id);
        if (isNaN(studentId)) {
            return res.status(400).json({ success: false, error: 'Invalid Student ID format' });
        }

        // Expect snake_case from middleware
        const { sub_class_id, academic_year_id, photo, repeater } = req.body;

        // Validate and parse sub_class_id
        const parsedSubclassId = parseInt(sub_class_id);
        if (isNaN(parsedSubclassId)) {
            return res.status(400).json({ success: false, error: 'Invalid Subclass ID format' });
        }

        // Validate and parse academic_year_id if present
        let parsedAcademicYearId: number | undefined = undefined;
        if (academic_year_id !== undefined) {
            parsedAcademicYearId = parseInt(academic_year_id);
            if (isNaN(parsedAcademicYearId)) {
                return res.status(400).json({ success: false, error: 'Invalid Academic Year ID format' });
            }
        }

        // Photo is now optional, but if provided, it should be a string or null
        if (photo !== undefined && photo !== null && typeof photo !== 'string') {
            return res.status(400).json({ success: false, error: 'If provided, photo must be a string or null.' });
        }

        // Prepare data for the service
        const enrollmentData = {
            sub_class_id: parsedSubclassId,
            academic_year_id: parsedAcademicYearId, // Pass parsed or undefined
            photo: photo, // Pass photo as received (can be string or null)
            repeater: repeater !== undefined ? Boolean(repeater) : false
        };

        const enrollment = await studentService.enrollStudent(studentId, enrollmentData);
        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error: any) {
        console.error('Error enrolling student:', error);
        // Handle specific errors like P2002 (unique constraint violation)
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: 'Student already enrolled in this sub_class for this academic year.' });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get student status information (new/old/repeater)
 */
export const getStudentStatusInfo = async (req: Request, res: Response): Promise<any> => {
    try {
        const studentId = parseInt(req.params.id);
        if (isNaN(studentId)) {
            return res.status(400).json({ success: false, error: 'Invalid Student ID format' });
        }

        // Get academic year from query params or use current
        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) :
            await getAcademicYearId();

        if (!academic_year_id) {
            return res.status(400).json({ success: false, error: 'Academic year not found' });
        }

        const statusInfo = await getStudentStatus(studentId, academic_year_id);

        res.json({
            success: true,
            data: {
                student_id: studentId,
                academic_year_id,
                ...statusInfo
            }
        });
    } catch (error: any) {
        console.error('Error getting student status:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all students with their status information for a given academic year
 */
export const getStudentsWithStatusInfo = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get academic year from query params or use current
        const academic_year_id = req.query.academic_year_id ?
            parseInt(req.query.academic_year_id as string) :
            await getAcademicYearId();

        if (!academic_year_id) {
            return res.status(400).json({ success: false, error: 'Academic year not found' });
        }

        // Get sub-class filter if provided
        const sub_class_id = req.query.sub_class_id ?
            parseInt(req.query.sub_class_id as string) :
            undefined;

        const studentsWithStatus = await getStudentsWithStatus(academic_year_id, sub_class_id);

        // Group students by status for summary
        const summary = {
            total: studentsWithStatus.length,
            new_students: studentsWithStatus.filter(s => s.statusInfo.status === 'NEW').length,
            old_students: studentsWithStatus.filter(s => s.statusInfo.status === 'OLD').length,
            repeaters: studentsWithStatus.filter(s => s.statusInfo.status === 'REPEATER').length
        };

        res.json({
            success: true,
            data: {
                academic_year_id,
                sub_class_id,
                summary,
                students: studentsWithStatus
            }
        });
    } catch (error: any) {
        console.error('Error getting students with status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};