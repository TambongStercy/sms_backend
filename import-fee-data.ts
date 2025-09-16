import { PrismaClient, Gender } from '@prisma/client';
import { analyzeExcelFile } from './excel-analyzer';

const prisma = new PrismaClient();

/**
 * Import Fee Data from Excel to Database
 * Maps Excel sheet names to database subclass names and imports students with their payment records
 * Supports cleanup and re-import for updated data
 */

// Class mapping from Excel sheet names to database subclass names
const CLASS_MAPPING: Record<string, string> = {
    // Form 1
    '1N': 'FORM 1 N',
    '1M': 'FORM 1 M', 
    '1S': 'FORM 1 S',
    '1MN': 'FORM 1 MN',
    '1MS': 'FORM 1 MS',
    
    // Form 2
    '2N': 'FORM 2 N',
    '2S': 'FORM 2 S',
    '2MS': 'FORM 2 MS',
    '2MN': 'FORM 2 MN',
    '2M': 'FORM 2 M',
    
    // Form 3
    '3N': 'FORM 3 N',
    '3S': 'FORM 3 S',
    '3MN': 'FORM 3 MN',
    '3MS': 'FORM 3 MS',
    '3M': 'FORM 3 M',
    
    // Form 4
    '4N': 'FORM 4 N',
    '4S': 'FORM 4 S',
    '4MS': 'FORM 4 MS',
    '4MN': 'FORM 4 MN',
    
    // Form 5
    '5N': 'FORM 5 N',
    '5MN': 'FORM 5 MN',
    '5MS': 'FORM 5 MS',
    '5S': 'FORM 5 S',
    
    // Lower Sixth Arts (LSA = A1, LSS1/LSS2 might be A2 or S1/S2)
    'LSA': 'LOWER SIXTH A1',
    
    // Upper Sixth Arts/Science
    'USA1': 'UPPER SIXTH A1',
    'USA2': 'UPPER SIXTH A2',
    'USS1': 'UPPER SIXTH S1',
    'USS2': 'UPPER SIXTH S2',
};

interface StudentRecord {
    sn?: number;
    name?: string;
    status?: string; // Contains contact info
    totalExpected?: number;
    totalPaid?: number;
    debt?: number;
    parentContact?: string;
}

/**
 * Cleanup all imported fee data (students with SS25ST matricules)
 */
async function cleanupImportedData(academicYearId: number): Promise<void> {
    console.log('🧹 Cleaning up previously imported data...');

    // Find all students that were imported (auto-generated matricules starting with SS25ST)
    const importedStudents = await prisma.student.findMany({
        where: {
            matricule: {
                startsWith: 'SS25ST'
            }
        },
        include: {
            enrollments: {
                where: {
                    academic_year_id: academicYearId
                },
                include: {
                    school_fees: true,
                    payment_transactions: true
                }
            }
        }
    });

    console.log(`📊 Found ${importedStudents.length} imported students to clean up`);

    // Delete in correct order due to foreign key constraints
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

    // Reset subclass current_students count for affected subclasses
    const affectedSubClassIds = new Set(
        importedStudents.flatMap(s =>
            s.enrollments.map(e => e.sub_class_id).filter((id): id is number => id !== null)
        )
    );

    for (const subClassId of affectedSubClassIds) {
        await prisma.subClass.update({
            where: { id: subClassId },
            data: { current_students: 0 }
        });
    }

    console.log(`✅ Cleaned up ${importedStudents.length} students and related data`);
}

