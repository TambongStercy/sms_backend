import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as messagingController from '../controllers/messagingController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send a direct message
router.post('/send', messagingController.sendMessage);

// Get all conversations for the authenticated user
router.get('/conversations', messagingController.getUserConversations);

// Get conversation history with another user
router.get('/conversation/:otherUserId', messagingController.getConversationHistory);

// Get messages by filters (inbox, sent, search, etc.)
router.get('/filter', messagingController.getMessagesByFilters);

// Get message statistics
router.get('/stats', messagingController.getMessageStats);

// Get suggested contacts
router.get('/suggested-contacts', messagingController.getSuggestedContacts);

// Get message by ID
router.get('/:messageId', messagingController.getMessageById);

// Mark message as read
router.patch('/:messageId/read', messagingController.markMessageAsRead);

// Delete message
router.delete('/:messageId', messagingController.deleteMessage);

export default router; 