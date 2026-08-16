// src/api/v1/routes/parentRoutes.ts
//
// PARENT PORTAL — all endpoints are UNAUTHENTICATED. Access is gated only
// by knowledge of the child's matricule (path param). Do not add authenticate
// / authorize middleware to these routes.
import express from 'express';
import {
    getChildDashboard,
    getChildDetails,
    getChildOverview,
    getChildQuizResults,
    getChildAnalytics,
    listChildReportCards,
    downloadChildReportCard,
    checkChildReportCardAvailability,
    getContacts,
    sendMessageToStaff,
    openStaffDirectMessage,
    getSchoolAnnouncements,
    getParentNotifications,
    getParentUnreadNotificationCount,
    getParentUnreadBreakdown,
    markAllParentNotificationsAsRead,
    markParentNotificationAsRead,
    deleteParentNotification
} from '../controllers/parentController';

const router = express.Router();

// School-wide announcements (no matricule needed).
router.get('/announcements', getSchoolAnnouncements);

// Child dashboard / details / overview by matricule.
router.get('/:matricule/dashboard', getChildDashboard);
router.get('/:matricule/details', getChildDetails);
router.get('/:matricule/overview', getChildOverview);

// Academic data.
router.get('/:matricule/quiz-results', getChildQuizResults);
router.get('/:matricule/analytics', getChildAnalytics);

// Report cards.
router.get('/:matricule/report-cards', listChildReportCards);
router.get('/:matricule/report-card/availability', checkChildReportCardAvailability);
router.get('/:matricule/report-card', downloadChildReportCard);

// Messaging / directory (sender identity is resolved from ParentStudent link).
router.get('/:matricule/contacts', getContacts);
router.post('/:matricule/message-staff', sendMessageToStaff);
router.post('/:matricule/contact/:userId', openStaffDirectMessage);

// Notifications — mirrors /notifications/* but gated by matricule instead of JWT.
// Parent identity is resolved via ParentStudent link on the matricule's student.
router.get('/:matricule/notifications', getParentNotifications);
router.get('/:matricule/notifications/unread-count', getParentUnreadNotificationCount);
router.get('/:matricule/notifications/unread-breakdown', getParentUnreadBreakdown);
router.put('/:matricule/notifications/mark-all-read', markAllParentNotificationsAsRead);
router.put('/:matricule/notifications/:id/read', markParentNotificationAsRead);
router.delete('/:matricule/notifications/:id', deleteParentNotification);

export default router;
