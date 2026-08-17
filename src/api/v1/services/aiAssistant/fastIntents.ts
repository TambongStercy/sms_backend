/**
 * Hand-written answers for the questions that actually get asked daily.
 *
 * The model generates at ~9 tokens/second, so a generated query costs several
 * seconds before the database is even touched. The common questions are a small,
 * predictable set, and their SQL does not need inventing every time — matching
 * them by pattern answers in milliseconds and leaves the model for the long
 * tail. This is what makes the feature feel fast rather than merely possible.
 *
 * Every query here is parameterised. None interpolates user text.
 */

export interface FastIntent {
    name: string;
    /** Ordered: the first match wins, so put the specific patterns first. */
    patterns: RegExp[];
    /** $1 is the current academic year id; $2 is the captured term when used. */
    sql: string;
    /** Builds extra parameters from the regex match. */
    params?: (m: RegExpMatchArray) => any[];
    /** Turns the single result row into a sentence. */
    describe: (row: any, m: RegExpMatchArray) => string;
    /**
     * Whether a non-leadership role may ask this.
     *
     * The assistant is reachable from every dashboard, but "who can open it" and
     * "what it will answer" are different questions. A head count per class is
     * unremarkable; what the school is owed is not something a parent or a
     * teacher should be able to ask, and the free-text path is off for them
     * entirely — an arbitrary SELECT over student records, fees, marks and
     * discipline is the whole school's private data behind one text box.
     */
    general?: boolean;
}

// Enrolment is per academic year, so "how many students" without a year means
// the current one. Every count below is scoped this way.
const CURRENT_YEAR = `(SELECT id FROM "AcademicYear" WHERE is_current = true LIMIT 1)`;

