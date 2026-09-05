/**
 * Replies for input that is not a question about data.
 *
 * Without this, "hi" went to the SQL generator, came back as something that was
 * not a query, and the guard refused it with "Only SELECT queries are allowed."
 * — after a three second wait, to someone who had just said hello. Greetings are
 * the first thing anyone types into a box like this, so the first impression was
 * an error message about SQL.
 *
 * Matched before the model runs, so these answer instantly.
 */

export interface SmallTalkReply {
    kind: 'greeting' | 'thanks' | 'capability' | 'identity';
    answer: string;
}

// Kept narrow deliberately. A pattern loose enough to catch every pleasantry
// will also swallow real questions — "who has not paid" must not be read as
// "who are you".
const GREETING = /^\s*(hi|hey|hello|yo|good\s*(morning|afternoon|evening|day)|greetings|salut|bonjour|hi there|hello there)\s*[!.?]*\s*$/i;
const THANKS = /^\s*(thanks|thank you|thx|ta|merci|cheers|ok thanks|great thanks)\s*[!.?]*\s*$/i;
const CAPABILITY = /(what (can|do) you do|what are you for|how (do|does) (this|it|you) work|help me|^\s*help\s*[!.?]*$|what (can|should) i ask|give me examples?|what questions)/i;
const IDENTITY = /(who are you|what are you|are you (a )?(bot|ai|robot|human)|your name)/i;

const EXAMPLES = [
    'How many students are there?',
    'How many students are in FORM 1?',
    'How many students are owing school fees?',
    'How much have we collected?',
    'How many students in each class?',
    'Gender breakdown',
];

function examplesBlock(): string {
    return EXAMPLES.map(e => `  • ${e}`).join('\n');
}

export function matchSmallTalk(question: string): SmallTalkReply | null {
    const q = question.trim();
    if (!q) return null;

    if (GREETING.test(q)) {
        return {
            kind: 'greeting',
            answer:
                `Hello. Ask me anything about the school's data and I'll look it up.\n\n` +
                `For example:\n${examplesBlock()}`,
        };
    }

    if (THANKS.test(q)) {
        return { kind: 'thanks', answer: `You're welcome. Ask me anything else about the school.` };
    }

    if (CAPABILITY.test(q)) {
        return {
            kind: 'capability',
            answer:
                `I answer questions about your school's live data — enrolment, classes, ` +
                `fees and payments, staff, attendance and marks.\n\n` +
                `Try:\n${examplesBlock()}\n\n` +
                `I can only read. I cannot change any record, and every figure I give ` +
                `comes from a query against the database rather than from memory.`,
        };
    }

    if (IDENTITY.test(q)) {
        return {
            kind: 'identity',
            answer:
                `I'm the school assistant. I turn your question into a database query, ` +
                `run it, and report what comes back — so the numbers are always live.\n\n` +
                `Ask me things like:\n${examplesBlock()}`,
        };
    }

    return null;
}
