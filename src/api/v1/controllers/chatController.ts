import { Request, Response } from 'express';
import * as svc from '../services/chatService';
import { classifyChatMimeType, getChatFileUrl } from '../../../utils/fileUpload';

function handle(err: any, res: Response) {
    const status = err.statusCode || (err.message?.toLowerCase().includes('not found') ? 404 : 500);
    return res.status(status).json({ success: false, error: err.message || 'Server error' });
}

function requireUser(req: any, res: Response): number | null {
    if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return null;
    }
    return req.user.id;
}

export const listMyChannels = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.listMyChannels(userId);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const createCustomChannel = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const data = await svc.createCustomChannel(userId, {
            name: req.body.name,
            description: req.body.description,
            memberIds: Array.isArray(req.body.member_ids) ? req.body.member_ids.map(Number) : [],
            isPrivate: !!req.body.is_private,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const getChannel = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        if (Number.isNaN(channelId)) return res.status(400).json({ success: false, error: 'Invalid channel id' });
        const data = await svc.getChannel(channelId, userId);
        if (!data) return res.status(404).json({ success: false, error: 'Channel not found' });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const listMessages = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        if (Number.isNaN(channelId)) return res.status(400).json({ success: false, error: 'Invalid channel id' });
        const q = req.finalQuery || req.query;
        const data = await svc.listMessages(channelId, userId, {
            before: q.before as string | undefined,
            limit: q.limit ? Number(q.limit) : undefined,
            threadOf: q.thread_of ? Number(q.thread_of) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const postMessage = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        if (Number.isNaN(channelId)) return res.status(400).json({ success: false, error: 'Invalid channel id' });
        const data = await svc.postMessage(channelId, userId, {
            content: req.body.content,
            parentMessageId: req.body.parent_message_id ? Number(req.body.parent_message_id) : null,
            mentionUserIds: Array.isArray(req.body.mention_user_ids)
                ? req.body.mention_user_ids.map((v: any) => Number(v)).filter((n: number) => Number.isInteger(n) && n > 0)
                : undefined,
            attachments: Array.isArray(req.body.attachments) ? req.body.attachments : undefined,
        });
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const editMessage = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const messageId = Number(req.params.id);
        if (Number.isNaN(messageId)) return res.status(400).json({ success: false, error: 'Invalid message id' });
        const data = await svc.editMessage(messageId, userId, req.body.content);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const deleteMessage = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const messageId = Number(req.params.id);
        if (Number.isNaN(messageId)) return res.status(400).json({ success: false, error: 'Invalid message id' });
        await svc.deleteMessage(messageId, userId);
        return res.json({ success: true });
    } catch (err: any) { return handle(err, res); }
};

export const addReaction = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const messageId = Number(req.params.id);
        if (Number.isNaN(messageId)) return res.status(400).json({ success: false, error: 'Invalid message id' });
        const data = await svc.addReaction(messageId, userId, req.body.emoji);
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const removeReaction = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const messageId = Number(req.params.id);
        const emoji = decodeURIComponent(req.params.emoji);
        if (Number.isNaN(messageId)) return res.status(400).json({ success: false, error: 'Invalid message id' });
        await svc.removeReaction(messageId, userId, emoji);
        return res.json({ success: true });
    } catch (err: any) { return handle(err, res); }
};

export const markRead = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        if (Number.isNaN(channelId)) return res.status(400).json({ success: false, error: 'Invalid channel id' });
        const data = await svc.markRead(channelId, userId, req.body.up_to_message_id ? Number(req.body.up_to_message_id) : undefined);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const addMember = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        const targetId = Number(req.body.user_id);
        if (Number.isNaN(channelId) || Number.isNaN(targetId)) return res.status(400).json({ success: false, error: 'Invalid ids' });
        const data = await svc.addMember(channelId, userId, targetId);
        return res.status(201).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

export const removeMember = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const channelId = Number(req.params.id);
        const targetId = Number(req.params.userId);
        if (Number.isNaN(channelId) || Number.isNaN(targetId)) return res.status(400).json({ success: false, error: 'Invalid ids' });
        await svc.removeMember(channelId, userId, targetId);
        return res.json({ success: true });
    } catch (err: any) { return handle(err, res); }
};

export const openDirectMessage = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const userIds = Array.isArray(req.body.user_ids) ? req.body.user_ids.map(Number) : [];
        const data = await svc.openDirectMessage(userId, userIds);
        return res.status(200).json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// POST /chat/upload - Upload a single chat attachment (image / voice / video / doc)
export const uploadChatAttachment = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'file is required (multipart form-data field "file")' });
    }
    try {
        const kind = classifyChatMimeType(req.file.mimetype);
        return res.status(201).json({
            success: true,
            data: {
                fileUrl: getChatFileUrl(req, req.file.filename),
                fileName: req.file.originalname,
                storageName: req.file.filename,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
                kind,
            },
        });
    } catch (err: any) {
        return handle(err, res);
    }
};

// GET /chat/contacts?search=&limit=
export const searchContacts = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const data = await svc.searchContacts(userId, {
            search: q.search as string | undefined,
            limit: q.limit ? Number(q.limit) : undefined,
        });
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};

// GET /chat/presence?userIds=1,2,3
export const getPresence = async (req: any, res: Response): Promise<any> => {
    const userId = requireUser(req, res); if (!userId) return;
    try {
        const q = req.finalQuery || req.query;
        const raw = q.user_ids ?? q.userIds ?? '';
        const ids = String(raw)
            .split(',')
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((n: number) => !Number.isNaN(n));
        const data = await svc.getBatchPresence(ids);
        return res.json({ success: true, data });
    } catch (err: any) { return handle(err, res); }
};
