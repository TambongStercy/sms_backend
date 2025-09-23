// src/utils/importUtils.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utility functions for Excel import operations
 */

// Enhanced class mapping from Excel sheet names to database subclass names
export const CLASS_SHEET_MAPPINGS = {
    // Fee payment file mappings (original format)
    '1W': 'FORM 1 W',
    '1N': 'FORM 1 N',
    '1M': 'FORM 1 M',
    '1S': 'FORM 1 S',
    '1MN': 'FORM 1 MN',
    '1MS': 'FORM 1 MS',

    '2N': 'FORM 2 N',
    '2S': 'FORM 2 S',
    '2MS': 'FORM 2 MS',
    '2MN': 'FORM 2 MN',
    '2M': 'FORM 2 M',

    '3N': 'FORM 3 N',
    '3S': 'FORM 3 S',
    '3MN': 'FORM 3 MN',
    '3MS': 'FORM 3 MS',
    '3M': 'FORM 3 M',

    '4N': 'FORM 4 N',
    '4S': 'FORM 4 S',
    '4MS': 'FORM 4 MS',
    '4MN': 'FORM 4 MN',

    '5N': 'FORM 5 N',
    '5MN': 'FORM 5 MN',
    '5MS': 'FORM 5 MS',
    '5S': 'FORM 5 S',

    'LSA': 'LOWER SIXTH A1',
    'LSA1': 'LOWER SIXTH A1',
    'LSA2': 'LOWER SIXTH A2',
    'LSS1': 'LOWER SIXTH S1',
    'LSS2': 'LOWER SIXTH S2',

    'USA1': 'UPPER SIXTH A1',
    'USA2': 'UPPER SIXTH A2',
    'USS1': 'UPPER SIXTH S1',
    'USS2': 'UPPER SIXTH S2',

    // Class list file mappings (F-prefixed format)
    'F1W': 'FORM 1 W',
    'F1N': 'FORM 1 N',
    'F1M': 'FORM 1 M',
    'F1S': 'FORM 1 S',
    'F1MN': 'FORM 1 MN',
    'F1MS': 'FORM 1 MS',

    'F2N': 'FORM 2 N',
    'F2S': 'FORM 2 S',
    'F2MS': 'FORM 2 MS',
    'F2MN': 'FORM 2 MN',
    'F2M': 'FORM 2 M',

    'F3N': 'FORM 3 N',
    'F3S': 'FORM 3 S',
    'F3MN': 'FORM 3 MN',
    'F3MS': 'FORM 3 MS',
    'F3M': 'FORM 3 M',

    'F4N': 'FORM 4 N',
    'F4S': 'FORM 4 S',
    'F4MS': 'FORM 4 MS',
    'F4MN': 'FORM 4 MN',

    'F5N': 'FORM 5 N',
    'F5MN': 'FORM 5 MN',
    'F5MS': 'FORM 5 MS',
    'F5M': 'FORM 5 M',
    'F5S': 'FORM 5 S',

    'LSA 1': 'LOWER SIXTH A1',
    'LSA 2': 'LOWER SIXTH A2',
    'LSS 1': 'LOWER SIXTH S1',
    'LSS 2': 'LOWER SIXTH S2',

    'USA 1': 'UPPER SIXTH A1',
    'USA 2': 'UPPER SIXTH A2',
    'USS 1': 'UPPER SIXTH S1',
    'USS 2': 'UPPER SIXTH S2',
};

/**
 * Normalize student name for comparison
 */
