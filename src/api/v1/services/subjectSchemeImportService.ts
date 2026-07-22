// src/api/v1/services/subjectSchemeImportService.ts
//
// Parses an uploaded .xlsx workbook into one or more SchemeBulkPayload objects
// and hands each off to subjectSchemeService.bulkCreateOrReplaceScheme.
//
// Sheet format (one sheet per scheme):
//   A1 "Subject"               B1 <subject name>
//   A2 "Class"                 B2 <class name>
//   A3 "Periods Per Week"      B3 <int>
//   A4 "Annual Teaching Hours" B4 <int>
//   A5 "Notes" (optional)      B5 <string>
//   Row 7 = header row
//   Row 8+ = lesson rows
//
// Data columns (case-insensitive, accept either "Module Code" or "moduleCode"):
//   Module Code, Module Title, Chapter Code, Chapter Title, Lesson Title,
//   Entry Type, Term, Week, Periods, Objectives, Hands-On Activities,
//   Digital Resource Available, Digital Resources Used
//
// Empty Module/Chapter cells inherit from the previous row (lets VPs avoid
// repeating the module title for every lesson). A new Module Title resets
// chapter numbering; a new Chapter Title resets lesson numbering.

import * as XLSX from 'xlsx';
import prisma from '../../../config/db';
import {
    bulkCreateOrReplaceScheme,
    LessonEntryTypeInput,
    LessonInput,
    SchemeBulkPayload,
} from './subjectSchemeService';

export interface ImportRowError {
    sheet: string;
    row: number;
    message: string;
}

export interface ImportResult {
    created: Array<{
        sheet: string;
        scheme_id: number;
        subject_id: number;
        class_id: number;
        module_count: number;
        lesson_count: number;
    }>;
    errors: ImportRowError[];
}

const HEADER_ALIASES: Record<string, string> = {
    'module code': 'moduleCode',
    'modulecode': 'moduleCode',
    'module title': 'moduleTitle',
    'moduletitle': 'moduleTitle',
    'chapter code': 'chapterCode',
    'chaptercode': 'chapterCode',
    'chapter title': 'chapterTitle',
    'chaptertitle': 'chapterTitle',
    'lesson title': 'lessonTitle',
    'lessontitle': 'lessonTitle',
    'entry type': 'entryType',
    'entrytype': 'entryType',
    'term': 'term',
    'week': 'week',
    'periods': 'periods',
    'periods count': 'periods',
    'objectives': 'objectives',
    'hands-on activities': 'handsOnActivities',
    'hands on activities': 'handsOnActivities',
    'handsonactivities': 'handsOnActivities',
    'digital resource available': 'digitalResourceAvailable',
    'digitalresourceavailable': 'digitalResourceAvailable',
    'digital resources used': 'digitalResourcesUsed',
    'digitalresourcesused': 'digitalResourcesUsed',
};

const ENTRY_TYPES: LessonEntryTypeInput[] = [
    'LESSON',
    'INTEGRATION',
    'EVALUATION',
    'REMEDIATION',
    'REVISION',
    'BREAK',
];

function cellString(v: unknown): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

function cellInt(v: unknown): number | null {
    const s = cellString(v);
    if (s === null) return null;
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : null;
}

function cellBool(v: unknown): boolean {
    const s = cellString(v);
    if (!s) return false;
    return /^(true|yes|y|available|1|x)$/i.test(s);
}

function normalizeEntryType(v: unknown): LessonEntryTypeInput {
    const s = cellString(v);
    if (!s) return 'LESSON';
    const up = s.toUpperCase().replace(/[\s-]+/g, '_');
    if (ENTRY_TYPES.includes(up as LessonEntryTypeInput)) {
        return up as LessonEntryTypeInput;
    }
    if (/INTEG/i.test(s)) return 'INTEGRATION';
    if (/EVAL/i.test(s)) return 'EVALUATION';
    if (/REMEDI|CORRECT/i.test(s)) return 'REMEDIATION';
    if (/REVIS/i.test(s)) return 'REVISION';
    if (/BREAK/i.test(s)) return 'BREAK';
    return 'LESSON';
}

interface ParsedSchemeMeta {
    subjectName: string;
    className: string;
    periodsPerWeek: number;
    annualTeachingHours: number;
    notes?: string | null;
}

