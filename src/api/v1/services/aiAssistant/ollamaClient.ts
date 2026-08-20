import axios, { AxiosInstance } from 'axios';

/**
 * Ollama client for the assistant.
 *
 * Routes over a list of inference lanes. There is one today — the Quadro M5000
 * on 11435, four batching slots — but the routing exists because the second
 * lane was real, and the numbers behind dropping it are worth keeping.
 *
 * The box also has 40 cores and 128 GB, and the obvious way to use them is the
 * one that does not work: splitting the model's layers across GPU and CPU. On
 * qwen2.5-coder:3b, generating 80 tokens, all-GPU runs at 31.8 tok/s, half and
 * half at 15.1, all-CPU at 11.1. A split request runs at the speed of its
 * slower half, with the card idle between layers.
 *
 * Running a whole second copy on the CPU and giving it only the questions the
 * GPU had no free slot for does work, and was measured properly: eight
 * concurrent questions in 9.5 s against 10.4 s on the GPU alone. Under a second
 * — and at twelve concurrent it lost, 16.6 s against 15.4 s on the slowest
 * question, because a question that lands on the CPU finishes late and drags
 * the tail out. Not worth a second server to supervise.
 *
 * What did matter was batching. Ollama serves one request at a time by default,
 * so 12 API workers queued behind each other and eight questions at once took
 * 21.2 s. Four slots on the same card took that to 10.4 s. Nearly all of the
 * improvement is there, in OLLAMA_NUM_PARALLEL, not in which device runs what.
 *
 * Lanes are tried in declared order, so a preferred lane takes everything it
 * has capacity for and later ones see only overflow. With one lane configured
 * that ordering costs nothing, and the retry below still buys something: a lane
 * that refuses a connection is marked down and the request tried elsewhere, if
 * there is an elsewhere.
 */

// Ordered, preferred first: routing is first-free-wins, so the fastest device
// leads and anything after it takes only overflow. OLLAMA_URL is still honoured
// on its own, which keeps a plain single-endpoint setup working unchanged.
const LANE_URLS = (process.env.OLLAMA_URLS || process.env.OLLAMA_URL || 'http://127.0.0.1:11434')
    .split(',')
    .map(u => u.trim())
    .filter(Boolean);

// Per-lane concurrency, matched to each server's OLLAMA_NUM_PARALLEL. Setting
// it higher than the server's own limit buys no parallelism — the request just
// queues inside Ollama instead of here, where the router can no longer see that
// the lane is full and send the next question to the other one.
const LANE_SLOTS = (process.env.OLLAMA_LANE_SLOTS || '')
    .split(',')
    .map(n => parseInt(n.trim(), 10))
    .filter(n => Number.isFinite(n) && n > 0);

const DEFAULT_SLOTS = 4;

// A lane that refuses a connection sits out this long rather than being retried
// per request. Ollama takes seconds to come back after a restart, and without a
// cooldown every question in that window pays a failed connect first.
const LANE_COOLDOWN_MS = 30_000;

// 3b, not 7b. Same questions answered, in a third of the time. The 7b now fits
// the card and runs at 13.7 tok/s against the 3b's 21.8, so it is a live option
// if a question set ever needs the accuracy — set OLLAMA_MODEL and restart.
//
// Not qwen3:4b, despite being smaller still. It is a reasoning model and
// answers in prose: given the schema, a worked example, and a prompt ending
// mid-statement at "SQL: SELECT", it continued "We are given the question: ..."
// and produced no usable SQL for any question tested.
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
// Holds the model resident between questions. Without it the first question
// after any pause pays a ~7 s load, which dominates everything else. Applied
// per lane, so a lane added later is kept warm on the same terms.
const KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '30m';

interface Lane {
    url: string;
    slots: number;
    inFlight: number;
    downUntil: number;
    http: AxiosInstance;
}

const lanes: Lane[] = LANE_URLS.map((url, i) => ({
    url,
    slots: LANE_SLOTS[i] ?? DEFAULT_SLOTS,
    inFlight: 0,
    downUntil: 0,
    http: axios.create({ baseURL: url, timeout: 120_000 }),
}));