async function importFeeData(excelFilePath: string, cleanup: boolean = false) {
    try {
        console.log('🚀 Starting fee data import...');
        
        // Analyze Excel file
        console.log('📊 Analyzing Excel file...');
        const excelData = analyzeExcelFile(excelFilePath);
        
        // Get current academic year
        const currentAcademicYear = await prisma.academicYear.findFirst({
            where: { is_current: true }
        });
        
        if (!currentAcademicYear) {
            throw new Error('No current academic year found. Please run the seed script first.');
        }
        
        console.log(`📅 Using academic year: ${currentAcademicYear.name}`);

        // Cleanup existing data if requested
        if (cleanup) {
            await cleanupImportedData(currentAcademicYear.id);
        }

        let totalStudentsImported = 0;
        let totalPaymentsImported = 0;
        const importSummary: Record<string, { students: number; payments: number }> = {};
        
        // Process each sheet that has a mapping
        for (const [excelSheet, dbSubClassName] of Object.entries(CLASS_MAPPING)) {
            if (!excelData.sheets[excelSheet]) {
                console.log(`⚠️ Sheet "${excelSheet}" not found in Excel file, skipping...`);
                continue;
            }
            
            console.log(`\n📚 Processing ${excelSheet} → ${dbSubClassName}...`);
            
            // Find the subclass in database
            const subClass = await prisma.subClass.findFirst({
                where: { name: dbSubClassName },
                include: { class: true }
            });
            
            if (!subClass) {
                console.log(`❌ SubClass "${dbSubClassName}" not found in database, skipping...`);
                continue;
            }
            
            const sheetData = excelData.sheets[excelSheet];
            const students = parseStudentData(sheetData);
            
            let studentsImported = 0;
            let paymentsImported = 0;
            
            // Process each student
            for (const studentData of students) {
                if (!studentData.name || studentData.name.trim() === '') {
                    continue; // Skip empty rows
                }
                
                try {
                    const result = await importStudent(
                        studentData, 
                        subClass, 
                        currentAcademicYear.id
                    );
                    
                    if (result) {
                        studentsImported++;
                        if (result.paymentCreated) {
                            paymentsImported++;
                        }
                        totalStudentsImported++;
                        totalPaymentsImported += result.paymentCreated ? 1 : 0;
                    }
                } catch (error) {
                    console.error(`❌ Error importing student "${studentData.name}":`, error);
                }
            }
            
            // Update subclass current_students count
            await prisma.subClass.update({
                where: { id: subClass.id },
                data: { current_students: studentsImported }
            });
            
            importSummary[excelSheet] = { students: studentsImported, payments: paymentsImported };
            console.log(`✅ ${excelSheet}: ${studentsImported} students, ${paymentsImported} payments`);
        }
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Students Imported: ${totalStudentsImported}`);
        console.log(`Total Payments Imported: ${totalPaymentsImported}`);
        console.log('\nBy Class:');
        
        for (const [sheet, counts] of Object.entries(importSummary)) {
            console.log(`  ${sheet}: ${counts.students} students, ${counts.payments} payments`);
        }
        
        console.log('\n✅ Import completed successfully!');
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    }
}

function parseStudentData(sheetData: any): StudentRecord[] {
    const students: StudentRecord[] = [];
    
    // Use rawData instead of formattedData for better parsing
    const rawData = sheetData.rawData || [];
    
    // Find header row (usually row 1 or 2)
    let headerRowIndex = -1;
    let headers: string[] = [];
    
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        if (row && row.length > 0) {
            const hasNameColumn = row.some((cell: any) => 
                typeof cell === 'string' && 
                (cell.toUpperCase().includes('NAME') || cell === 'SN')
            );
            if (hasNameColumn) {
                headerRowIndex = i;
                headers = row.map((cell: any) => cell ? String(cell).toUpperCase() : '');
                break;
            }
        }
    }
    
    if (headerRowIndex === -1) {
        console.log('❌ Could not find header row in sheet');
        return students;
    }
    
    console.log(`📋 Found headers at row ${headerRowIndex + 1}:`, headers);
    
    // Parse data rows
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;
        
        // Create object from row data using headers
        const rowData: any = {};
        for (let j = 0; j < headers.length && j < row.length; j++) {
            if (headers[j]) {
                rowData[headers[j]] = row[j];
            }
        }
        
        // Skip if no name
        const name = rowData['NAME'] || rowData['STUDENT NAME'] || '';
        if (!name || typeof name !== 'string' || name.trim() === '') {
            continue;
        }
        
        const student: StudentRecord = {
            sn: parseInt(rowData['SN']) || undefined,
            name: String(name).trim(),
            status: String(rowData['STATUS'] || ''),
            totalExpected: parseFloat(rowData['TOTAL EXPECTED']) || 175000,
            totalPaid: parseFloat(rowData['TOTAL PAID']) || 0,
            debt: parseFloat(rowData['DEBTH 1ST INST'] || rowData['DEBT']) || 0,
            parentContact: String(rowData['PARENT CONTACT'] || rowData['STATUS'] || ''),
        };
        
        students.push(student);
    }
    
    console.log(`📊 Parsed ${students.length} student records`);
    return students;
}

async function importStudent(
    studentData: StudentRecord, 
    subClass: any, 
    academicYearId: number
): Promise<{ paymentCreated: boolean } | null> {
    
    // Generate matricule (format: SS25ST + sequential number)
    const studentCount = await prisma.student.count();
    const matricule = `SS25ST${String(studentCount + 1).padStart(4, '0')}`;
    
    // Extract phone number from status/contact
    const phoneMatch = studentData.parentContact?.match(/(\d{9,})/);
    const parentPhone = phoneMatch ? phoneMatch[1] : '000000000';
    
    // Create student
    const student = await prisma.student.create({
        data: {
            matricule,
            name: studentData.name!.trim(),
            date_of_birth: new Date('2010-01-01'), // Default DOB, should be updated later
            place_of_birth: 'Unknown', // Default, should be updated later
            gender: Gender.Male, // Default, should be updated later
            residence: 'Unknown', // Default, should be updated later
            former_school: null,
            is_new_student: true,
            status: 'ENROLLED',
            first_enrollment_year_id: academicYearId,
        }
    });
    
    // Create enrollment
    const enrollment = await prisma.enrollment.create({
        data: {
            student_id: student.id,
            academic_year_id: academicYearId,
            class_id: subClass.class_id,
            sub_class_id: subClass.id,
            repeater: false,
            enrollment_date: new Date(),
        }
    });
    
    // Create school fees record
    const schoolFees = await prisma.schoolFees.create({
        data: {
            amount_expected: studentData.totalExpected || 175000,
            amount_paid: studentData.totalPaid || 0,
            academic_year_id: academicYearId,
            due_date: new Date('2026-06-30'), // End of academic year
            enrollment_id: enrollment.id,
            is_new_student: true,
        }
    });
    
    // Create payment transaction if there's a paid amount
    let paymentCreated = false;
    if (studentData.totalPaid && studentData.totalPaid > 0) {
        // Get a default user for recorded_by (use admin user)
        const adminUser = await prisma.user.findFirst({
            where: { matricule: 'SS24CEO0001' }
        });
        
        if (adminUser) {
            await prisma.paymentTransaction.create({
                data: {
                    enrollment_id: enrollment.id,
                    academic_year_id: academicYearId,
                    amount: studentData.totalPaid,
                    payment_date: new Date(), // Default to today, should be updated with actual date
                    payment_method: 'CCA', // Default method
                    recorded_by_id: adminUser.id,
                    notes: `Imported from Excel - Original debt: ${studentData.debt || 0}`,
                    fee_id: schoolFees.id,
                }
            });
            paymentCreated = true;
        }
    }
    
    return { paymentCreated };
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);

    // Parse flags
    const cleanupFlag = args.includes('--cleanup') || args.includes('--clean');
    const helpFlag = args.includes('--help') || args.includes('-h');

    // Get excel file path (first non-flag argument)
    const excelFilePath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (helpFlag) {
        console.log(`
📖 USAGE: npx ts-node import-fee-data.ts [OPTIONS] <path-to-excel-file>

🔧 OPTIONS:
  --cleanup, --clean    Delete existing imported data before importing
  --help, -h           Show this help message

📝 EXAMPLES:
  # Import new data (keeps existing)
  npx ts-node import-fee-data.ts "C:/path/to/FEE RECORDE 2025-2026.xlsx"

  # Cleanup and re-import updated data
  npx ts-node import-fee-data.ts --cleanup "C:/path/to/UPDATED_FEE_RECORDE.xlsx"

⚠️  WARNING: --cleanup will permanently delete all students with matricules
   starting with SS25ST and their related enrollment, fee, and payment data.
        `);
        process.exit(0);
    }

    if (!excelFilePath) {
        console.log('❌ Error: Excel file path is required');
        console.log('Use --help for usage information');
        process.exit(1);
    }

    importFeeData(excelFilePath, cleanupFlag)
        .catch((error) => {
            console.error('Import failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { importFeeData };