function parseMeta(sheet: XLSX.WorkSheet): ParsedSchemeMeta {
    const get = (addr: string) => (sheet[addr] ? sheet[addr].v : undefined);
    const subject = cellString(get('B1'));
    const className = cellString(get('B2'));
    const periods = cellInt(get('B3'));
    const hours = cellInt(get('B4'));
    const notes = cellString(get('B5'));

    if (!subject) throw new Error('B1 (Subject name) is empty.');
    if (!className) throw new Error('B2 (Class name) is empty.');
    if (!periods) throw new Error('B3 (Periods Per Week) is empty or invalid.');
    if (!hours) throw new Error('B4 (Annual Teaching Hours) is empty or invalid.');

    return {
        subjectName: subject,
        className,
        periodsPerWeek: periods,
        annualTeachingHours: hours,
        notes,
    };
}

function readHeaderRow(sheet: XLSX.WorkSheet, headerRowIdx: number): Record<string, number> {
    const ref = sheet['!ref'];
    if (!ref) throw new Error('Sheet has no data range.');
    const range = XLSX.utils.decode_range(ref);

    const headers: Record<string, number> = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: headerRowIdx, c });
        const raw = cellString(sheet[addr]?.v);
        if (!raw) continue;
        const key = HEADER_ALIASES[raw.toLowerCase()] ?? raw;
        headers[key] = c;
    }
    if (!headers.lessonTitle) {
        throw new Error('Header row is missing required column "Lesson Title" (expected on row 7).');
    }
    return headers;
}

interface ParsedScheme {
    meta: ParsedSchemeMeta;
    modules: Array<{
        order: number;
        code: string | null;
        title: string;
        chapters: Array<{
            order: number;
            code: string | null;
            title: string;
            lessons: LessonInput[];
        }>;
    }>;
}

function parseSheet(sheet: XLSX.WorkSheet, sheetName: string, errors: ImportRowError[]): ParsedScheme {
    const meta = parseMeta(sheet);
    const HEADER_ROW = 6; // 0-indexed → row 7 in Excel
    const headers = readHeaderRow(sheet, HEADER_ROW);

    const ref = sheet['!ref'];
    if (!ref) throw new Error('Sheet has no data range.');
    const range = XLSX.utils.decode_range(ref);

    const getCell = (r: number, key: string): unknown => {
        const col = headers[key];
        if (col === undefined) return undefined;
        const addr = XLSX.utils.encode_cell({ r, c: col });
        return sheet[addr]?.v;
    };

    const modules: ParsedScheme['modules'] = [];
    let curMod: ParsedScheme['modules'][number] | null = null;
    let curChap: ParsedScheme['modules'][number]['chapters'][number] | null = null;

    let moduleOrder = 0;
    let chapterOrder = 0;
    let lessonOrder = 0;

    for (let r = HEADER_ROW + 1; r <= range.e.r; r++) {
        const lessonTitle = cellString(getCell(r, 'lessonTitle'));
        const moduleTitle = cellString(getCell(r, 'moduleTitle'));
        const chapterTitle = cellString(getCell(r, 'chapterTitle'));

        if (!lessonTitle && !moduleTitle && !chapterTitle) continue;

        if (moduleTitle && (!curMod || curMod.title !== moduleTitle)) {
            moduleOrder += 1;
            chapterOrder = 0;
            lessonOrder = 0;
            curMod = {
                order: moduleOrder,
                code: cellString(getCell(r, 'moduleCode')),
                title: moduleTitle,
                chapters: [],
            };
            modules.push(curMod);
            curChap = null;
        }

        if (!curMod) {
            errors.push({
                sheet: sheetName,
                row: r + 1,
                message: 'Module Title must appear before the first lesson.',
            });
            continue;
        }

        if (chapterTitle && (!curChap || curChap.title !== chapterTitle)) {
            chapterOrder += 1;
            lessonOrder = 0;
            curChap = {
                order: chapterOrder,
                code: cellString(getCell(r, 'chapterCode')),
                title: chapterTitle,
                lessons: [],
            };
            curMod.chapters.push(curChap);
        }

        if (!curChap) {
            errors.push({
                sheet: sheetName,
                row: r + 1,
                message: 'Chapter Title must appear before the first lesson.',
            });
            continue;
        }

        if (!lessonTitle) continue;

        lessonOrder += 1;
        const lesson: LessonInput = {
            order: lessonOrder,
            entry_type: normalizeEntryType(getCell(r, 'entryType')),
            title: lessonTitle,
            objectives: cellString(getCell(r, 'objectives')),
            hands_on_activities: cellString(getCell(r, 'handsOnActivities')),
            digital_resource_available: cellBool(getCell(r, 'digitalResourceAvailable')),
            digital_resources_used: cellString(getCell(r, 'digitalResourcesUsed')),
            week_number: cellInt(getCell(r, 'week')),
            periods_count: cellInt(getCell(r, 'periods')) ?? 1,
        };
        curChap.lessons.push(lesson);
    }

    return { meta, modules };
}

