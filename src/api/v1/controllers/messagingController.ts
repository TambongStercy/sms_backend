import { Request, Response } from 'express';
import * as messagingService from '../services/messagingService';

// Send a direct message
export async function sendMessage(req: Request, res: Response) {
    try {
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { receiver_id: receiverId , subject, content, priority, attachments } = req.body;

        if (!receiverId || !subject || !content) {
            return res.status(400).json({
                success: false,
                error: 'receiverId, subject, and content are required'
            });
        }

        const message = await messagingService.sendDirectMessage({
            senderId,
            receiverId,
            subject,
            content,
            priority,
            attachments
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Send a simple categorized message (simplified for older users)
export async function sendSimpleMessage(req: Request, res: Response) {
    try {
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { receiver_id: receiverId, subject, content, category } = req.body;

        if (!receiverId || !subject || !content) {
            return res.status(400).json({
                success: false,
                error: 'receiverId, subject, and content are required'
            });
        }

        // Validate category
        const validCategories = ['ACADEMIC', 'FINANCIAL', 'DISCIPLINARY', 'GENERAL'];
        const messageCategory = category || 'GENERAL';
        
        if (!validCategories.includes(messageCategory)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category. Must be ACADEMIC, FINANCIAL, DISCIPLINARY, or GENERAL'
            });
        }

        const result = await messagingService.sendSimpleMessage({
            senderId,
            receiverId: parseInt(receiverId),
            subject,
            content,
            category: messageCategory as messagingService.MessageCategory
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get messages with simplified format
export async function getSimpleMessages(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const type = req.query.type as 'inbox' | 'sent' || 'inbox';
        const messages = await messagingService.getSimpleMessages(userId, type);

        res.json({
            success: true,
            data: messages
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get available users to message (simplified)
export async function getAvailableContacts(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const targetRole = req.query.role as string;
        const contacts = await messagingService.getUsersByRole(userId, targetRole);

        res.json({
            success: true,
            data: contacts
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get conversation history between two users
export async function getConversation(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { otherUserId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const conversation = await messagingService.getConversationHistory(
            userId,
            parseInt(otherUserId)
        );

        res.json({
            success: true,
            data: conversation
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 