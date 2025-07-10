// src/api/v1/routes/parentRoutes.ts
import express from 'express';
import {
    getParentDashboard,
    getChildDetails,
    sendMessageToStaff,
    getChildrenQuizResults,
    getSchoolAnnouncements,
    getChildQuizResults,
    getChildAnalytics
} from '../controllers/parentController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Parent dashboard
router.get('/dashboard',
    authenticate,
    authorize(['PARENT']),
    getParentDashboard
);

// Get detailed information about a specific child
router.get('/children/:studentId',
    authenticate,
    authorize(['PARENT']),
    getChildDetails
);

// Send message to school staff
router.post('/message-staff',
    authenticate,
    authorize(['PARENT']),
    sendMessageToStaff
);

// GET /parents/children/:studentId/quiz-results - Get quiz results for a specific child
router.get('/children/:studentId/quiz-results',
    authenticate,
    authorize(['PARENT']),
    getChildQuizResults
);

// GET /parents/children/:studentId/analytics - Get comprehensive analytics for a child
router.get('/children/:studentId/analytics',
    authenticate,
    authorize(['PARENT']),
    getChildAnalytics
);

// Get quiz results for all children
router.get('/children/quiz-results',
    authenticate,
    authorize(['PARENT']),
    getChildrenQuizResults
);

// Get school announcements
router.get('/announcements',
    authenticate,
    authorize(['PARENT']),
    getSchoolAnnouncements
);

export default router; 