async function resolveSubjectAndClass(
    subjectName: string,
    className: string,
): Promise<{ subject_id: number; class_id: number }> {
    const subject = await prisma.subject.findFirst({
        where: { name: { equals: subjectName, mode: 'insensitive' } },
        select: { id: true },
    });
    if (!subject) throw new Error(`Subject "${subjectName}" not found.`);

    const klass = await prisma.class.findFirst({
        where: { name: { equals: className, mode: 'insensitive' } },
        select: { id: true },
    });
    if (!klass) throw new Error(`Class "${className}" not found.`);

    return { subject_id: subject.id, class_id: klass.id };
}

export interface ImportOptions {
    academic_year_id?: number;
    replace?: boolean;
}

export async function importFromBuffer(
    buffer: Buffer,
    options: ImportOptions,
    created_by_id: number,
): Promise<ImportResult> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result: ImportResult = { created: [], errors: [] };

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];

        let parsed: ParsedScheme;
        try {
            parsed = parseSheet(sheet, sheetName, result.errors);
        } catch (err: any) {
            result.errors.push({ sheet: sheetName, row: 0, message: err.message ?? String(err) });
            continue;
        }

        let ids: { subject_id: number; class_id: number };
        try {
            ids = await resolveSubjectAndClass(parsed.meta.subjectName, parsed.meta.className);
        } catch (err: any) {
            result.errors.push({ sheet: sheetName, row: 0, message: err.message ?? String(err) });
            continue;
        }

        const payload: SchemeBulkPayload = {
            subject_id: ids.subject_id,
            class_id: ids.class_id,
            academic_year_id: options.academic_year_id,
            periods_per_week: parsed.meta.periodsPerWeek,
            annual_teaching_hours: parsed.meta.annualTeachingHours,
            notes: parsed.meta.notes ?? null,
            replace: options.replace ?? false,
            modules: parsed.modules.map((m) => ({
                order: m.order,
                code: m.code,
                title: m.title,
                chapters: m.chapters.map((c) => ({
                    order: c.order,
                    code: c.code,
                    title: c.title,
                    lessons: c.lessons,
                })),
            })),
        };

        try {
            const scheme = await bulkCreateOrReplaceScheme(payload, created_by_id);
            const lessonCount = parsed.modules.reduce(
                (sum, m) => sum + m.chapters.reduce((s, c) => s + c.lessons.length, 0),
                0,
            );
            result.created.push({
                sheet: sheetName,
                scheme_id: scheme.id,
                subject_id: ids.subject_id,
                class_id: ids.class_id,
                module_count: parsed.modules.length,
                lesson_count: lessonCount,
            });
        } catch (err: any) {
            result.errors.push({
                sheet: sheetName,
                row: 0,
                message: err.message ?? 'Failed to persist scheme.',
            });
        }
    }

    return result;
}

/**
 * Builds an empty Excel template with the expected metadata block, header row,
 * and one example data row showing the format. Returned as a Buffer to be sent
 * with Content-Disposition: attachment.
 */
export function buildTemplateWorkbook(): Buffer {
    const wb = XLSX.utils.book_new();

    const aoa: Array<Array<string | number | null>> = [
        ['Subject', 'Physics'],
        ['Class', 'Form 1'],
        ['Periods Per Week', 2],
        ['Annual Teaching Hours', 50],
        ['Notes', '2025/2026 National Harmonised Progression'],
        [],
        [
            'Module Code',
            'Module Title',
            'Chapter Code',
            'Chapter Title',
            'Lesson Title',
            'Entry Type',
            'Term',
            'Week',
            'Periods',
            'Objectives',
            'Hands-On Activities',
            'Digital Resource Available',
            'Digital Resources Used',
        ],
        [
            'MODULE I',
            'The World of Science',
            'Chap 1',
            'Introduction to sciences',
            'First contact with the learners, definition and branches of science',
            'LESSON',
            'First',
            1,
            1,
            'Prominent scientists; discoveries and contributions',
            'Stick-in-water demo; prism spectrum',
            'Available',
            null,
        ],
        [
            null,
            null,
            null,
            null,
            'Activity of Integration',
            'INTEGRATION',
            'First',
            6,
            1,
            null,
            null,
            null,
            null,
        ],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet['!cols'] = [
        { wch: 14 },
        { wch: 28 },
        { wch: 14 },
        { wch: 28 },
        { wch: 45 },
        { wch: 14 },
        { wch: 10 },
        { wch: 8 },
        { wch: 8 },
        { wch: 40 },
        { wch: 32 },
        { wch: 20 },
        { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, sheet, 'Form 1 - Physics');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
