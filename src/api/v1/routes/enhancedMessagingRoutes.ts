import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import * as enhancedMessagingController from '../controllers/enhancedMessagingController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/messaging/dashboard
 * @desc Get enhanced messaging dashboard with activity overview
 * @access Private (All authenticated users)
 */
router.get('/dashboard',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getMessagingDashboard
);

/**
 * @route GET /api/v1/messaging/threads
 * @desc Get message threads with filtering and pagination
 * @access Private (All authenticated users)
 */
router.get('/threads',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getMessageThreads
);

/**
 * @route POST /api/v1/messaging/threads
 * @desc Create a new message thread
 * @access Private (All authenticated users)
 */
router.post('/threads',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.createMessageThread
);

/**
 * @route GET /api/v1/messaging/threads/:threadId/messages
 * @desc Get messages in a specific thread
 * @access Private (All authenticated users)
 */
router.get('/threads/:threadId/messages',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getThreadMessages
);

/**
 * @route POST /api/v1/messaging/threads/:threadId/messages
 * @desc Send a message to a thread
 * @access Private (All authenticated users)
 */
router.post('/threads/:threadId/messages',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.sendMessage
);

/**
 * @route PUT /api/v1/messaging/threads/:threadId/archive
 * @desc Archive a message thread
 * @access Private (All authenticated users)
 */
router.put('/threads/:threadId/archive',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.archiveThread
);

/**
 * @route PUT /api/v1/messaging/threads/:threadId/unarchive
 * @desc Unarchive a message thread
 * @access Private (All authenticated users)
 */
router.put('/threads/:threadId/unarchive',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.unarchiveThread
);

/**
 * @route GET /api/v1/messaging/communication-rules
 * @desc Get cross-role communication capabilities and rules
 * @access Private (All authenticated users)
 */
router.get('/communication-rules',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getCrossRoleCommunication
);

/**
 * @route GET /api/v1/messaging/preferences
 * @desc Get user notification preferences
 * @access Private (All authenticated users)
 */
router.get('/preferences',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getNotificationPreferences
);

/**
 * @route PUT /api/v1/messaging/preferences
 * @desc Update user notification preferences
 * @access Private (All authenticated users)
 */
router.put('/preferences',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.updateNotificationPreferences
);

/**
 * @route POST /api/v1/messaging/mark-read
 * @desc Mark messages as read
 * @access Private (All authenticated users)
 */
router.post('/mark-read',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.markMessagesAsRead
);

/**
 * @route GET /api/v1/messaging/search
 * @desc Search messages across threads
 * @access Private (All authenticated users)
 */
router.get('/search',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.searchMessages
);

/**
 * @route GET /api/v1/messaging/statistics
 * @desc Get messaging statistics and analytics
 * @access Private (All authenticated users)
 */
router.get('/statistics',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.getMessageStatistics
);

/**
 * @route POST /api/v1/messaging/messages/:messageId/reactions
 * @desc Add reaction to a message
 * @access Private (All authenticated users)
 */
router.post('/messages/:messageId/reactions',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.addMessageReaction
);

/**
 * @route DELETE /api/v1/messaging/messages/:messageId/reactions
 * @desc Remove reaction from a message
 * @access Private (All authenticated users)
 */
router.delete('/messages/:messageId/reactions',
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'STUDENT']),
    enhancedMessagingController.removeMessageReaction
);

export default router; 