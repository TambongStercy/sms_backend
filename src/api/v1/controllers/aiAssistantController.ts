import { Request, Response } from 'express';
import * as aiAssistantService from '../services/aiAssistantService';
import { AiAssistantError } from '../services/aiAssistantService';

/**
 * POST /api/v1/ai/ask   { question: string }
 *
 * Errors carry a `detail` alongside the message: the refusal reason from the
 * guard, or the database's complaint about a hallucinated column. Without it a
 * failed question is indistinguishable from a broken feature.
 */
export async function ask(req: Request, res: Response) {
    try {
        const { question } = req.body ?? {};
        if (typeof question !== 'string') {
            return res.status(400).json({ success: false, error: 'A "question" string is required.' });
        }

        const result = await aiAssistantService.ask(question);
        return res.json({ success: true, data: result });

    } catch (error: any) {
        if (error instanceof AiAssistantError) {
            // 422: the request was well-formed, the question just could not be
            // turned into something safe to run.
            return res.status(422).json({
                success: false,
                error: error.message,
                detail: error.detail,
            });
        }
        console.error('AI assistant error:', error);
        return res.status(500).json({ success: false, error: 'The assistant failed to answer.' });
    }
}

/** GET /api/v1/ai/status — lets the UI disable itself rather than fail per question. */
export async function status(_req: Request, res: Response) {
    try {
        return res.json({ success: true, data: await aiAssistantService.status() });
    } catch (error: any) {
        console.error('AI status error:', error);
        return res.status(500).json({ success: false, error: 'Could not read assistant status.' });
    }
}