export const FAST_INTENTS: FastIntent[] = [
    {
        // Must precede students_in_class: that pattern captures a trailing
        // phrase as a class name, so "how many students in each class" matched
        // it and searched for a class literally named "EACH CLASS", returning
        // a confident zero. First match wins, so ordering is the fix.
        name: 'class_breakdown',
        general: true,
        patterns: [
            /how many (?:students?|pupils?) (?:are )?(?:in|per) (?:each|every|all) (?:class|classes|form)/i,
            /(?:students?|enrol(?:l)?ment) (?:per|by|in each|for each) class/i,
            /breakdown (?:of )?(?:students?|classes|enrol(?:l)?ment)/i,
            /class (?:sizes?|distribution)/i,
        ],
        sql: `
            SELECT c.name AS class, COUNT(DISTINCT e.student_id)::int AS count
            FROM "Enrollment" e
            JOIN "Class" c ON c.id = e.class_id
            WHERE e.academic_year_id = ${CURRENT_YEAR}
            GROUP BY c.name
            ORDER BY count DESC`,
        describe: () => 'Enrolment by class for the current academic year:',
    },
    {
        name: 'students_in_class',
        general: true,
        patterns: [
            // The negative lookahead is a second guard on the same confusion:
            // even reordered, "in each class" should never be read as a name.
            /how many (?:students?|pupils?|children) (?:are )?(?:in|enrolled in) (?!each|every|all|total)([a-z0-9 ]+?)\??$/i,
            /(?:number|count) of (?:students?|pupils?) in (?!each|every|all)([a-z0-9 ]+?)\??$/i,
        ],
        sql: `
            SELECT COUNT(DISTINCT e.student_id)::int AS count
            FROM "Enrollment" e
            JOIN "Class" c ON c.id = e.class_id
            WHERE e.academic_year_id = ${CURRENT_YEAR}
              AND UPPER(c.name) LIKE UPPER($1)`,
        params: m => [`%${m[1].trim()}%`],
        describe: (row, m) => `${row.count} student${row.count === 1 ? '' : 's'} are enrolled in ${m[1].trim().toUpperCase()} this academic year.`,
    },
    {
        name: 'students_total',
        general: true,
        patterns: [
            /how many (?:students?|pupils?|children)(?: are there| do we have| are enrolled)?\s*(?:in (?:the )?school)?\??$/i,
            /total (?:number of )?(?:students?|pupils?)\??$/i,
        ],
        sql: `
            SELECT COUNT(DISTINCT e.student_id)::int AS count
            FROM "Enrollment" e
            WHERE e.academic_year_id = ${CURRENT_YEAR}`,
        describe: row => `${row.count} students are enrolled this academic year.`,
    },
    {
        name: 'students_owing',
        patterns: [
            /how many (?:students?|pupils?)?\s*(?:are )?(?:owing|owe|in debt|have (?:an )?outstanding)/i,
            /(?:students?|pupils?) (?:who )?(?:owe|owing|have not paid|haven'?t paid)/i,
            /how many (?:have not|haven'?t) paid/i,
        ],
        sql: `
            SELECT COUNT(*)::int AS count,
                   COALESCE(SUM(sf.amount_expected - sf.amount_paid), 0)::bigint AS outstanding
            FROM "SchoolFees" sf
            WHERE sf.academic_year_id = ${CURRENT_YEAR}
              AND sf.amount_expected > sf.amount_paid`,
        describe: row =>
            `${row.count} enrolment${row.count === 1 ? '' : 's'} still owe fees, totalling ${Number(row.outstanding).toLocaleString()} FCFA outstanding.`,
    },
    {
        name: 'fees_collected',
        patterns: [
            /how much (?:have we |has been )?(?:collected|received|paid)/i,
            /total (?:fees )?(?:collected|paid|revenue|income)/i,
        ],
        sql: `
            SELECT COALESCE(SUM(pt.amount), 0)::bigint AS total,
                   COUNT(*)::int AS payments
            FROM "PaymentTransaction" pt
            WHERE pt.academic_year_id = ${CURRENT_YEAR}`,
        describe: row =>
            `${Number(row.total).toLocaleString()} FCFA collected across ${row.payments} payments this academic year.`,
    },
    {
        name: 'expected_total',
        patterns: [
            /how much (?:are we |is )?(?:expect|owed|due)/i,
            /total (?:fees )?expected/i,
        ],
        sql: `
            SELECT COALESCE(SUM(sf.amount_expected), 0)::bigint AS expected,
                   COALESCE(SUM(sf.amount_paid), 0)::bigint AS paid
            FROM "SchoolFees" sf
            WHERE sf.academic_year_id = ${CURRENT_YEAR}`,
        describe: row => {
            const expected = Number(row.expected);
            const paid = Number(row.paid);
            const pct = expected > 0 ? Math.round((paid / expected) * 100) : 0;
            return `${expected.toLocaleString()} FCFA expected this year; ${paid.toLocaleString()} FCFA collected (${pct}%), leaving ${(expected - paid).toLocaleString()} FCFA outstanding.`;
        },
    },
    {
        name: 'teacher_count',
        general: true,
        patterns: [
            /how many (?:teachers?|teaching staff)/i,
            /(?:number|count) of teachers?/i,
        ],
        sql: `
            SELECT COUNT(DISTINCT ur.user_id)::int AS count
            FROM "UserRole" ur
            WHERE ur.role = 'TEACHER'`,
        describe: row => `${row.count} users hold the TEACHER role.`,
    },
    {
        name: 'gender_split',
        general: true,
        patterns: [
            /how many (?:boys|girls|male|female)/i,
            /gender (?:split|breakdown|distribution)/i,
        ],
        sql: `
            SELECT s.gender::text AS gender, COUNT(DISTINCT s.id)::int AS count
            FROM "Enrollment" e
            JOIN "Student" s ON s.id = e.student_id
            WHERE e.academic_year_id = ${CURRENT_YEAR}
            GROUP BY s.gender
            ORDER BY count DESC`,
        describe: () => 'Enrolled students by gender this academic year:',
    },
];

export function matchFastIntent(
    question: string,
    generalOnly = false
): { intent: FastIntent; match: RegExpMatchArray } | null {
    const q = question.trim();
    for (const intent of FAST_INTENTS) {
        if (generalOnly && !intent.general) continue;
        for (const pattern of intent.patterns) {
            const m = q.match(pattern);
            if (m) return { intent, match: m };
        }
    }
    return null;
}
