import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { isTokenBlacklisted } from '../api/v1/services/tokenBlacklistService';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

interface AuthenticatedSocketData {
    userId: number;
    userName: string;
    roles: string[];
    token: string;
}

let ioInstance: SocketIOServer | null = null;

// ---------- Presence store (in-memory, multi-tab aware) ----------

interface PresenceEntry {
    sockets: Set<string>;      // Active socket ids for this user
    lastSeenAt: Date | null;   // Set when the last socket disconnects
}

const presence = new Map<number, PresenceEntry>();

function markOnline(userId: number, socketId: string): boolean {
    let entry = presence.get(userId);
    const wasOffline = !entry || entry.sockets.size === 0;
    if (!entry) {
        entry = { sockets: new Set(), lastSeenAt: null };
        presence.set(userId, entry);
    }
    entry.sockets.add(socketId);
    return wasOffline;
}

function markOffline(userId: number, socketId: string): boolean {
    const entry = presence.get(userId);
    if (!entry) return false;
    entry.sockets.delete(socketId);
    if (entry.sockets.size === 0) {
        entry.lastSeenAt = new Date();
        return true; // fully offline
    }
    return false;
}

export function getBatchPresence(userIds: number[]): Record<number, { online: boolean; last_seen_at: Date | null }> {
    const out: Record<number, { online: boolean; last_seen_at: Date | null }> = {};
    for (const id of userIds) {
        const entry = presence.get(id);
        out[id] = {
            online: !!(entry && entry.sockets.size > 0),
            last_seen_at: entry?.sockets.size === 0 ? entry.lastSeenAt : null,
        };
    }
    return out;
}

export function isOnline(userId: number): boolean {
    const entry = presence.get(userId);
    return !!(entry && entry.sockets.size > 0);
}

// ---------- Typing timers ----------
// (userId, channelId) -> NodeJS.Timeout — auto-emit typing.stop after 6s of silence.
const typingTimers = new Map<string, NodeJS.Timeout>();
const TYPING_TIMEOUT_MS = 6_000;

function typingKey(userId: number, channelId: number): string {
    return `${userId}:${channelId}`;
}

function clearTypingTimer(userId: number, channelId: number): void {
    const t = typingTimers.get(typingKey(userId, channelId));
    if (t) {
        clearTimeout(t);
        typingTimers.delete(typingKey(userId, channelId));
    }
}

function scheduleTypingStop(io: SocketIOServer, userId: number, userName: string, channelId: number): void {
    clearTypingTimer(userId, channelId);
    const t = setTimeout(() => {
        io.to(`channel:${channelId}`).except(`user:${userId}`).emit('typing.stop', {
            channelId,
            userId,
            userName,
        });
        typingTimers.delete(typingKey(userId, channelId));
    }, TYPING_TIMEOUT_MS);
    typingTimers.set(typingKey(userId, channelId), t);
}

// ---------- Emitters used by services ----------

export function getIO(): SocketIOServer | null {
    return ioInstance;
}

