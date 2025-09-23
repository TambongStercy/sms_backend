// import-students-and-fees.ts
import { PrismaClient } from '@prisma/client';
import { importClassList } from './import-class-list';
import { importFeePayments } from './import-fee-payments';
import { cleanupImportedStudents } from './src/utils/importUtils';

const prisma = new PrismaClient();

/**
 * Unified import coordinator for both class lists and fee payments
 * Handles the complete workflow: students → enrollments → fees → payments
 */

interface UnifiedImportSummary {
    classListImport?: any;
    feePaymentImport?: any;
    totalStudentsProcessed: number;
    totalPaymentsProcessed: number;
    totalAmountProcessed: number;
    success: boolean;
    errors: string[];
}

/**
 * Import both class list and fee payments in the correct order
 */
async function importStudentsAndFees(
    classListExcelPath: string,
    feePaymentsExcelPath: string,
    options: {
        cleanup?: boolean;
        academicYearId?: number;
        skipClassList?: boolean;
        skipFeePayments?: boolean;
        autoCreateSubclasses?: boolean;
    } = {}
): Promise<UnifiedImportSummary> {

    const summary: UnifiedImportSummary = {
        totalStudentsProcessed: 0,
        totalPaymentsProcessed: 0,
        totalAmountProcessed: 0,
        success: false,
        errors: []
    };

    try {
        console.log('🚀 Starting unified student and fee import process...');
        console.log('='.repeat(60));

        // Get academic year info
        const academicYear = options.academicYearId
            ? await prisma.academicYear.findUnique({ where: { id: options.academicYearId } })
            : await prisma.academicYear.findFirst({ where: { is_current: true } });

        if (!academicYear) {
            throw new Error('No academic year found. Please specify a valid academic year ID or ensure a current academic year exists.');
        }

        console.log(`📅 Using academic year: ${academicYear.name} (ID: ${academicYear.id})`);

        // Cleanup if requested
        if (options.cleanup) {
            console.log('\n🧹 Performing cleanup...');
            await cleanupImportedStudents(academicYear.id, 'SS25CL');
            console.log('✅ Cleanup completed');
        }

        // Phase 1: Import class list (students and enrollments)
        if (!options.skipClassList) {
            console.log('\n📚 PHASE 1: Importing class list...');
            console.log('='.repeat(40));

            try {
                summary.classListImport = await importClassList(
                    classListExcelPath,
                    false, // Don't cleanup again
                    academicYear.id
                );

                summary.totalStudentsProcessed =
                    summary.classListImport.studentsCreated +
                    summary.classListImport.studentsUpdated;

                console.log(`✅ Class list import completed: ${summary.totalStudentsProcessed} students processed`);

            } catch (error: any) {
                const errorMsg = `Class list import failed: ${error.message}`;
                console.error(`❌ ${errorMsg}`);
                summary.errors.push(errorMsg);

                if (!options.skipFeePayments) {
                    console.log('⚠️ Continuing to fee payments despite class list errors...');
                }
            }
        } else {
            console.log('\n⏭️ Skipping class list import as requested');
        }

        // Phase 2: Import fee payments
        if (!options.skipFeePayments) {
            console.log('\n💳 PHASE 2: Importing fee payments...');
            console.log('='.repeat(40));

            try {
                summary.feePaymentImport = await importFeePayments(
                    feePaymentsExcelPath,
                    academicYear.id
                );

                summary.totalPaymentsProcessed = summary.feePaymentImport.paymentsCreated;
                summary.totalAmountProcessed = summary.feePaymentImport.totalAmountProcessed;

                console.log(`✅ Fee payment import completed: ${summary.totalPaymentsProcessed} payments processed`);

            } catch (error: any) {
                const errorMsg = `Fee payment import failed: ${error.message}`;
                console.error(`❌ ${errorMsg}`);
                summary.errors.push(errorMsg);
            }
        } else {
            console.log('\n⏭️ Skipping fee payments import as requested');
        }

        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('🎯 UNIFIED IMPORT SUMMARY');
        console.log('='.repeat(60));

        if (summary.classListImport) {
            console.log('📚 CLASS LIST RESULTS:');
            console.log(`  ➕ Students Created: ${summary.classListImport.studentsCreated}`);
            console.log(`  🔄 Students Updated: ${summary.classListImport.studentsUpdated}`);
            console.log(`  📝 Enrollments Created: ${summary.classListImport.enrollmentsCreated}`);
            console.log(`  💰 Fees Created: ${summary.classListImport.feesCreated}`);
            console.log(`  📊 Processed Sheets: ${summary.classListImport.processedSheets.length}`);
        }

        if (summary.feePaymentImport) {
            console.log('\n💳 FEE PAYMENT RESULTS:');
            console.log(`  ✅ Students Found: ${summary.feePaymentImport.studentsFound}`);
            console.log(`  ➕ Students Created: ${summary.feePaymentImport.studentsCreated}`);
            console.log(`  ❌ Students Not Found: ${summary.feePaymentImport.studentsNotFound}`);
            console.log(`  🔄 Fees Updated: ${summary.feePaymentImport.feesUpdated}`);
            console.log(`  💰 Payments Created: ${summary.feePaymentImport.paymentsCreated}`);
            console.log(`  💵 Total Amount: ${summary.feePaymentImport.totalAmountProcessed.toLocaleString()} FCFA`);
            console.log(`  📊 Processed Sheets: ${summary.feePaymentImport.processedSheets.length}`);
        }

        console.log('\n🎯 OVERALL TOTALS:');
        console.log(`  👥 Total Students Processed: ${summary.totalStudentsProcessed}`);
        console.log(`  💳 Total Payments Created: ${summary.totalPaymentsProcessed}`);
        console.log(`  💰 Total Amount Processed: ${summary.totalAmountProcessed.toLocaleString()} FCFA`);
        console.log(`  ❌ Total Errors: ${summary.errors.length}`);

        if (summary.errors.length > 0) {
            console.log('\n❌ ERRORS ENCOUNTERED:');
            summary.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        summary.success = summary.errors.length === 0;

        if (summary.success) {
            console.log('\n🎉 Import process completed successfully!');
        } else {
            console.log('\n⚠️ Import process completed with errors. Please review the errors above.');
        }

        return summary;

    } catch (error: any) {
        console.error('❌ Unified import process failed:', error.message);
        summary.errors.push(`Critical error: ${error.message}`);
        summary.success = false;
        return summary;
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);

    const cleanupFlag = args.includes('--cleanup') || args.includes('--clean');
    const helpFlag = args.includes('--help') || args.includes('-h');
    const skipClassListFlag = args.includes('--skip-class-list');
    const skipFeePaymentsFlag = args.includes('--skip-fee-payments');
    const autoCreateSubclassesFlag = args.includes('--auto-create-subclasses') || args.includes('--auto-subclasses');
    const academicYearId = args.find(arg => arg.startsWith('--year='))?.split('=')[1];

    // Get file paths (non-flag arguments)
    const filePaths = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (helpFlag) {
        console.log(`
📖 USAGE: npx ts-node import-students-and-fees.ts [OPTIONS] <class-list-file> <fee-payments-file>

🔧 OPTIONS:
  --cleanup, --clean         Delete existing imported students before importing
  --year=<id>               Use specific academic year ID (defaults to current)
  --skip-class-list         Skip class list import (only import fee payments)
  --skip-fee-payments       Skip fee payments import (only import class list)
  --auto-create-subclasses  Automatically create missing subclasses (enabled by default)
  --help, -h                Show this help message

📝 EXAMPLES:
  # Import both files (recommended workflow)
  npx ts-node import-students-and-fees.ts \\
    "C:/path/to/Student Class list.xlsx" \\
    "C:/path/to/FEE RECORDE 2025-2026 v3.xlsx"

  # Cleanup and re-import everything
  npx ts-node import-students-and-fees.ts --cleanup \\
    "C:/path/to/Student Class list.xlsx" \\
    "C:/path/to/FEE RECORDE 2025-2026 v3.xlsx"

  # Only import fee payments (students already exist)
  npx ts-node import-students-and-fees.ts --skip-class-list \\
    "ignored" \\
    "C:/path/to/FEE RECORDE 2025-2026 v3.xlsx"

  # Only import class list (no payments yet)
  npx ts-node import-students-and-fees.ts --skip-fee-payments \\
    "C:/path/to/Student Class list.xlsx" \\
    "ignored"

🔄 WORKFLOW:
  1. Imports students and creates enrollments from class list
  2. Creates fee records based on class fee structure
  3. Updates fee records with payment data from fee file
  4. Creates individual payment transaction records

⚠️  WARNING: --cleanup will permanently delete all students with matricules
   starting with SS25CL and their related data.
        `);
        process.exit(0);
    }

    if (filePaths.length < 2) {
        console.log('❌ Error: Both class list and fee payments file paths are required');
        console.log('Use --help for usage information');
        process.exit(1);
    }

    const [classListPath, feePaymentsPath] = filePaths;

    importStudentsAndFees(classListPath, feePaymentsPath, {
        cleanup: cleanupFlag,
        academicYearId: academicYearId ? parseInt(academicYearId) : undefined,
        skipClassList: skipClassListFlag,
        skipFeePayments: skipFeePaymentsFlag,
        autoCreateSubclasses: autoCreateSubclassesFlag !== false // Default to true unless explicitly disabled
    })
        .then((summary) => {
            if (!summary.success) {
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Import process failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { importStudentsAndFees };