export function normalizeStudentName(name: string): string {
    if (!name || typeof name !== 'string') return '';

    return name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ')           // Multiple spaces to single space
        .replace(/[^\w\s'-]/g, '')      // Keep only alphanumeric, spaces, hyphens, apostrophes
        .replace(/\b(MR|MS|MRS|DR|PROF)\b/g, '') // Remove titles
        .trim();
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
        matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,         // deletion
                matrix[j - 1][i] + 1,         // insertion
                matrix[j - 1][i - 1] + indicator, // substitution
            );
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Calculate string similarity percentage
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = normalizeStudentName(str1);
    const normalized2 = normalizeStudentName(str2);

    if (normalized1 === normalized2) return 100;
    if (!normalized1 || !normalized2) return 0;

    const maxLength = Math.max(normalized1.length, normalized2.length);
    const distance = levenshteinDistance(normalized1, normalized2);

    return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Find best matching student in database by name
 */
export async function findBestMatchingStudent(
    studentName: string,
    academicYearId: number,
    minSimilarity: number = 85
): Promise<{ student: any; similarity: number } | null> {

    const normalizedSearchName = normalizeStudentName(studentName);

    // First try exact match
    const exactMatch = await prisma.student.findFirst({
        where: {
            name: {
                equals: studentName,
                mode: 'insensitive'
            }
        },
        include: {
            enrollments: {
                where: { academic_year_id: academicYearId },
                include: {
                    sub_class: {
                        include: { class: true }
                    }
                }
            }
        }
    });

    if (exactMatch) {
        return { student: exactMatch, similarity: 100 };
    }

    // Get all students and find best match
    const allStudents = await prisma.student.findMany({
        include: {
            enrollments: {
                where: { academic_year_id: academicYearId },
                include: {
                    sub_class: {
                        include: { class: true }
                    }
                }
            }
        }
    });

    let bestMatch = null;
    let bestSimilarity = 0;

    for (const student of allStudents) {
        const similarity = calculateSimilarity(studentName, student.name);

        if (similarity >= minSimilarity && similarity > bestSimilarity) {
            bestMatch = student;
            bestSimilarity = similarity;
        }
    }

    return bestMatch ? { student: bestMatch, similarity: bestSimilarity } : null;
}

/**
 * Parse student data from Excel row based on column headers
 */
export interface ParsedStudentData {
    serialNumber?: number;
    name?: string;
    status?: string;
    totalExpected?: number;
    totalPaid?: number;
    debt?: number;
    phone?: string;
    amount1?: number;
    amount2?: number;
    amount3?: number;
    amount4?: number;
}

export function parseStudentFromRow(row: any[], headers: string[]): ParsedStudentData | null {
    if (!row || !headers || row.length === 0) return null;

    const student: ParsedStudentData = {};

    // Create a mapping object for easier access
    const rowData: any = {};
    for (let i = 0; i < headers.length && i < row.length; i++) {
        if (headers[i]) {
            rowData[headers[i].toUpperCase()] = row[i];
        }
    }

    // Extract name - multiple possible column names
    const name = rowData['NAME'] || rowData['NAMES'] || rowData['STUDENT NAME'];
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return null; // Skip rows without valid names
    }

    // Clean the name: remove ellipsis and extra spaces
    let cleanedName = String(name).trim();

    // Warning if name appears truncated
    if (cleanedName.endsWith('…') || cleanedName.endsWith('...')) {
        console.warn(`⚠️ Warning: Name appears truncated: "${cleanedName}"`);
        // Remove the ellipsis but keep the name for matching
        cleanedName = cleanedName.replace(/[…\.]+$/, '').trim();
    }

    student.name = cleanedName;
    student.serialNumber = parseInt(rowData['SN'] || rowData['S/N']) || undefined;
    student.status = String(rowData['STATUS'] || '');
    student.phone = String(rowData['TELL'] || rowData['PHONE'] || rowData['PARENT CONTACT'] || '');

    // Parse financial data
    student.totalExpected = parseFloat(rowData['TOTAL EXPECTED']) || 175000; // Default fee
    student.totalPaid = parseFloat(rowData['TOTAL PAID']) || 0;
    student.debt = parseFloat(rowData['DEBTH 1ST INST'] || rowData['DEBT'] || rowData['TOTAL DEPT']) || 0;

    // Parse individual payment amounts
    student.amount1 = parseFloat(rowData['AMOUNT 1'] || rowData['AMOUNT1']) || 0;
    student.amount2 = parseFloat(rowData['AMOUNT 2'] || rowData['AMOUNT2']) || 0;
    student.amount3 = parseFloat(rowData['AMOUNT 3'] || rowData['AMOUNT3']) || 0;
    student.amount4 = parseFloat(rowData['AMOUNT 4'] || rowData['AMOUNT4']) || 0;

    return student;
}

/**
 * Find headers in Excel sheet data
 */
export function findHeaderRow(sheetData: any[]): { headers: string[]; headerIndex: number } | null {
    if (!sheetData || sheetData.length === 0) return null;

    // Look for header row in first 5 rows
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
        const row = sheetData[i];
        if (!row || row.length === 0) continue;

        // Check if this row contains typical header words
        const hasNameColumn = row.some((cell: any) =>
            typeof cell === 'string' &&
            /^(NAME|NAMES|STUDENT.*NAME|S\/N|SN)$/i.test(cell.trim())
        );

        if (hasNameColumn) {
            const headers = row.map((cell: any) =>
                cell ? String(cell).toUpperCase().trim() : ''
            );
            return { headers, headerIndex: i };
        }
    }

    return null;
}

