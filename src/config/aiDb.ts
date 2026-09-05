import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * A second Prisma client bound to the sms_ai_ro role, used only for
 * model-generated SQL.
 *
 * Kept separate from the application client on purpose. The app client owns the
 * data and can write; this one connects as a role with SELECT and nothing else,
 * a statement timeout, and default_transaction_read_only, so a destructive
 * statement fails in PostgreSQL rather than relying on the guard in front of it
 * having spotted every phrasing. The guard is the first line, not the only one.
 *
 * Falls back to unset when AI_DATABASE_URL is absent, which callers treat as
 * "assistant unavailable" — deliberately, so a misconfiguration disables the
 * feature instead of quietly running it with the application's write-capable
 * credentials.
 */
const aiDatabaseUrl = process.env.AI_DATABASE_URL;

let aiPrisma: PrismaClient | null = null;

if (aiDatabaseUrl) {
    aiPrisma = new PrismaClient({
        datasources: { db: { url: aiDatabaseUrl } },
        log: ['warn', 'error'],
    });
} else {
    console.warn(
        'AI_DATABASE_URL is not set — the AI assistant is disabled. ' +
        'It will not fall back to the application database connection.'
    );
}

export function getAiPrisma(): PrismaClient | null {
    return aiPrisma;
}

export function isAiDbConfigured(): boolean {
    return aiPrisma !== null;
}

export default aiPrisma;
