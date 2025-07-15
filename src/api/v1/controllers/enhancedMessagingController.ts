import { Request, Response } from 'express';
import * as enhancedMessagingService from '../services/enhancedMessagingService';

/**
 * Get enhanced messaging dashboard
 */
export async function getMessagingDashboard(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboard = await enhancedMessagingService.getMessagingDashboard(userId, academicYearId);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error fetching messaging dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messaging dashboard'
        });
    }
}

/**
 * Get message threads
 */
export async function getMessageThreads(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const filters = {
            category: req.query.category as string,
            priority: req.query.priority as string,
            status: req.query.status as string,
            search: req.query.search as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20
        };

        const result = await enhancedMessagingService.getMessageThreads(userId, filters);

        res.status(200).json({
            success: true,
            data: result.threads,
            meta: result.pagination
        });
    } catch (error) {
        console.error('Error fetching message threads:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch message threads'
        });
    }
}

/**
 * Get messages in a thread
 */
export async function getThreadMessages(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const threadId = parseInt(req.params.threadId);
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

        if (!threadId || isNaN(threadId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid thread ID is required'
            });
        }

        const result = await enhancedMessagingService.getThreadMessages(userId, threadId, { page, limit });

        res.status(200).json({
            success: true,
            data: result.messages,
            meta: result.pagination
        });
    } catch (error) {
        console.error('Error fetching thread messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch thread messages'
        });
    }
}

/**
 * Create a new message thread
 */
export async function createMessageThread(req: Request, res: Response) {
    try {
        const creatorId = req.user.id;
        const { subject, participants, category, priority, initial_message, tags } = req.body;

        console.log('Received initial_message:', initial_message);

        // Validation
        if (!subject || !participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Subject and participants are required'
            });
        }

        if (!initial_message || initial_message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Initial message is required'
            });
        }

        const threadData = {
            subject: subject.trim(),
            participants,
            category: category || 'GENERAL',
            priority: priority || 'MEDIUM',
            initialMessage: initial_message.trim(),
            tags: tags || []
        };

        const newThread = await enhancedMessagingService.createMessageThread(creatorId, threadData);

        res.status(201).json({
            success: true,
            message: 'Message thread created successfully',
            data: newThread
        });
    } catch (error) {
        console.error('Error creating message thread:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create message thread'
        });
    }
}

/**
 * Send a message to a thread
 */
export async function sendMessage(req: Request, res: Response) {
    try {
        const senderId = req.user.id;
        const threadId = parseInt(req.params.threadId);
        const { content, messageType, priority, mentions, attachments } = req.body;

        if (!threadId || isNaN(threadId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid thread ID is required'
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message content is required'
            });
        }

        const messageData = {
            senderId,
            receiverId: threadId, // In this simplified implementation, threadId represents the receiver
            content: content.trim(),
            priority,
            category: messageType
        };

        const newMessage = await enhancedMessagingService.sendMessage(messageData);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
}

/**
 * Get cross-role communication capabilities
 */
export async function getCrossRoleCommunication(req: Request, res: Response) {
    try {
        const communicationRules = await enhancedMessagingService.getCommunicationMatrix();

        res.status(200).json({
            success: true,
            data: communicationRules
        });
    } catch (error) {
        console.error('Error fetching communication rules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch communication rules'
        });
    }
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const preferences = await enhancedMessagingService.getNotificationPreferences(userId);

        res.status(200).json({
            success: true,
            data: preferences
        });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notification preferences'
        });
    }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const preferences = req.body;

        // Basic validation
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Valid preferences object is required'
            });
        }

        const updatedPreferences = await enhancedMessagingService.updateNotificationPreferences(userId, preferences);

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: updatedPreferences
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification preferences'
        });
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const { messageIds } = req.body;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array of message IDs is required'
            });
        }

        // Validate message IDs
        const validMessageIds = messageIds.filter(id => Number.isInteger(id) && id > 0);
        if (validMessageIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid message IDs are required'
            });
        }

        // Mark each message as read individually
        const results = await Promise.allSettled(
            validMessageIds.map(messageId =>
                enhancedMessagingService.markMessageAsRead(messageId, userId)
            )
        );

        const markedCount = results.filter(result => result.status === 'fulfilled').length;

        res.status(200).json({
            success: true,
            message: `${markedCount} messages marked as read`,
            data: {
                success: true,
                markedCount,
                totalRequested: validMessageIds.length
            }
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark messages as read'
        });
    }
}

