import { ALLOWED_TABLES } from './schemaCatalog';

/**
 * Checks model-generated SQL before it is executed.
 *
 * This is the first line, not the only one: the connection it runs on belongs
 * to a role with SELECT and nothing else, in a read-only transaction. The guard
 * exists so that a bad statement is refused with an explanation the user can
 * act on, rather than surfacing as a database permission error — and so obvious
 * mistakes never reach the database at all.
 *
 * The rules are allow-list shaped on purpose. A deny-list of dangerous keywords
 * is the usual approach and the usual mistake: it has to anticipate every way
 * of writing the bad thing, while an allow-list only has to recognise the good
 * one.
 */

export interface GuardResult {
    ok: boolean;
    sql?: string;
    reason?: string;
}

const MAX_ROWS = 200;

// Statement types that may appear at the start. Everything else is rejected
// before any keyword scanning happens.
const ALLOWED_PREFIX = /^\s*(select|with)\s/i;

// Rejected anywhere in the statement. Belt and braces alongside the prefix
// check — these catch a write smuggled into a CTE or a subquery.
const FORBIDDEN = [
    /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|comment)\b/i,
    /\b(copy|vacuum|analyze|reindex|cluster|refresh)\b/i,
    /\bpg_(read_file|write|ls_dir|stat_file|sleep|terminate_backend|reload_conf)\b/i,
    /\b(dblink|pg_execute_server_program|lo_import|lo_export)\b/i,
    /\binto\s+(outfile|dumpfile)\b/i,
    /\bset\s+(role|session\s+authorization)\b/i,
];

// The password column is revoked at the database, but catching it here gives a
// clearer message than a permission error, and covers the hashed column being
// selected through a join alias.
const SENSITIVE_COLUMNS = /\b(password|password_hash|reset_token|refresh_token)\b/i;

function stripComments(sql: string): string {
    // Comments are stripped before analysis, not rejected: models add "-- count
    // students" habitually. Removing them first means the checks below see the
    // statement that will actually run, so nothing can hide inside a comment.
    return sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/--[^\n]*/g, ' ');
}

/** Table names appearing after FROM or JOIN, quoted or bare. */
function referencedTables(sql: string): string[] {
    const found = new Set<string>();
    const re = /\b(?:from|join)\s+"?([A-Za-z_][A-Za-z0-9_]*)"?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) found.add(m[1]);
    return [...found];
}

/** Aliases introduced by a CTE, which are not real tables. */
function cteNames(sql: string): Set<string> {
    const names = new Set<string>();
    const re = /(?:with|,)\s+"?([A-Za-z_][A-Za-z0-9_]*)"?\s+as\s*\(/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) names.add(m[1]);
    return names;
}

export function guardSql(raw: string): GuardResult {
    if (!raw || !raw.trim()) return { ok: false, reason: 'The model returned no SQL.' };

    // Models wrap SQL in markdown fences even when told not to.
    let sql = raw.trim()
        .replace(/^```(?:sql)?\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();

    const analysed = stripComments(sql);

    // One statement only. A trailing semicolon is fine; a second statement is
    // the classic way to append a write to a harmless read.
    const withoutTrailing = analysed.trim().replace(/;\s*$/, '');
    if (withoutTrailing.includes(';')) {
        return { ok: false, reason: 'Only a single statement is allowed.' };
    }

    if (!ALLOWED_PREFIX.test(withoutTrailing)) {
        return { ok: false, reason: 'Only SELECT queries are allowed.' };
    }

    for (const pattern of FORBIDDEN) {
        const hit = withoutTrailing.match(pattern);
        if (hit) return { ok: false, reason: `Statement contains a disallowed keyword: ${hit[0]}` };
    }

    if (SENSITIVE_COLUMNS.test(withoutTrailing)) {
        return { ok: false, reason: 'That query touches credential columns, which are not readable.' };
    }

    // A prefix check alone is not enough to know this is SQL. Prose that begins
    // with the prefilled keyword — "SELECT We are given the question: ..." —
    // satisfied every rule above and was only caught by PostgreSQL's parser,
    // which reports it as a syntax error the user cannot act on. Requiring a
    // FROM against a known table is what distinguishes a query from a sentence.
    const tables = referencedTables(withoutTrailing);
    if (tables.length === 0) {
        return {
            ok: false,
            reason: 'The model did not produce a query — no table was referenced.',
        };
    }

    const ctes = cteNames(withoutTrailing);
    const unknown = tables.filter(t => !ALLOWED_TABLES.has(t) && !ctes.has(t));
    if (unknown.length > 0) {
        return {
            ok: false,
            reason: `Unknown table(s): ${unknown.join(', ')}. The assistant can only read a defined set of tables.`,
        };
    }

    // Cap the result set. A question phrased as "list the students" would
    // otherwise return every row and stall the browser rendering it.
    let final = withoutTrailing.trim();
    if (!/\blimit\s+\d+/i.test(final)) {
        final = `${final} LIMIT ${MAX_ROWS}`;
    }

    return { ok: true, sql: final };
}

export const GUARD_MAX_ROWS = MAX_ROWS;
