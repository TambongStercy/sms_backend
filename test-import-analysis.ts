// test-import-analysis.ts
import { analyzeExcelFile } from './excel-analyzer';
import {
    mapSheetToSubClass,
    findHeaderRow,
    parseStudentFromRow,
    normalizeStudentName,
    calculateSimilarity
} from './src/utils/importUtils';

/**
 * Test and validate the import analysis functionality
 */

async function testAnalysis() {
    console.log('🧪 Testing import analysis...\n');

    // Test Excel file analysis
    console.log('📊 Testing Excel file analysis...');

    try {
        const classListPath = "c:/Users/LENOVO/Downloads/Student Class list.xlsx";
        const feePaymentsPath = "c:/Users/LENOVO/Downloads/FEE RECORDE 2025-2026 v3.xlsx";

        console.log('\n1. Analyzing class list file...');
        const classData = analyzeExcelFile(classListPath);
        console.log(`   Found ${classData.totalSheets} sheets in class list`);

        console.log('\n2. Analyzing fee payments file...');
        const feeData = analyzeExcelFile(feePaymentsPath);
        console.log(`   Found ${feeData.totalSheets} sheets in fee payments`);

        // Test sheet mapping
        console.log('\n🗺️ Testing sheet name mappings...');
        const testSheets = ['F1N', '1N', 'F2MS', '2MS', 'LSA 1', 'LSA1', 'USS2', 'USS 2'];

        for (const sheet of testSheets) {
            const mapped = mapSheetToSubClass(sheet);
            console.log(`   ${sheet} → ${mapped || 'NOT MAPPED'}`);
        }

        // Test header detection
        console.log('\n📋 Testing header detection...');
        const sampleSheets = ['F1N', '1N'];

        for (const sheetName of sampleSheets) {
            const classSheet = classData.sheets[sheetName] as any;
            const feeSheet = feeData.sheets[sheetName] as any;

            if (classSheet) {
                const headerInfo = findHeaderRow(classSheet.rawData || []);
                if (headerInfo) {
                    console.log(`   Class ${sheetName}: Headers at row ${headerInfo.headerIndex + 1}`);
                    console.log(`     ${headerInfo.headers.filter(h => h).slice(0, 5).join(', ')}...`);
                } else {
                    console.log(`   Class ${sheetName}: No headers found`);
                }
            }

            if (feeSheet) {
                const headerInfo = findHeaderRow(feeSheet.rawData || []);
                if (headerInfo) {
                    console.log(`   Fee ${sheetName}: Headers at row ${headerInfo.headerIndex + 1}`);
                    console.log(`     ${headerInfo.headers.filter(h => h).slice(0, 5).join(', ')}...`);
                } else {
                    console.log(`   Fee ${sheetName}: No headers found`);
                }
            }
        }

        // Test student data parsing
        console.log('\n👤 Testing student data parsing...');
        const testSheet = classData.sheets['F1N'] as any;
        if (testSheet) {
            const headerInfo = findHeaderRow(testSheet.rawData || []);
            if (headerInfo) {
                const dataRows = testSheet.rawData.slice(headerInfo.headerIndex + 1);

                // Parse first few students
                for (let i = 0; i < Math.min(3, dataRows.length); i++) {
                    const row = dataRows[i];
                    if (row && row.length > 0) {
                        const studentData = parseStudentFromRow(row, headerInfo.headers);
                        if (studentData && studentData.name) {
                            console.log(`   Student ${i + 1}: ${studentData.name}`);
                            console.log(`     Expected: ${studentData.totalExpected}, Paid: ${studentData.totalPaid}`);
                            console.log(`     Phone: ${studentData.phone}`);
                        }
                    }
                }
            }
        }

        // Test name similarity
        console.log('\n🔍 Testing name similarity matching...');
        const testNames = [
            ['JOHN DOE SMITH', 'JOHN DOE SMITH', 100],
            ['JOHN DOE SMITH', 'john doe smith', 100],
            ['JOHN DOE SMITH', 'JOHN D. SMITH', 85],
            ['MARIE CLAIRE MBOLE', 'MARIE CLAIRE MBOLA', 95],
            ['COMPLETELY DIFFERENT', 'ANOTHER NAME', 0]
        ];

        for (const [name1, name2, expected] of testNames) {
            const similarity = calculateSimilarity(name1 as string, name2 as string);
            const status = Math.abs(similarity - (expected as number)) < 10 ? '✅' : '❌';
            console.log(`   ${status} "${name1}" vs "${name2}": ${similarity.toFixed(1)}% (expected ~${expected}%)`);
        }

        console.log('\n✅ Analysis test completed successfully!');

    } catch (error: any) {
        console.error('\n❌ Analysis test failed:', error.message);
        throw error;
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testAnalysis()
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

export { testAnalysis };