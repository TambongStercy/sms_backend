import { getAiPrisma, isAiDbConfigured } from '../../../config/aiDb';
import { retrieve } from './aiAssistant/retriever';
import { renderSchema } from './aiAssistant/schemaCatalog';
import { guardSql, GUARD_MAX_ROWS } from './aiAssistant/sqlGuard';
import { generate, isAvailable, OLLAMA_MODEL } from './aiAssistant/ollamaClient';
import { matchFastIntent } from './aiAssistant/fastIntents';

/**
 * Answers a natural-language question about school data.
 *
 * Two paths. Common questions match a hand-written intent and answer in
 * milliseconds. Anything else goes through retrieval to pick the relevant
 * tables, then the model to write a SELECT, then the guard, then a read-only
 * connection.
 *
 * The model never states a number. It only decides which rows to fetch; the
 * figures in the answer come from the database. Asked directly, the model
 * cheerfully replies that it cannot determine how many students there are —
 * which is correct, and exactly why it is kept away from the arithmetic.
 */

export type AnswerSource = 'fast-intent' | 'generated-sql';

export interface AskResult {
    question: string;
    answer: string;
    source: AnswerSource;
    rows: any[];
    rowCount: number;
    sql?: string;
    tables?: string[];
    tookMs: number;
    truncated: boolean;
}

export class AiAssistantError extends Error {
    constructor(message: string, readonly detail?: string) {
        super(message);
        this.name = 'AiAssistantError';
    }
}

const MAX_QUESTION_LENGTH = 500;

function buildPrompt(question: string, schema: string): string {
    // Worked examples rather than instructions alone. Told only to "output
    // ONLY the SQL", the 4B model still opened with "We are to find which
    // class has the most repeaters." — it answers the question as prose
    // because that is what a question looks like. Two examples in the exact
    // Question/SQL shape make the next token overwhelmingly likely to be
    // SELECT, which no amount of instruction achieved.
    //
    // The examples also carry the conventions that matter most — the join
    // through Enrollment and the current-year filter — where they are copied
    // rather than merely read.
    return `Translate the question into one PostgreSQL SELECT query.

${schema}

Rules:
- Output ONLY SQL. No prose, no markdown fences.
- SELECT only. Never INSERT, UPDATE, DELETE or DDL.
- Table names are case-sensitive and must be double-quoted, e.g. "Student".
- Enrolment is per academic year. Unless a year is named, filter on the current one.
- Counting students means COUNT(DISTINCT e.student_id) through "Enrollment".
- A student owes fees when amount_expected > amount_paid.
- Class names are upper case, e.g. 'FORM 1'.

Question: How many students are in FORM 2?
SQL: SELECT COUNT(DISTINCT e.student_id) AS count FROM "Enrollment" e JOIN "Class" c ON c.id = e.class_id WHERE e.academic_year_id = (SELECT id FROM "AcademicYear" WHERE is_current = true LIMIT 1) AND UPPER(c.name) LIKE UPPER('%FORM 2%')

Question: Which subclass has the most students?
SQL: SELECT sc.name AS subclass, COUNT(DISTINCT e.student_id) AS count FROM "Enrollment" e JOIN "SubClass" sc ON sc.id = e.sub_class_id WHERE e.academic_year_id = (SELECT id FROM "AcademicYear" WHERE is_current = true LIMIT 1) GROUP BY sc.name ORDER BY count DESC LIMIT 10

Question: ${question}
SQL:`;
}

/**
 * The coder model writes its own SELECT and sometimes wraps the statement in a
 * markdown fence despite being told not to. Both are stripped here rather than
 * rejected — a fenced but otherwise correct query is a formatting quirk, not a
 * wrong answer, and refusing it would fail questions the model got right.
 */
