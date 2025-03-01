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

const router = Router();

// Mount routes with the appropriate base paths
router.use('/auth', authRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/subjects', subjectRoutes);

// The discipline routes include endpoints that start with /attendance and /discipline
router.use('/', disciplineRoutes);

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

export default router;
