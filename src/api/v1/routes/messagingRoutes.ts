import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as messagingController from '../controllers/messagingController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Original direct message sending (keep for backward compatibility)
router.post('/send', messagingController.sendMessage);

// === SIMPLIFIED MESSAGING ROUTES ===

// Send a simple categorized message (easier for older users)
router.post('/simple/send', messagingController.sendSimpleMessage);

// Get messages (inbox or sent) with simplified format
router.get('/simple/messages', messagingController.getSimpleMessages);

// Get available contacts to message (filtered by role-based communication rules)
router.get('/simple/contacts', messagingController.getAvailableContacts);

// Get conversation between two users
router.get('/simple/conversation/:otherUserId', messagingController.getConversation);

export default router; 