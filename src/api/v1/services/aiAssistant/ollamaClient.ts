import axios from 'axios';

/**
 * Minimal Ollama client for the assistant.
 *
 * Sized around the hardware this runs on: a 4 GB Quadro M5000 that fits the 4B
 * model and nothing larger, generating at roughly 9 tokens per second. Every
 * setting here exists to keep generated tokens few, because tokens are the
 * latency.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
// qwen2.5-coder:7b, despite not fitting in 4 GB of VRAM and therefore running
// partly on CPU. qwen3:4b is three times faster and fits entirely on the card,
// but it is a reasoning model and answers questions in prose: given a schema, a
// worked example, and a prompt ending mid-statement at "SQL: SELECT", it still
// continued "We are given the question: ...". It produced no usable SQL for any
// question tested. A slow correct answer beats a fast unusable one, and the
// fast-intent path means most questions never reach the model at all.
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
// Holds the model in VRAM between questions. Without it the first question
// after any pause pays a ~7 s load, which dominates everything else.
const KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '30m';

const client = axios.create({ baseURL: OLLAMA_URL, timeout: 120_000 });

export interface GenerateOptions {
    numPredict?: number;
    temperature?: number;
    stop?: string[];
}

export async function generate(prompt: string, opts: GenerateOptions = {}): Promise<string> {
    const response = await client.post('/api/generate', {
        model: MODEL,
        prompt,
        stream: false,
        // qwen3 is a reasoning model: left on, it spends its whole token budget
        // in a hidden think block and returns an empty answer. Measured at 60
        // tokens generated and nothing usable produced.
        think: false,
        keep_alive: KEEP_ALIVE,
        options: {
            // Deterministic: the same question should produce the same SQL, and
            // creativity in a query generator is not a virtue.
            temperature: opts.temperature ?? 0,
            num_predict: opts.numPredict ?? 220,
            stop: opts.stop,
        },
    });
    return String(response.data?.response ?? '').trim();
}

export async function isAvailable(): Promise<boolean> {
    try {
        const r = await client.get('/api/tags', { timeout: 3000 });
        const models: any[] = r.data?.models ?? [];
        return models.some(m => String(m.name).startsWith(MODEL.split(':')[0]));
    } catch {
        return false;
    }
}

/** Warms the model so the first real question does not pay the load cost. */
export async function warmUp(): Promise<void> {
    try {
        await generate('Reply with: ok', { numPredict: 3 });
    } catch {
        /* best effort — a cold first question is slow, not broken */
    }
}

export const OLLAMA_MODEL = MODEL;
