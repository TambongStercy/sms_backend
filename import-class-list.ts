// import-class-list.ts
import { PrismaClient, Gender } from '@prisma/client';
import { analyzeExcelFile } from './excel-analyzer';
import {
    mapSheetToSubClass,
    findHeaderRow,
    parseStudentFromRow,
    generateUniqueMatricule,
    extractPhoneNumber,
    cleanupImportedStudents,
    normalizeStudentName,
    findBestMatchingStudent,
    ParsedStudentData
} from './src/utils/importUtils';
import { createMissingSubclasses } from './quick-import-summary';
import { createOrUpdateFeeForEnrollment } from './src/api/v1/services/feeService';

const prisma = new PrismaClient();

/**
 * Import student class lists from Excel file
 * Creates students, enrollments, and initializes their fee records
 */

interface ImportSummary {
    studentsCreated: number;
    studentsUpdated: number;
    enrollmentsCreated: number;
    feesCreated: number;
    errors: string[];
    skippedSheets: string[];
    processedSheets: string[];
}

/**
 * Import a single student to a subclass
 */
async function importStudentToSubClass(
    studentData: ParsedStudentData,
    subClassId: number,
    classId: number,
    academicYearId: number
): Promise<{ created: boolean; enrollment?: any; error?: string }> {

    try {
        // Check if student already exists (fuzzy match)
        const existingMatch = await findBestMatchingStudent(studentData.name!, academicYearId, 80);

        let student;
        let created = false;

        if (existingMatch && existingMatch.similarity > 90) {
            // Use existing student
            student = existingMatch.student;
            console.log(`🔄 Found existing student: ${student.name} (${existingMatch.similarity}% match)`);
        } else {
            // Create new student
            const matricule = await generateUniqueMatricule('SS25CL');
            const parentPhone = extractPhoneNumber(studentData.phone || '');

            student = await prisma.student.create({
                data: {
                    matricule,
                    name: studentData.name!.trim(),
                    date_of_birth: new Date('2010-01-01'), // Default, should be updated later
                    place_of_birth: 'Unknown',
                    gender: Gender.Male, // Default, should be updated later
                    residence: 'Unknown',
                    former_school: null,
                    is_new_student: true,
                    status: 'NOT_ENROLLED',
                    first_enrollment_year_id: academicYearId,
                }
            });

            console.log(`➕ Created new student: ${student.name} (${matricule})`);
            created = true;
        }

        // Check if enrollment already exists for this academic year
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                student_id: student.id,
                academic_year_id: academicYearId
            }
        });

        let enrollment;

        if (existingEnrollment) {
            // Update existing enrollment with subclass assignment
            enrollment = await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    sub_class_id: subClassId,
                    class_id: classId
                }
            });
            console.log(`🔄 Updated enrollment for ${student.name} to subclass`);
        } else {
            // Create new enrollment
            enrollment = await prisma.enrollment.create({
                data: {
                    student_id: student.id,
                    academic_year_id: academicYearId,
                    class_id: classId,
                    sub_class_id: subClassId,
                    repeater: false,
                    enrollment_date: new Date(),
                }
            });
            console.log(`➕ Created enrollment for ${student.name}`);
        }

        // Update student status to enrolled
        await prisma.student.update({
            where: { id: student.id },
            data: { status: 'ENROLLED' }
        });

        // Create or update fee record based on class structure
        await createOrUpdateFeeForEnrollment(enrollment.id, classId);

        return { created, enrollment };

    } catch (error: any) {
        console.error(`❌ Error importing student ${studentData.name}:`, error.message);
        return { created: false, error: error.message };
    }
}

/**
 * Process a single Excel sheet
 */
