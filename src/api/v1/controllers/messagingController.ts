import { Request, Response } from 'express';
import * as messagingService from '../services/messagingService';

// Send a direct message
export async function sendMessage(req: Request, res: Response) {
    try {
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { receiverId, subject, content, priority, attachments } = req.body;

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

// Get conversation history between two users
export async function getConversationHistory(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { otherUserId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                error: 'otherUserId is required'
            });
        }

        const conversation = await messagingService.getConversationHistory(
            userId,
            parseInt(otherUserId),
            page,
            limit
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

// Get all conversations for a user
export async function getUserConversations(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const conversations = await messagingService.getUserConversations(userId);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get messages by filters
export async function getMessagesByFilters(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { status, priority, dateFrom, dateTo, search } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const filters = {
            status: status as any,
            priority: priority as any,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
            search: search as string
        };

        const messages = await messagingService.getMessagesByFilters(
            userId,
            filters,
            page,
            limit
        );

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

// Mark message as read
export async function markMessageAsRead(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                error: 'messageId is required'
            });
        }

        const message = await messagingService.markMessageAsRead(
            parseInt(messageId),
            userId
        );

        res.json({
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

// Get message by ID
export async function getMessageById(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                error: 'messageId is required'
            });
        }

        const message = await messagingService.getMessageById(
            parseInt(messageId),
            userId
        );

        res.json({
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

// Delete message
export async function deleteMessage(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                error: 'messageId is required'
            });
        }

        await messagingService.deleteMessage(
            parseInt(messageId),
            userId
        );

        res.json({
            success: true,
            data: { message: 'Message deleted successfully' }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get message statistics
export async function getMessageStats(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const stats = await messagingService.getMessageStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get suggested contacts
export async function getSuggestedContacts(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const contacts = await messagingService.getSuggestedContacts(userId);

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