/**
 * Generate unique matricule for imported students
 */
export async function generateUniqueMatricule(prefix: string = 'SS25CL'): Promise<string> {
    const studentCount = await prisma.student.count({
        where: {
            matricule: {
                startsWith: prefix
            }
        }
    });

    return `${prefix}${String(studentCount + 1).padStart(4, '0')}`;
}

/**
 * Extract phone number from various text formats
 */
export function extractPhoneNumber(text: string): string {
    if (!text || typeof text !== 'string') return '000000000';

    // Look for Cameroon phone number patterns
    const phoneMatch = text.match(/(\+?237)?[\s\-]?([6-9][0-9]{8})/);
    if (phoneMatch) {
        return phoneMatch[2]; // Return the 9-digit part
    }

    // Fallback to any 9-digit number
    const fallbackMatch = text.match(/(\d{9})/);
    return fallbackMatch ? fallbackMatch[1] : '000000000';
}

/**
 * Map Excel sheet name to database subclass name
 */
export function mapSheetToSubClass(sheetName: string): string | null {
    const normalizedSheet = sheetName.trim().toUpperCase();

    // Direct mapping
    if (CLASS_SHEET_MAPPINGS[sheetName]) {
        return CLASS_SHEET_MAPPINGS[sheetName];
    }

    // Try normalized version
    if (CLASS_SHEET_MAPPINGS[normalizedSheet]) {
        return CLASS_SHEET_MAPPINGS[normalizedSheet];
    }

    // Try with spaces removed/added for LSA/LSS/USA/USS
    const withoutSpaces = normalizedSheet.replace(/\s+/g, '');
    const withSpaces = normalizedSheet.replace(/(\w)(\d)/, '$1 $2');

    if (CLASS_SHEET_MAPPINGS[withoutSpaces]) {
        return CLASS_SHEET_MAPPINGS[withoutSpaces];
    }

    if (CLASS_SHEET_MAPPINGS[withSpaces]) {
        return CLASS_SHEET_MAPPINGS[withSpaces];
    }

    return null;
}

/**
 * Cleanup imported students by prefix
 */
export async function cleanupImportedStudents(academicYearId: number, matriculePrefix: string): Promise<number> {
    console.log(`🧹 Cleaning up students with matricule prefix: ${matriculePrefix}`);

    const importedStudents = await prisma.student.findMany({
        where: {
            matricule: {
                startsWith: matriculePrefix
            }
        },
        include: {
            enrollments: {
                where: { academic_year_id: academicYearId },
                include: {
                    school_fees: true,
                    payment_transactions: true
                }
            }
        }
    });

    console.log(`📊 Found ${importedStudents.length} students to clean up`);

    for (const student of importedStudents) {
        for (const enrollment of student.enrollments) {
            // Delete payment transactions first
            await prisma.paymentTransaction.deleteMany({
                where: { enrollment_id: enrollment.id }
            });

            // Delete school fees
            await prisma.schoolFees.deleteMany({
                where: { enrollment_id: enrollment.id }
            });

            // Delete enrollment
            await prisma.enrollment.delete({
                where: { id: enrollment.id }
            });
        }

        // Delete student
        await prisma.student.delete({
            where: { id: student.id }
        });
    }

    console.log(`✅ Cleaned up ${importedStudents.length} students`);
    return importedStudents.length;
}

export default {
    CLASS_SHEET_MAPPINGS,
    normalizeStudentName,
    calculateSimilarity,
    findBestMatchingStudent,
    parseStudentFromRow,
    findHeaderRow,
    generateUniqueMatricule,
    extractPhoneNumber,
    mapSheetToSubClass,
    cleanupImportedStudents
};