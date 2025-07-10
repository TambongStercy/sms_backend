// src/api/v1/routes/teacherRoutes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherRole, validateTeacherStudentAccess } from '../middleware/teacherAuth.middleware';
import {
    getMySubjects,
    getMyStudents,
    getMySubClasses,
    getMyDashboard,
    checkMyAccess,
    getMySubjectIds,
    getMySubClassIds,
    getMyAttendance,
    recordStudentAttendance,
    getAttendanceStatistics,
    getSubClassAttendance
} from '../controllers/teacherController';

const router = Router();

// All teacher routes require authentication and teacher role
router.use(authenticate);
router.use(requireTeacherRole);

/**
 * Teacher-specific endpoints
 * These endpoints return data based on the teacher's assignments
 */

// GET /teachers/me/subjects - Get subjects assigned to the authenticated teacher
router.get('/me/subjects', getMySubjects);

// GET /teachers/me/students - Get students from teacher's assigned subclasses
router.get('/me/students', validateTeacherStudentAccess, getMyStudents);

// GET /teachers/me/subclasses - Get subclasses where teacher has assignments
router.get('/me/subclasses', getMySubClasses);

// GET /teachers/me/dashboard - Get teacher dashboard summary
router.get('/me/dashboard', getMyDashboard);

// GET /teachers/me/access-check - Check teacher access to subject/subclass
router.get('/me/access-check', checkMyAccess);

// GET /teachers/me/subject-ids - Get list of subject IDs teacher has access to
router.get('/me/subject-ids', getMySubjectIds);

// GET /teachers/me/subclass-ids - Get list of subclass IDs teacher has access to
router.get('/me/subclass-ids', getMySubClassIds);

// =============================
// TEACHER ATTENDANCE MANAGEMENT ROUTES
// =============================

// GET /teachers/me/attendance - Get my own attendance records
router.get('/me/attendance', getMyAttendance);

// POST /teachers/attendance/record - Record student attendance for my classes
router.post('/attendance/record', recordStudentAttendance);

// GET /teachers/attendance/statistics - Get attendance statistics for my classes  
router.get('/attendance/statistics', getAttendanceStatistics);

// GET /teachers/attendance/subclass/:id - Get attendance records for specific subclass
router.get('/attendance/subclass/:id', getSubClassAttendance);

export default router; 