function cleanSql(raw: string): string {
    let sql = raw.trim()
        .replace(/^```(?:sql)?\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .trim();
    // Guard against a doubled keyword if the prompt is ever changed back to
    // prefilling one.
    sql = sql.replace(/^SELECT\s+SELECT\b/i, 'SELECT');
    return sql.trim();
}

/** Prisma returns BigInt for ::bigint and Decimal for numerics; neither is JSON-serialisable. */
function serialise(rows: any[]): any[] {
    return rows.map(row => {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
            if (typeof v === 'bigint') out[k] = Number(v);
            else if (v && typeof v === 'object' && 'toNumber' in (v as any)) out[k] = (v as any).toNumber();
            else if (v instanceof Date) out[k] = v.toISOString();
            else out[k] = v;
        }
        return out;
    });
}

/** Turns an arbitrary result set into one readable line. */
function describeRows(rows: any[]): string {
    if (rows.length === 0) return 'No matching records were found.';

    if (rows.length === 1) {
        const entries = Object.entries(rows[0]);
        if (entries.length === 1) {
            const [key, value] = entries[0];
            const n = typeof value === 'number' ? value.toLocaleString() : String(value);
            return `${key.replace(/_/g, ' ')}: ${n}`;
        }
        return entries
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v.toLocaleString() : v}`)
            .join(', ');
    }

    return `${rows.length} row${rows.length === 1 ? '' : 's'} returned.`;
}

export async function ask(rawQuestion: string): Promise<AskResult> {
    const started = Date.now();
    const question = (rawQuestion ?? '').trim();

    if (!question) throw new AiAssistantError('Please ask a question.');
    if (question.length > MAX_QUESTION_LENGTH) {
        throw new AiAssistantError(`Questions are limited to ${MAX_QUESTION_LENGTH} characters.`);
    }
    if (!isAiDbConfigured()) {
        throw new AiAssistantError(
            'The assistant is not configured.',
            'AI_DATABASE_URL is unset, so there is no read-only connection to query with.'
        );
    }

    const prisma = getAiPrisma()!;

    // --- Fast path -----------------------------------------------------------
    const fast = matchFastIntent(question);
    if (fast) {
        const params = fast.intent.params ? fast.intent.params(fast.match) : [];
        const rows = serialise(
            await prisma.$queryRawUnsafe<any[]>(fast.intent.sql, ...params)
        );
        return {
            question,
            answer: rows.length > 0
                ? fast.intent.describe(rows[0], fast.match)
                : 'No matching records were found.',
            source: 'fast-intent',
            rows,
            rowCount: rows.length,
            tookMs: Date.now() - started,
            truncated: false,
        };
    }

    // --- Generated path ------------------------------------------------------
    if (!(await isAvailable())) {
        throw new AiAssistantError(
            'The language model is not reachable.',
            `Ollama did not respond, or the model ${OLLAMA_MODEL} is not installed.`
        );
    }

    const hits = retrieve(question);
    const schema = renderSchema(hits.map(h => h.entry));

    let sqlDraft: string;
    try {
        const raw = await generate(buildPrompt(question, schema), {
            numPredict: 200,
            temperature: 0,
            // Stop at the start of a further example, or at prose that follows a
            // finished statement.
            stop: ['\n\n', 'Question:', 'Explanation:', ';'],
        });
        sqlDraft = cleanSql(raw);
    } catch (err: any) {
        throw new AiAssistantError('The language model failed to respond.', err?.message);
    }

    const guard = guardSql(sqlDraft);
    if (!guard.ok) {
        throw new AiAssistantError(
            'That question produced a query the assistant will not run.',
            guard.reason
        );
    }

    let rows: any[];
    try {
        rows = serialise(await prisma.$queryRawUnsafe<any[]>(guard.sql!));
    } catch (err: any) {
        // Usually a hallucinated column. The generated SQL is included because
        // it is the only way for the user to see why the question failed.
        throw new AiAssistantError(
            'The generated query could not be run against the database.',
            `${err?.message ?? err}\n\nSQL: ${guard.sql}`
        );
    }

    return {
        question,
        answer: describeRows(rows),
        source: 'generated-sql',
        rows,
        rowCount: rows.length,
        sql: guard.sql,
        tables: hits.map(h => h.entry.table),
        tookMs: Date.now() - started,
        truncated: rows.length >= GUARD_MAX_ROWS,
    };
}

export async function status() {
    const modelUp = await isAvailable();
    return {
        configured: isAiDbConfigured(),
        modelAvailable: modelUp,
        model: OLLAMA_MODEL,
        maxRows: GUARD_MAX_ROWS,
    };
}
