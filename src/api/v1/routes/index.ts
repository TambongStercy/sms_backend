import { Router } from 'express';
import authRoutes from './authRoutes';
import academicYearRoutes from './academicYearRoutes';
import userRoutes from './userRoutes';
import classRoutes from './classRoutes';
import studentRoutes from './studentRoutes';
import feeRoutes from './feeRoutes';
import subjectRoutes from './subjectRoutes';
import disciplineRoutes from './disciplineRoutes';
import examRoutes, { marksRouter, reportCardsRouter } from './examRoutes';
import communicationRoutes from './communicationRoutes';
import mobileRoutes from './mobileRoutes';
import fileRoutes from './fileRoutes';
import express from 'express';
import path from 'path';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import studentAverageRoutes from './studentAverageRoutes';

const router = Router();

// Create attendance routes
const attendanceRoutes = Router();
attendanceRoutes.post('/students', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'TEACHER']), disciplineController.recordStudentAttendance);
attendanceRoutes.post('/teachers', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), disciplineController.recordTeacherAttendance);

// Mount routes with the appropriate base paths
router.use('/auth', authRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/subjects', subjectRoutes);

// Mount discipline routes at /discipline
router.use('/discipline', disciplineRoutes);

// Mount attendance routes at /attendance
router.use('/attendance', attendanceRoutes);

// Exams endpoints are mounted at /exams
router.use('/exams', examRoutes);

// Marks endpoints are mounted at /marks
router.use('/marks', marksRouter);

// Report cards endpoints are mounted at /report-cards
router.use('/report-cards', reportCardsRouter);

// Communication endpoints (announcements & notifications)
router.use('/', communicationRoutes);

// Mobile endpoints (prefixed with /mobile)
router.use('/mobile', mobileRoutes);

// File upload endpoints
router.use('/uploads', fileRoutes);

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Register routes
router.use('/student-averages', studentAverageRoutes);

export default router;
