import { SCHEMA_CATALOG, CatalogEntry } from './schemaCatalog';

/**
 * Picks the handful of tables a question is about.
 *
 * Lexical scoring rather than embeddings, for two reasons. Embeddings would
 * mean a second Ollama model resident alongside the generator on a 4 GB card,
 * and an embedding round trip on the critical path of every question. And the
 * corpus is fifteen short, hand-written entries whose vocabulary is the same
 * vocabulary the questions use — the case where lexical matching is strongest
 * and semantic search adds least.
 *
 * Scoring is deliberately blunt: multi-word keywords are worth more than single
 * words because "school fees" is a far better signal than "fees", and the table
 * name itself counts, so "how many enrollments" finds Enrollment without a
 * keyword for it.
 */

export interface RetrievalHit {
    entry: CatalogEntry;
    score: number;
    matched: string[];
}

const STOPWORDS = new Set([
    'how', 'many', 'much', 'what', 'which', 'who', 'when', 'where', 'is', 'are',
    'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'do',
    'does', 'did', 'have', 'has', 'we', 'i', 'me', 'my', 'our', 'show', 'tell',
    'give', 'list', 'find', 'get', 'there', 'their', 'this', 'that', 'all',
    'total', 'number', 'count', 'please', 'can', 'you',
]);

function normalise(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Crude singular form, enough to make "repeaters" match the keyword "repeater".
 * A real stemmer is overkill for a fifteen-entry corpus, but without any
 * plural handling the retriever misses the table a question is plainly about —
 * "repeaters" scored Enrollment at zero and the model was handed a schema with
 * no enrolment table in it.
 */
function singularise(word: string): string {
    if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.length > 4 && word.endsWith('ses')) return word.slice(0, -2);
    if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
}

function contentWords(text: string): string[] {
    return normalise(text).split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
}

export function retrieve(question: string, limit = 5): RetrievalHit[] {
    const q = normalise(question);
    const raw = contentWords(question);
    // Both forms, so "repeaters" matches "repeater" and "class" matches "classes".
    const words = new Set([...raw, ...raw.map(singularise)]);

    const hits: RetrievalHit[] = SCHEMA_CATALOG.map(entry => {
        let score = 0;
        const matched: string[] = [];

        for (const keyword of entry.keywords) {
            const k = normalise(keyword);
            if (k.includes(' ')) {
                // Phrase hit: strong signal, and worth more the longer it is.
                if (q.includes(k)) {
                    score += 5 + k.split(' ').length;
                    matched.push(keyword);
                }
            } else if (words.has(k) || words.has(singularise(k))) {
                score += 2;
                matched.push(keyword);
            }
        }

        // The table's own name, so a question that says "enrollment" finds it
        // even though no keyword spells that out.
        if (q.includes(normalise(entry.table))) {
            score += 4;
            matched.push(entry.table);
        }

        return { entry, score, matched };
    });

    const ranked = hits.filter(h => h.score > 0).sort((a, b) => b.score - a.score);

    // Nothing matched: rather than send the model an empty schema and let it
    // invent tables, fall back to the tables most questions are about.
    if (ranked.length === 0) {
        const fallback = ['Enrollment', 'Student', 'Class', 'SubClass', 'AcademicYear'];
        return SCHEMA_CATALOG
            .filter(e => fallback.includes(e.table))
            .map(entry => ({ entry, score: 0, matched: [] }));
    }

    const selected = ranked.slice(0, limit);

    // Pull in tables the selected ones join through, or the model writes a join
    // against a table it was never shown. Enrollment in particular is the hinge
    // between students, classes, fees and marks.
    const names = new Set(selected.map(h => h.entry.table));
    const needed = new Set<string>();
    for (const hit of selected) {
        for (const join of (hit.entry.joins ?? '').split(',')) {
            const m = join.match(/(\w+)\.\w+\s*=\s*(\w+)\.\w+/);
            if (m) { needed.add(m[1]); needed.add(m[2]); }
        }
    }
    for (const name of needed) {
        if (names.has(name)) continue;
        const entry = SCHEMA_CATALOG.find(e => e.table === name);
        if (entry) { selected.push({ entry, score: 0, matched: ['(join)'] }); names.add(name); }
    }

    return selected;
}