/**
 * First lane with a free slot, in declared order; if every lane is saturated,
 * whichever is queued least deeply relative to its own width.
 *
 * Order before load is deliberate. Balancing purely by load would hand a slower
 * lane every other question on a quiet system and double those users' wait for
 * nothing — the preferred lane is not busy, it is merely not empty.
 */
function pickLane(exclude: Set<string>): Lane | null {
    const now = Date.now();
    const up = lanes.filter(l => l.downUntil <= now && !exclude.has(l.url));
    if (up.length === 0) return null;

    return up.find(l => l.inFlight < l.slots)
        ?? up.reduce((best, l) => (l.inFlight / l.slots < best.inFlight / best.slots ? l : best));
}

/** A refused connection is worth retrying elsewhere; a rejected prompt is not. */
function isLaneFailure(err: any): boolean {
    if (err?.response) return err.response.status >= 500;
    return true; // refused, reset, timed out — the lane, not the request
}

export interface GenerateOptions {
    numPredict?: number;
    temperature?: number;
    stop?: string[];
}

export async function generate(prompt: string, opts: GenerateOptions = {}): Promise<string> {
    const body = {
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
            // num_thread is deliberately unset. Letting Ollama choose beat every
            // value tried on the CPU lane — four concurrent questions ran at
            // 35.9 tok/s on the default against 32.7 at 16 threads and 30.6 at
            // 10. Pinning threads starves the batch of cores it would have used.
        },
    };

    const tried = new Set<string>();
    let lastError: any;

    // One retry, on a different lane. A second failure is the model or the
    // prompt rather than the placement, and the caller has its own error path.
    for (let attempt = 0; attempt < 2; attempt++) {
        const lane = pickLane(tried);
        if (!lane) break;

        tried.add(lane.url);
        lane.inFlight++;
        try {
            const response = await lane.http.post('/api/generate', body);
            return String(response.data?.response ?? '').trim();
        } catch (err: any) {
            lastError = err;
            if (!isLaneFailure(err)) throw err;
            lane.downUntil = Date.now() + LANE_COOLDOWN_MS;
        } finally {
            lane.inFlight--;
        }
    }

    throw lastError ?? new Error('No inference lane is reachable.');
}

/** Per-lane health, for the status endpoint and for isAvailable(). */
export async function laneStatus(): Promise<Array<{ url: string; up: boolean; slots: number; inFlight: number }>> {
    return Promise.all(lanes.map(async lane => {
        let up = false;
        try {
            const r = await lane.http.get('/api/tags', { timeout: 3000 });
            const models: any[] = r.data?.models ?? [];
            up = models.some(m => String(m.name).startsWith(MODEL.split(':')[0]));
        } catch {
            up = false;
        }
        // A probe that succeeds clears the cooldown early: the lane is back, and
        // making it sit out the rest of the window wastes a working GPU.
        if (up) lane.downUntil = 0;
        return { url: lane.url, up, slots: lane.slots, inFlight: lane.inFlight };
    }));
}

export async function isAvailable(): Promise<boolean> {
    const status = await laneStatus();
    return status.some(s => s.up);
}

/**
 * Warms every lane so the first real question does not pay the load cost.
 *
 * Sequential, not parallel: both lanes read the same 2 GB of weights off the
 * same disk, and loading them at once makes both slower to become useful.
 */
export async function warmUp(): Promise<void> {
    for (const lane of lanes) {
        try {
            await lane.http.post('/api/generate', {
                model: MODEL,
                prompt: 'Reply with: ok',
                stream: false,
                think: false,
                keep_alive: KEEP_ALIVE,
                options: { num_predict: 3, temperature: 0 },
            });
        } catch {
            /* best effort — a cold first question is slow, not broken */
        }
    }
}

export const OLLAMA_MODEL = MODEL;
export const OLLAMA_LANES = lanes.map(l => l.url);
