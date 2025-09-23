// import-fee-payments.ts
import { PrismaClient, PaymentMethod, Gender } from '@prisma/client';
import { analyzeExcelFile } from './excel-analyzer';
import {
    mapSheetToSubClass,
    findHeaderRow,
    parseStudentFromRow,
    findBestMatchingStudent,
    generateUniqueMatricule,
    extractPhoneNumber,
    ParsedStudentData
} from './src/utils/importUtils';
import { createOrUpdateFeeForEnrollment } from './src/api/v1/services/feeService';
import { createMissingSubclasses } from './quick-import-summary';

const prisma = new PrismaClient();

/**
 * Import fee payment data from Excel file
 * Updates existing student fee records with payment information
 */

interface PaymentImportSummary {
    studentsFound: number;
    studentsNotFound: number;
    studentsCreated: number;
    feesUpdated: number;
    paymentsCreated: number;
    totalAmountProcessed: number;
    errors: string[];
    skippedSheets: string[];
    processedSheets: string[];
}

/**
 * Create a new student from payment data when not found in database
 */
async function createStudentFromPaymentData(
    studentData: ParsedStudentData,
    sheetName: string,
    academicYearId: number
): Promise<{ student: any; enrollment?: any; error?: string }> {

    try {
        // Generate unique matricule for payment-imported students
        const matricule = await generateUniqueMatricule('SS25FP'); // Fee Payment prefix

        // Create new student
        const student = await prisma.student.create({
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

        console.log(`  ➕ Created student from payment data: ${student.name} (${matricule})`);

        // Try to determine the subclass from sheet name
        const subClassName = mapSheetToSubClass(sheetName);
        let enrollment = null;

        if (subClassName) {
            // Find the subclass in database
            const subClass = await prisma.subClass.findFirst({
                where: { name: subClassName },
                include: { class: true }
            });

            if (subClass) {
                // Create enrollment
                enrollment = await prisma.enrollment.create({
                    data: {
                        student_id: student.id,
                        academic_year_id: academicYearId,
                        class_id: subClass.class_id,
                        sub_class_id: subClass.id,
                        repeater: false,
                        enrollment_date: new Date(),
                    }
                });

                // Update student status
                await prisma.student.update({
                    where: { id: student.id },
                    data: { status: 'ENROLLED' }
                });

                // Create fee record
                await createOrUpdateFeeForEnrollment(enrollment.id, subClass.class_id);

                console.log(`  📚 Created enrollment for ${student.name} in ${subClass.name}`);
            }
        }

        return { student, enrollment };

    } catch (error: any) {
        console.error(`  ❌ Error creating student ${studentData.name}:`, error.message);
        return { student: null, error: error.message };
    }
}

/**
 * Process individual payment amounts and create transactions
 */
async function processStudentPayments(
    student: any,
    studentData: ParsedStudentData,
    academicYearId: number,
    recordedById: number
): Promise<{ paymentsCreated: number; totalAmount: number }> {

    // Get student's enrollment and fee record for this academic year
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: student.id,
            academic_year_id: academicYearId
        },
        include: {
            school_fees: {
                where: { academic_year_id: academicYearId }
            }
        }
    });

    if (!enrollment) {
        throw new Error(`No enrollment found for student ${student.name} in current academic year`);
    }

    if (!enrollment.school_fees || enrollment.school_fees.length === 0) {
        throw new Error(`No fee record found for student ${student.name}`);
    }

    const feeRecord = enrollment.school_fees[0];
    let paymentsCreated = 0;
    let totalAmount = 0;

    // Create payment transactions for each amount
    const amounts = [
        { amount: studentData.amount1 || 0, label: 'First Installment' },
        { amount: studentData.amount2 || 0, label: 'Second Installment' },
        { amount: studentData.amount3 || 0, label: 'Third Installment' },
        { amount: studentData.amount4 || 0, label: 'Fourth Installment' }
    ];

    for (const { amount, label } of amounts) {
        if (amount > 0) {
            try {
                await prisma.paymentTransaction.create({
                    data: {
                        enrollment_id: enrollment.id,
                        academic_year_id: academicYearId,
                        amount: amount,
                        payment_date: new Date(), // Default to today, should be updated with actual date
                        payment_method: PaymentMethod.CCA, // Default method
                        recorded_by_id: recordedById,
                        notes: `${label} - Imported from Excel`,
                        fee_id: feeRecord.id,
                    }
                });

                totalAmount += amount;
                paymentsCreated++;
                console.log(`  💰 Created payment: ${amount} FCFA (${label})`);

            } catch (error: any) {
                console.warn(`  ⚠️ Could not create payment for ${amount} FCFA: ${error.message}`);
            }
        }
    }

    // Update the fee record with total paid amount
    if (studentData.totalPaid && studentData.totalPaid > 0) {
        await prisma.schoolFees.update({
            where: { id: feeRecord.id },
            data: {
                amount_paid: studentData.totalPaid
            }
        });
        console.log(`  📝 Updated total paid: ${studentData.totalPaid} FCFA`);
    }

    return { paymentsCreated, totalAmount };
}

