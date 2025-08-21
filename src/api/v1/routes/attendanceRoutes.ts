import { Router } from 'express';
import {
    getStudentAttendance,
    recordStudentAttendance,
    updateStudentAttendance,
    getStudentAttendanceSummary,
    getTeacherAttendance,
    recordTeacherAttendance,
    getTeacherAttendanceSummary
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Student Attendance Routes
router.get('/students', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER', 'PARENT']), getStudentAttendance);
router.post('/students', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), recordStudentAttendance);
router.put('/students/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), updateStudentAttendance);
router.get('/students/summary', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER', 'PARENT']), getStudentAttendanceSummary);

// Teacher Attendance Routes
router.get('/teachers', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), getTeacherAttendance);
router.post('/teachers', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER']), recordTeacherAttendance);
router.get('/teachers/summary', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), getTeacherAttendanceSummary);

export default router; 