export function initRealtime(httpServer: HttpServer): SocketIOServer {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://sms.sniperbuisnesscenter.com',
            ],
            credentials: true,
            methods: ['GET', 'POST'],
        },
        path: '/socket.io',
    });

    io.use(async (socket: Socket, next) => {
        try {
            const token =
                (socket.handshake.auth?.token as string | undefined) ||
                (socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') as string | undefined);

            if (!token) return next(new Error('unauthorized: no token'));
            if (isTokenBlacklisted(token)) return next(new Error('unauthorized: token blacklisted'));

            const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role?: string[] };
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { name: true },
            });
            const data: AuthenticatedSocketData = {
                userId: decoded.id,
                userName: user?.name ?? 'User',
                roles: decoded.role || [],
                token,
            };
            (socket.data as AuthenticatedSocketData) = data;
            next();
        } catch (err: any) {
            next(new Error(`unauthorized: ${err.message}`));
        }
    });

    io.on('connection', async (socket) => {
        const { userId, userName } = socket.data as AuthenticatedSocketData;
        socket.join(`user:${userId}`);

        // Load channel memberships and auto-join channel rooms
        try {
            const memberships = await prisma.chatChannelMember.findMany({
                where: { user_id: userId },
                select: { channel_id: true },
            });
            for (const m of memberships) {
                socket.join(`channel:${m.channel_id}`);
            }
        } catch (err) {
            console.error('Socket: failed to load memberships for user', userId, err);
        }

        // Presence: mark online. Fan out to everyone who might care.
        const wasOffline = markOnline(userId, socket.id);
        if (wasOffline) {
            const onlineAt = new Date();
            io.emit('presence.online', { userId, onlineAt });
            io.emit('presence', { userId, status: 'online' }); // legacy compat
        }

        // ---------- Legacy events (kept for back-compat) ----------

        socket.on('typing', (payload: { channelId: number }) => {
            if (!payload?.channelId) return;
            socket.to(`channel:${payload.channelId}`).emit('typing', {
                userId,
                userName,
                channelId: payload.channelId,
            });
            // Also treat legacy `typing` as `typing.start` — schedule the auto-stop.
            scheduleTypingStop(io, userId, userName, payload.channelId);
        });

        socket.on('presence', () => {
            io.emit('presence', { userId, status: 'online' });
        });

        // ---------- Advanced events ----------

        // typing.start — broadcast to peers (not sender) with the sender's name;
        // server keeps a 6s timer and auto-emits typing.stop if not renewed.
        socket.on('typing.start', async (payload: { channelId: number }) => {
            if (!payload?.channelId) return;
            const member = await prisma.chatChannelMember.findUnique({
                where: { channel_id_user_id: { channel_id: payload.channelId, user_id: userId } },
            });
            if (!member) return; // silently drop if not a member
            io.to(`channel:${payload.channelId}`)
                .except(`user:${userId}`)
                .emit('typing.start', {
                    channelId: payload.channelId,
                    userId,
                    userName,
                });
            scheduleTypingStop(io, userId, userName, payload.channelId);
        });

        socket.on('typing.stop', (payload: { channelId: number }) => {
            if (!payload?.channelId) return;
            clearTypingTimer(userId, payload.channelId);
            io.to(`channel:${payload.channelId}`)
                .except(`user:${userId}`)
                .emit('typing.stop', {
                    channelId: payload.channelId,
                    userId,
                    userName,
                });
        });

        // message.delivered — client's ack that a message.new was received.
        // Server relays to the original sender so their message can flip
        // from "sent" (one check) to "delivered" (two checks).
        socket.on('message.delivered', async (payload: { messageId: number }) => {
            if (!payload?.messageId) return;
            const msg = await prisma.chatMessage.findUnique({
                where: { id: payload.messageId },
                select: { id: true, channel_id: true, sender_id: true },
            });
            if (!msg || msg.sender_id === userId) return;
            io.to(`user:${msg.sender_id}`).emit('message.delivered', {
                messageId: msg.id,
                channelId: msg.channel_id,
                userId,
                deliveredAt: new Date(),
            });
        });

        // message.read — batched: everything in `channelId` up to `upToMessageId`
        // (or "now") is marked read. Broadcasts `read.updated` (legacy) plus the
        // richer `message.read` event so clients can compute per-message
        // "seen by" state without another HTTP call.
        socket.on('message.read', async (payload: { channelId: number; upToMessageId?: number }) => {
            if (!payload?.channelId) return;
            const member = await prisma.chatChannelMember.findUnique({
                where: { channel_id_user_id: { channel_id: payload.channelId, user_id: userId } },
            });
            if (!member) return;

            let readAt = new Date();
            let upToMessageId = payload.upToMessageId ?? null;
            if (upToMessageId) {
                const m = await prisma.chatMessage.findUnique({ where: { id: upToMessageId } });
                if (m && m.channel_id === payload.channelId) readAt = m.created_at;
                else upToMessageId = null;
            }
            await prisma.chatChannelMember.update({
                where: { id: member.id },
                data: { last_read_at: readAt },
            });
            const evt = {
                channelId: payload.channelId,
                userId,
                lastReadAt: readAt,
                upToMessageId,
            };
            io.to(`channel:${payload.channelId}`).emit('message.read', evt);
            io.to(`channel:${payload.channelId}`).emit('read.updated', {
                channel_id: payload.channelId,
                user_id: userId,
                last_read_at: readAt,
            });
        });

        // presence.ping — client periodically pings to keep last_seen fresh.
        // No side effect other than confirming online (no need for us to emit).
        socket.on('presence.ping', () => {
            // Intentional no-op; presence is derived from socket connection.
        });

        // Legacy explicit subscribe / unsubscribe still supported.
        socket.on('subscribe', async (payload: { channelId: number }) => {
            if (!payload?.channelId) return;
            const member = await prisma.chatChannelMember.findUnique({
                where: { channel_id_user_id: { channel_id: payload.channelId, user_id: userId } },
            });
            if (member) socket.join(`channel:${payload.channelId}`);
        });

        socket.on('unsubscribe', (payload: { channelId: number }) => {
            if (!payload?.channelId) return;
            socket.leave(`channel:${payload.channelId}`);
        });

        socket.on('disconnect', async () => {
            // Clear typing timers for this user in every channel
            for (const key of Array.from(typingTimers.keys())) {
                if (key.startsWith(`${userId}:`)) {
                    const t = typingTimers.get(key);
                    if (t) clearTimeout(t);
                    typingTimers.delete(key);
                    const channelId = Number(key.split(':')[1]);
                    io.to(`channel:${channelId}`).except(`user:${userId}`).emit('typing.stop', {
                        channelId,
                        userId,
                        userName,
                    });
                }
            }

            const fullyOffline = markOffline(userId, socket.id);
            if (fullyOffline) {
                const lastSeenAt = new Date();
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { last_seen_at: lastSeenAt },
                    });
                } catch (err) {
                    console.error('Failed to persist last_seen_at for user', userId, err);
                }
                io.emit('presence.offline', { userId, lastSeenAt });
                io.emit('presence', { userId, status: 'offline' }); // legacy compat
            }
        });
    });

    ioInstance = io;
    return io;
}

export type ChatEvent =
    | 'channel.created'
    | 'channel.updated'
    | 'message.new'
    | 'message.updated'
    | 'message.deleted'
    | 'reaction.added'
    | 'reaction.removed'
    | 'member.joined'
    | 'member.left'
    | 'read.updated'
    | 'message.read'
    | 'message.delivered'
    | 'typing.start'
    | 'typing.stop';

export function emitToChannel(channelId: number, event: ChatEvent, payload: any): void {
    if (!ioInstance) return;
    ioInstance.to(`channel:${channelId}`).emit(event, payload);
}

export function emitToUser(userId: number, event: string, payload: any): void {
    if (!ioInstance) return;
    ioInstance.to(`user:${userId}`).emit(event, payload);
}

export function addUserToChannelRoom(userId: number, channelId: number): void {
    if (!ioInstance) return;
    ioInstance.in(`user:${userId}`).socketsJoin(`channel:${channelId}`);
}

export function removeUserFromChannelRoom(userId: number, channelId: number): void {
    if (!ioInstance) return;
    ioInstance.in(`user:${userId}`).socketsLeave(`channel:${channelId}`);
}