/**
 * Process a single Excel sheet for fee payments
 */
async function processPaymentSheet(
    sheetName: string,
    sheetData: any,
    academicYearId: number,
    recordedById: number
): Promise<{
    studentsFound: number;
    studentsNotFound: number;
    studentsCreated: number;
    feesUpdated: number;
    paymentsCreated: number;
    totalAmount: number;
    errors: string[];
}> {

    console.log(`\n💳 Processing payment sheet: ${sheetName}`);

    // Map sheet name to subclass for context
    const subClassName = mapSheetToSubClass(sheetName);
    if (subClassName) {
        console.log(`📚 Mapped to subclass: ${subClassName}`);
    }

    // Find headers in the sheet
    const headerInfo = findHeaderRow(sheetData.rawData || []);
    if (!headerInfo) {
        const error = `No headers found in payment sheet: ${sheetName}`;
        console.log(`❌ ${error}`);
        return {
            studentsFound: 0,
            studentsNotFound: 0,
            studentsCreated: 0,
            feesUpdated: 0,
            paymentsCreated: 0,
            totalAmount: 0,
            errors: [error]
        };
    }

    const { headers, headerIndex } = headerInfo;
    console.log(`📋 Found headers at row ${headerIndex + 1}: ${headers.filter(h => h).join(', ')}`);

    // Process payment data rows
    let studentsFound = 0;
    let studentsNotFound = 0;
    let studentsCreated = 0;
    let feesUpdated = 0;
    let paymentsCreated = 0;
    let totalAmount = 0;
    const errors: string[] = [];

    const dataRows = sheetData.rawData.slice(headerIndex + 1);

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.length === 0) continue;

        const studentData = parseStudentFromRow(row, headers);
        if (!studentData || !studentData.name) continue;

        // Skip students with no payment data
        if (!studentData.totalPaid && !studentData.amount1 && !studentData.amount2 &&
            !studentData.amount3 && !studentData.amount4) {
            continue;
        }

        try {
            // Find matching student in database
            const matchResult = await findBestMatchingStudent(studentData.name, academicYearId, 80);

            let student;

            if (!matchResult) {
                console.log(`⚠️ Student not found: ${studentData.name} - Creating new student...`);

                // Create new student from payment data
                const createResult = await createStudentFromPaymentData(
                    studentData,
                    sheetName,
                    academicYearId
                );

                if (createResult.error) {
                    studentsNotFound++;
                    errors.push(`Failed to create student ${studentData.name}: ${createResult.error}`);
                    continue;
                }

                student = createResult.student;
                studentsCreated++;
                console.log(`✅ Created new student: ${student.name} (${student.matricule})`);

            } else {
                const { student: foundStudent, similarity } = matchResult;
                student = foundStudent;
                console.log(`✅ Found existing student: ${student.name} (${similarity}% match)`);
                studentsFound++;
            }

            // Process payments for this student
            const paymentResult = await processStudentPayments(
                student,
                studentData,
                academicYearId,
                recordedById
            );

            if (paymentResult.paymentsCreated > 0) {
                feesUpdated++;
                paymentsCreated += paymentResult.paymentsCreated;
                totalAmount += paymentResult.totalAmount;
            }

        } catch (error: any) {
            const errorMsg = `${studentData.name}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
        }
    }

    console.log(`✅ ${sheetName}: ${studentsFound} found, ${studentsCreated} created, ${studentsNotFound} failed, ${feesUpdated} fees updated, ${paymentsCreated} payments`);

    return {
        studentsFound,
        studentsNotFound,
        studentsCreated,
        feesUpdated,
        paymentsCreated,
        totalAmount,
        errors
    };
}

/**
 * Auto-detect and create missing subclasses from Excel sheets for fee payments
 */
async function ensureSubclassesExistForPayments(excelData: any): Promise<void> {
    console.log('🔍 Checking for missing subclasses in payment sheets...');

    const sheetsToProcess = Object.keys(excelData.sheets).filter(sheetName =>
        !['Sheet1', 'Sheet2', 'Sheet3', 'Sheet4', 'Summary'].includes(sheetName)
    );

    const requiredSubclasses = sheetsToProcess
        .map(sheetName => mapSheetToSubClass(sheetName))
        .filter(subclassName => subclassName !== null) as string[];

    if (requiredSubclasses.length === 0) {
        console.log('✅ No subclasses required for payment import');
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
        console.log(`⚠️ Found ${missingSubclasses.length} missing subclasses for payments:`);
        missingSubclasses.forEach(name => console.log(`   - ${name}`));

        const created = await createMissingSubclasses(missingSubclasses);
        console.log(`✅ Auto-created ${created} missing subclasses for payment processing\n`);
    } else {
        console.log('✅ All required subclasses already exist for payments\n');
    }
}

/**
 * Main fee payment import function
 */
async function importFeePayments(
    excelFilePath: string,
    academicYearId?: number
): Promise<PaymentImportSummary> {

    try {
        console.log('🚀 Starting fee payment import...');

        // Analyze Excel file
        console.log('📊 Analyzing Excel file...');
        const excelData = analyzeExcelFile(excelFilePath);

        // Auto-create missing subclasses
        await ensureSubclassesExistForPayments(excelData);

        // Get current academic year
        const currentAcademicYear = await prisma.academicYear.findFirst({
            where: { is_current: true }
        });

        if (!currentAcademicYear) {
            throw new Error('No current academic year found. Please run the seed script first.');
        }

        const yearId = academicYearId || currentAcademicYear.id;
        console.log(`📅 Using academic year: ${currentAcademicYear.name} (ID: ${yearId})`);

        // Get default admin user for recorded_by
        const adminUser = await prisma.user.findFirst({
            where: { matricule: 'SS24CEO0001' }
        });

        if (!adminUser) {
            throw new Error('Admin user not found. Please ensure the admin user exists.');
        }

        const summary: PaymentImportSummary = {
            studentsFound: 0,
            studentsNotFound: 0,
            studentsCreated: 0,
            feesUpdated: 0,
            paymentsCreated: 0,
            totalAmountProcessed: 0,
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

            // Skip empty sheets
            const typedSheetData = sheetData as any;
            if (!typedSheetData.rawData || typedSheetData.rawData.length < 2) {
                summary.skippedSheets.push(sheetName);
                continue;
            }

            try {
                const result = await processPaymentSheet(
                    sheetName,
                    typedSheetData,
                    yearId,
                    adminUser.id
                );

                summary.studentsFound += result.studentsFound;
                summary.studentsNotFound += result.studentsNotFound;
                summary.studentsCreated += result.studentsCreated;
                summary.feesUpdated += result.feesUpdated;
                summary.paymentsCreated += result.paymentsCreated;
                summary.totalAmountProcessed += result.totalAmount;
                summary.errors.push(...result.errors);
                summary.processedSheets.push(sheetName);

            } catch (error: any) {
                console.error(`❌ Error processing payment sheet ${sheetName}:`, error.message);
                summary.errors.push(`Sheet ${sheetName}: ${error.message}`);
                summary.skippedSheets.push(sheetName);
            }
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('💳 FEE PAYMENT IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Students Found: ${summary.studentsFound}`);
        console.log(`Students Created: ${summary.studentsCreated}`);
        console.log(`Students Not Found: ${summary.studentsNotFound}`);
        console.log(`Fees Updated: ${summary.feesUpdated}`);
        console.log(`Payments Created: ${summary.paymentsCreated}`);
        console.log(`Total Amount Processed: ${summary.totalAmountProcessed.toLocaleString()} FCFA`);
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

        console.log('\n✅ Fee payment import completed!');
        return summary;

    } catch (error: any) {
        console.error('❌ Payment import failed:', error.message);
        throw error;
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);

    const helpFlag = args.includes('--help') || args.includes('-h');
    const academicYearId = args.find(arg => arg.startsWith('--year='))?.split('=')[1];

    const excelFilePath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (helpFlag) {
        console.log(`
📖 USAGE: npx ts-node import-fee-payments.ts [OPTIONS] <path-to-excel-file>

🔧 OPTIONS:
  --year=<id>            Use specific academic year ID (defaults to current)
  --help, -h             Show this help message

📝 EXAMPLES:
  # Import fee payment data
  npx ts-node import-fee-payments.ts "C:/path/to/FEE RECORDE 2025-2026 v3.xlsx"

  # Import for specific academic year
  npx ts-node import-fee-payments.ts --year=1 "C:/path/to/FEE RECORDE 2025-2026 v3.xlsx"

📋 NOTES:
  - This script updates existing student fee records with payment information
  - Students must already exist in the database (run import-class-list.ts first)
  - Payment transactions are created for each installment amount
  - Uses fuzzy name matching to find students (minimum 80% similarity)
        `);
        process.exit(0);
    }

    if (!excelFilePath) {
        console.log('❌ Error: Excel file path is required');
        console.log('Use --help for usage information');
        process.exit(1);
    }

    importFeePayments(
        excelFilePath,
        academicYearId ? parseInt(academicYearId) : undefined
    )
        .catch((error) => {
            console.error('Payment import failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { importFeePayments };