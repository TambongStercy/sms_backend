// src/api/v1/routes/teacherRoutes.ts

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
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
    getSubClassAttendance,
    getMyCurrentAndNextSubjects,
    getMyTimetable,
    exportMyTimetablePdf
} from '../controllers/teacherController';
import {
    getMyCurrentPeriod,
    getMyRollCallForPeriod,
    submitMyRollCall,
    listMyRollCalls,
} from '../controllers/teacherRollCallController';

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

// GET /teachers/me/timetable/current-next - Get current and next subjects from timetable
router.get('/me/timetable/current-next', getMyCurrentAndNextSubjects);

// Route for a teacher to get their own timetable
router.get('/me/timetable', authenticate, authorize(['TEACHER']), getMyTimetable);

// GET /teachers/me/timetable/export/pdf - Download own timetable as PDF
router.get('/me/timetable/export/pdf', authenticate, authorize(['TEACHER']), exportMyTimetablePdf);

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

// =============================
// PER-PERIOD ROLL CALL (auto-detected from timetable)
// =============================

// GET /teachers/me/current-period
//   Returns the TeacherPeriod the caller is currently teaching (server local
//   time vs Period.start_time/end_time), the class roster, and today's roll
//   call state (or nulls if not currently in a class).
router.get('/me/current-period', getMyCurrentPeriod);

// GET /teachers/me/teacher-periods/:id/roll-call?date=YYYY-MM-DD
//   Roster + roll call view for one of the caller's periods on the given date.
router.get('/me/teacher-periods/:id/roll-call', getMyRollCallForPeriod);

// POST /teachers/me/roll-call
//   Body: { teacher_period_id, date?, notes?, entries: [{ enrollment_id, status: PRESENT|LATE|ABSENT, notes? }] }
router.post('/me/roll-call', submitMyRollCall);

// GET /teachers/me/roll-calls?from=&to=&limit=
router.get('/me/roll-calls', listMyRollCalls);

export default router;