/**
 * Search messages
 */
export async function searchMessages(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const query = req.query.q as string;

        if (!query || query.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 3 characters long'
            });
        }

        const filters = {
            category: req.query.category as string,
            priority: req.query.priority as string,
            dateFrom: req.query.dateFrom as string,
            dateTo: req.query.dateTo as string,
            senderId: req.query.senderId ? parseInt(req.query.senderId as string) : undefined,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20
        };

        const result = await enhancedMessagingService.searchMessages(userId, query.trim(), filters);

        res.status(200).json({
            success: true,
            data: result.messages,
            meta: result.pagination
        });
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search messages'
        });
    }
}

/**
 * Get message statistics
 */
export async function getMessageStatistics(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        // Mock statistics
        const statistics = {
            totalThreads: 25,
            totalMessages: 157,
            unreadMessages: 8,
            sentMessages: 42,
            receivedMessages: 115,
            averageResponseTime: '2.5 hours',
            mostActiveCategory: 'ACADEMIC',
            messagesByCategory: {
                ACADEMIC: 45,
                ADMINISTRATIVE: 28,
                DISCIPLINARY: 15,
                FINANCIAL: 12,
                GENERAL: 35,
                EMERGENCY: 3
            },
            messagesByPriority: {
                LOW: 58,
                MEDIUM: 72,
                HIGH: 25,
                URGENT: 2
            },
            weeklyActivity: [
                { day: 'Monday', sent: 8, received: 12 },
                { day: 'Tuesday', sent: 6, received: 15 },
                { day: 'Wednesday', sent: 9, received: 11 },
                { day: 'Thursday', sent: 7, received: 18 },
                { day: 'Friday', sent: 12, received: 14 },
                { day: 'Saturday', sent: 0, received: 2 },
                { day: 'Sunday', sent: 0, received: 1 }
            ]
        };

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Error fetching message statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch message statistics'
        });
    }
}

/**
 * Archive a message thread
 */
export async function archiveThread(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const threadId = parseInt(req.params.threadId);

        if (!threadId || isNaN(threadId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid thread ID is required'
            });
        }

        // In real implementation, would update thread status to archived
        res.status(200).json({
            success: true,
            message: 'Thread archived successfully',
            data: { threadId, status: 'ARCHIVED', archivedAt: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Error archiving thread:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to archive thread'
        });
    }
}

/**
 * Unarchive a message thread
 */
export async function unarchiveThread(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const threadId = parseInt(req.params.threadId);

        if (!threadId || isNaN(threadId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid thread ID is required'
            });
        }

        // In real implementation, would update thread status to active
        res.status(200).json({
            success: true,
            message: 'Thread unarchived successfully',
            data: { threadId, status: 'ACTIVE', unarchivedAt: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Error unarchiving thread:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unarchive thread'
        });
    }
}

/**
 * Add reaction to a message
 */
export async function addMessageReaction(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const messageId = parseInt(req.params.messageId);
        const { reaction } = req.body;

        if (!messageId || isNaN(messageId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid message ID is required'
            });
        }

        const allowedReactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡'];
        if (!reaction || !allowedReactions.includes(reaction)) {
            return res.status(400).json({
                success: false,
                error: 'Valid reaction is required'
            });
        }

        // In real implementation, would add reaction to database
        res.status(201).json({
            success: true,
            message: 'Reaction added successfully',
            data: {
                messageId,
                userId,
                reaction,
                reactedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error adding message reaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add message reaction'
        });
    }
}

/**
 * Remove reaction from a message
 */
export async function removeMessageReaction(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const messageId = parseInt(req.params.messageId);
        const { reaction } = req.body;

        if (!messageId || isNaN(messageId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid message ID is required'
            });
        }

        if (!reaction) {
            return res.status(400).json({
                success: false,
                error: 'Reaction type is required'
            });
        }

        // In real implementation, would remove reaction from database
        res.status(200).json({
            success: true,
            message: 'Reaction removed successfully',
            data: {
                messageId,
                userId,
                reaction,
                removedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error removing message reaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove message reaction'
        });
    }
} 