async function processSheet(
    sheetName: string,
    sheetData: any,
    academicYearId: number
): Promise<{ studentsCreated: number; studentsUpdated: number; enrollments: number; fees: number; errors: string[] }> {

    console.log(`\n📚 Processing sheet: ${sheetName}`);

    // Map sheet name to subclass
    const subClassName = mapSheetToSubClass(sheetName);
    if (!subClassName) {
        console.log(`⚠️ No mapping found for sheet "${sheetName}", skipping...`);
        return { studentsCreated: 0, studentsUpdated: 0, enrollments: 0, fees: 0, errors: [`No mapping for sheet: ${sheetName}`] };
    }

    // Find subclass in database
    const subClass = await prisma.subClass.findFirst({
        where: { name: subClassName },
        include: { class: true }
    });

    if (!subClass) {
        const error = `SubClass "${subClassName}" not found in database`;
        console.log(`❌ ${error}`);
        return { studentsCreated: 0, studentsUpdated: 0, enrollments: 0, fees: 0, errors: [error] };
    }

    console.log(`✅ Found subclass: ${subClass.name} (Class: ${subClass.class.name})`);

    // Find headers in the sheet
    const headerInfo = findHeaderRow(sheetData.rawData || []);
    if (!headerInfo) {
        const error = `No headers found in sheet: ${sheetName}`;
        console.log(`❌ ${error}`);
        return { studentsCreated: 0, studentsUpdated: 0, enrollments: 0, fees: 0, errors: [error] };
    }

    const { headers, headerIndex } = headerInfo;
    console.log(`📋 Found headers at row ${headerIndex + 1}: ${headers.filter(h => h).join(', ')}`);

    // Process student rows
    let studentsCreated = 0;
    let studentsUpdated = 0;
    let enrollments = 0;
    let fees = 0;
    const errors: string[] = [];

    const dataRows = sheetData.rawData.slice(headerIndex + 1);

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.length === 0) continue;

        const studentData = parseStudentFromRow(row, headers);
        if (!studentData || !studentData.name) continue;

        try {
            const result = await importStudentToSubClass(
                studentData,
                subClass.id,
                subClass.class_id,
                academicYearId
            );

            if (result.error) {
                errors.push(`${studentData.name}: ${result.error}`);
            } else {
                if (result.created) {
                    studentsCreated++;
                } else {
                    studentsUpdated++;
                }
                enrollments++;
                fees++;
            }

        } catch (error: any) {
            const errorMsg = `${studentData.name}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
        }
    }

    // Update subclass current_students count
    await prisma.subClass.update({
        where: { id: subClass.id },
        data: { current_students: studentsCreated + studentsUpdated }
    });

    console.log(`✅ ${sheetName}: ${studentsCreated} created, ${studentsUpdated} updated, ${enrollments} enrollments, ${fees} fees`);

    return { studentsCreated, studentsUpdated, enrollments, fees, errors };
}

/**
 * Auto-detect and create missing subclasses from Excel sheets
 */
async function ensureSubclassesExist(excelData: any): Promise<void> {
    console.log('🔍 Checking for missing subclasses...');

    const sheetsToProcess = Object.keys(excelData.sheets).filter(sheetName =>
        !['Sheet1', 'Sheet2', 'Sheet3', 'Sheet4', 'Summary'].includes(sheetName)
    );

    const requiredSubclasses = sheetsToProcess
        .map(sheetName => mapSheetToSubClass(sheetName))
        .filter(subclassName => subclassName !== null) as string[];

    if (requiredSubclasses.length === 0) {
        console.log('✅ No subclasses required for import');
        return;
    }

    // Check which subclasses exist
    const existingSubclasses = await prisma.subClass.findMany({
        where: { name: { in: requiredSubclasses } },
        select: { name: true }
    });

    const existingNames = existingSubclasses.map(sc => sc.name);
    const missingSubclasses = requiredSubclasses.filter(name => !existingNames.includes(name));

    if (missingSubclasses.length > 0) {
        console.log(`⚠️ Found ${missingSubclasses.length} missing subclasses:`);
        missingSubclasses.forEach(name => console.log(`   - ${name}`));

        const created = await createMissingSubclasses(missingSubclasses);
        console.log(`✅ Auto-created ${created} missing subclasses\n`);
    } else {
        console.log('✅ All required subclasses already exist\n');
    }
}

/**
 * Main import function
 */
async function importClassList(
    excelFilePath: string,
    cleanup: boolean = false,
    academicYearId?: number
): Promise<ImportSummary> {

    try {
        console.log('🚀 Starting class list import...');

        // Analyze Excel file
        console.log('📊 Analyzing Excel file...');
        const excelData = analyzeExcelFile(excelFilePath);

        // Auto-create missing subclasses
        await ensureSubclassesExist(excelData);

        // Get current academic year
        const currentAcademicYear = await prisma.academicYear.findFirst({
            where: { is_current: true }
        });

        if (!currentAcademicYear) {
            throw new Error('No current academic year found. Please run the seed script first.');
        }

        const yearId = academicYearId || currentAcademicYear.id;
        console.log(`📅 Using academic year: ${currentAcademicYear.name} (ID: ${yearId})`);

        // Cleanup if requested
        if (cleanup) {
            await cleanupImportedStudents(yearId, 'SS25CL');
        }

        const summary: ImportSummary = {
            studentsCreated: 0,
            studentsUpdated: 0,
            enrollmentsCreated: 0,
            feesCreated: 0,
            errors: [],
            skippedSheets: [],
            processedSheets: []
        };

        // Process each sheet
        for (const [sheetName, sheetData] of Object.entries(excelData.sheets)) {
            // Skip obvious non-class sheets
            if (['Sheet1', 'Sheet2', 'Sheet3', 'Sheet4', 'Summary'].includes(sheetName)) {
                summary.skippedSheets.push(sheetName);
                continue;
            }

            try {
                const result = await processSheet(sheetName, sheetData as any, yearId);

                summary.studentsCreated += result.studentsCreated;
                summary.studentsUpdated += result.studentsUpdated;
                summary.enrollmentsCreated += result.enrollments;
                summary.feesCreated += result.fees;
                summary.errors.push(...result.errors);
                summary.processedSheets.push(sheetName);

            } catch (error: any) {
                console.error(`❌ Error processing sheet ${sheetName}:`, error.message);
                summary.errors.push(`Sheet ${sheetName}: ${error.message}`);
                summary.skippedSheets.push(sheetName);
            }
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 CLASS LIST IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Students Created: ${summary.studentsCreated}`);
        console.log(`Students Updated: ${summary.studentsUpdated}`);
        console.log(`Enrollments Created: ${summary.enrollmentsCreated}`);
        console.log(`Fees Created: ${summary.feesCreated}`);
        console.log(`Processed Sheets: ${summary.processedSheets.length}`);
        console.log(`Skipped Sheets: ${summary.skippedSheets.length}`);
        console.log(`Errors: ${summary.errors.length}`);

        if (summary.processedSheets.length > 0) {
            console.log('\nProcessed Sheets:');
            summary.processedSheets.forEach(sheet => console.log(`  ✅ ${sheet}`));
        }

        if (summary.skippedSheets.length > 0) {
            console.log('\nSkipped Sheets:');
            summary.skippedSheets.forEach(sheet => console.log(`  ⏭️ ${sheet}`));
        }

        if (summary.errors.length > 0) {
            console.log('\nErrors:');
            summary.errors.slice(0, 10).forEach(error => console.log(`  ❌ ${error}`));
            if (summary.errors.length > 10) {
                console.log(`  ... and ${summary.errors.length - 10} more errors`);
            }
        }

        console.log('\n✅ Class list import completed!');
        return summary;

    } catch (error: any) {
        console.error('❌ Import failed:', error.message);
        throw error;
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);

    const cleanupFlag = args.includes('--cleanup') || args.includes('--clean');
    const helpFlag = args.includes('--help') || args.includes('-h');
    const academicYearId = args.find(arg => arg.startsWith('--year='))?.split('=')[1];

    const excelFilePath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (helpFlag) {
        console.log(`
📖 USAGE: npx ts-node import-class-list.ts [OPTIONS] <path-to-excel-file>

🔧 OPTIONS:
  --cleanup, --clean      Delete existing imported students before importing
  --year=<id>            Use specific academic year ID (defaults to current)
  --no-auto-subclasses   Disable automatic subclass creation
  --help, -h             Show this help message

📝 EXAMPLES:
  # Import new class list (keeps existing)
  npx ts-node import-class-list.ts "C:/path/to/Student Class list.xlsx"

  # Cleanup and re-import
  npx ts-node import-class-list.ts --cleanup "C:/path/to/Student Class list.xlsx"

  # Import for specific academic year
  npx ts-node import-class-list.ts --year=1 "C:/path/to/Student Class list.xlsx"

⚠️  WARNING: --cleanup will permanently delete all students with matricules
   starting with SS25CL and their related enrollment and fee data.
        `);
        process.exit(0);
    }

    if (!excelFilePath) {
        console.log('❌ Error: Excel file path is required');
        console.log('Use --help for usage information');
        process.exit(1);
    }

    importClassList(
        excelFilePath,
        cleanupFlag,
        academicYearId ? parseInt(academicYearId) : undefined
    )
        .catch((error) => {
            console.error('Import failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { importClassList };