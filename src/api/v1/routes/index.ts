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
import periodRoutes from './periodRoutes';
import timetableRoutes from './timetableRoutes';
import teacherRoutes from './teacherRoutes';
import enrollmentRoutes from './enrollmentRoutes';
import enhancedDashboardRoutes from './enhancedDashboardRoutes';
import notificationRoutes from './notificationRoutes';
import parentRoutes from './parentRoutes';
import auditTrailRoutes from './auditTrailRoutes';
import teacherAttendanceAnalyticsRoutes from './teacherAttendanceAnalyticsRoutes';
import classProfileAnalyticsRoutes from './classProfileAnalyticsRoutes';
import quizRoutes from './quizRoutes';
import bursarRoutes from './bursarRoutes';
import hodRoutes from './hodRoutes';
import systemRoutes from './systemRoutes';
import principalRoutes from './principalRoutes';
import vicePrincipalRoutes from './vicePrincipalRoutes';
import disciplineMasterRoutes from './disciplineMasterRoutes';
import enhancedMessagingRoutes from './enhancedMessagingRoutes';
import managerRoutes from './managerRoutes';
import express from 'express';
import path from 'path';
import * as disciplineController from '../controllers/disciplineController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import studentAverageRoutes from './studentAverageRoutes';

const router = Router();

// Import attendance routes
import attendanceRoutes from './attendanceRoutes';

// Mount routes with the appropriate base paths
router.use('/auth', authRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/periods', periodRoutes);
router.use('/timetables', timetableRoutes);

// Mount teacher routes at /teachers
router.use('/teachers', teacherRoutes);

// Mount discipline routes at /discipline
router.use('/discipline', disciplineRoutes);

// Mount attendance routes at /attendance
router.use('/attendance', attendanceRoutes);

// Mount enrollment workflow routes at /enrollment
router.use('/enrollment', enrollmentRoutes);

// Mount bursar routes at /bursar
router.use('/bursar', bursarRoutes);

// Mount HOD routes at /hod
router.use('/hod', hodRoutes);

// Mount system administration routes at /system
router.use('/system', systemRoutes);

// Mount principal routes at /principal
router.use('/principal', principalRoutes);

// Mount vice principal routes at /vice-principal
router.use('/vice-principal', vicePrincipalRoutes);

// Mount discipline master routes at /discipline-master
router.use('/discipline-master', disciplineMasterRoutes);

// Mount enhanced messaging routes at /messaging
router.use('/messaging', enhancedMessagingRoutes);

// Mount manager routes at /manager
router.use('/manager', managerRoutes);

// Enhanced dashboard routes at /dashboard
router.use('/dashboard', enhancedDashboardRoutes);

// Exams endpoints are mounted at /exams
router.use('/exams', examRoutes);

// Marks endpoints are mounted at /marks
router.use('/marks', marksRouter);

// Report cards endpoints are mounted at /report-cards
router.use('/report-cards', reportCardsRouter);

// Quiz endpoints are mounted at /quiz
router.use('/quiz', quizRoutes);

// Communication endpoints (announcements & notifications)
router.use('/communications', communicationRoutes);

// Notification endpoints
router.use('/notifications', notificationRoutes);

// Parent portal endpoints
router.use('/parents', parentRoutes);

// Audit trail endpoints
router.use('/audit', auditTrailRoutes);

// Teacher attendance analytics endpoints
router.use('/teacher-attendance', teacherAttendanceAnalyticsRoutes);

// Class profile analytics endpoints
router.use('/class-analytics', classProfileAnalyticsRoutes);

// Mobile endpoints (prefixed with /mobile)
router.use('/mobile', mobileRoutes);

// File upload endpoints
router.use('/uploads', fileRoutes);

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Register routes
router.use('/student-averages', studentAverageRoutes);

export default router;
