// quick-import-summary.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Intelligently create missing subclasses by matching them to existing classes
 */
async function createMissingSubclasses(missingSubclasses: string[]): Promise<number> {
    if (missingSubclasses.length === 0) {
        console.log('✅ No missing subclasses to create');
        return 0;
    }

    console.log(`🔧 Creating ${missingSubclasses.length} missing subclasses...\n`);

    // Get all existing classes
    const classes = await prisma.class.findMany({
        select: { id: true, name: true }
    });

    console.log('📚 Available classes:');
    classes.forEach(cls => console.log(`   ${cls.id}: ${cls.name}`));
    console.log('');

    let createdCount = 0;

    for (const subclassName of missingSubclasses) {
        try {
            // Smart matching logic - extract base class name from subclass name
            let matchedClass = null;

            // Remove common suffixes and variations to get base class name
            const basePattern = subclassName
                .replace(/\s+(N|M|S|MN|MS|W|A\d+|S\d+)$/, '') // Remove section letters/numbers
                .trim();

            console.log(`🔍 Analyzing "${subclassName}" -> base pattern: "${basePattern}"`);

            // Try exact match first
            matchedClass = classes.find(cls => cls.name === basePattern);

            // If no exact match, try fuzzy matching with form variations
            if (!matchedClass) {
                // Handle "FORM X" vs "FORM X" variations
                const formPattern = basePattern.replace(/^FORM\s*/, '').trim();

                matchedClass = classes.find(cls => {
                    const className = cls.name.replace(/^FORM\s*/, '').trim();
                    return className === formPattern ||
                           cls.name.includes(formPattern) ||
                           formPattern.includes(className);
                });
            }

            // Special handling for sixth form classes
            if (!matchedClass && subclassName.includes('SIXTH')) {
                if (subclassName.includes('LOWER')) {
                    matchedClass = classes.find(cls => cls.name.includes('LOWER SIXTH'));
                } else if (subclassName.includes('UPPER')) {
                    matchedClass = classes.find(cls => cls.name.includes('UPPER SIXTH'));
                }
            }

            if (matchedClass) {
                console.log(`   ✅ Matched "${subclassName}" to class "${matchedClass.name}" (ID: ${matchedClass.id})`);

                // Create the subclass
                const newSubclass = await prisma.subClass.create({
                    data: {
                        name: subclassName,
                        class_id: matchedClass.id,
                        current_students: 0
                    }
                });

                console.log(`   ➕ Created subclass: ${newSubclass.name} (ID: ${newSubclass.id})`);
                createdCount++;

            } else {
                console.log(`   ❌ Could not find matching class for "${subclassName}"`);

                // Suggest possible matches
                console.log('   💡 Available classes for reference:');
                classes.forEach(cls => {
                    console.log(`      - ${cls.name}`);
                });
            }

        } catch (error: any) {
            console.error(`   ❌ Error creating subclass "${subclassName}": ${error.message}`);
        }

        console.log(''); // Add spacing between subclasses
    }

    console.log(`✅ Successfully created ${createdCount} out of ${missingSubclasses.length} missing subclasses\n`);
    return createdCount;
}

async function getImportSummary() {
    try {
        console.log('📊 Current Database Summary\n');

        // Get current academic year
        const academicYear = await prisma.academicYear.findFirst({
            where: { is_current: true }
        });

        if (!academicYear) {
            console.log('❌ No current academic year found');
            return;
        }

        console.log(`📅 Academic Year: ${academicYear.name} (ID: ${academicYear.id})\n`);

        // Count students by matricule prefix
        const totalStudents = await prisma.student.count();
        const importedStudents = await prisma.student.count({
            where: {
                matricule: { startsWith: 'SS25CL' }
            }
        });
        const originalStudents = await prisma.student.count({
            where: {
                matricule: { startsWith: 'SS25ST' }
            }
        });
        const otherStudents = totalStudents - importedStudents - originalStudents;

        console.log('👥 STUDENT SUMMARY:');
        console.log(`   Total Students: ${totalStudents}`);
        console.log(`   📚 Class List Imports (SS25CL): ${importedStudents}`);
        console.log(`   📋 Fee Record Imports (SS25ST): ${originalStudents}`);
        console.log(`   👤 Other Students: ${otherStudents}\n`);

        // Count enrollments for current academic year
        const totalEnrollments = await prisma.enrollment.count({
            where: { academic_year_id: academicYear.id }
        });

        const enrollmentsWithSubclass = await prisma.enrollment.count({
            where: {
                academic_year_id: academicYear.id,
                sub_class_id: { not: null }
            }
        });

        console.log('📚 ENROLLMENT SUMMARY:');
        console.log(`   Total Enrollments: ${totalEnrollments}`);
        console.log(`   With Subclass Assignment: ${enrollmentsWithSubclass}`);
        console.log(`   Pending Subclass Assignment: ${totalEnrollments - enrollmentsWithSubclass}\n`);

        // Count fees and payments
        const totalFees = await prisma.schoolFees.count({
            where: { academic_year_id: academicYear.id }
        });

        const totalPayments = await prisma.paymentTransaction.count({
            where: { academic_year_id: academicYear.id }
        });

        const feesWithPayments = await prisma.schoolFees.count({
            where: {
                academic_year_id: academicYear.id,
                amount_paid: { gt: 0 }
            }
        });

        console.log('💰 FEE SUMMARY:');
        console.log(`   Total Fee Records: ${totalFees}`);
        console.log(`   With Payments: ${feesWithPayments}`);
        console.log(`   Total Payment Transactions: ${totalPayments}\n`);

        // Check missing subclasses
        const subclasses = await prisma.subClass.findMany({
            select: { name: true, current_students: true }
        });

        const requiredSubclasses = [
            'FORM 1 N', 'FORM 1 M', 'FORM 1 S', 'FORM 1 MN', 'FORM 1 MS', 'FORM 1 W',
            'FORM 2 N', 'FORM 2 M', 'FORM 2 S', 'FORM 2 MN', 'FORM 2 MS',
            'FORM 3 N', 'FORM 3 M', 'FORM 3 S', 'FORM 3 MN', 'FORM 3 MS',
            'FORM 4 N', 'FORM 4 S', 'FORM 4 MS', 'FORM 4 MN',
            'FORM 5 N', 'FORM 5 M', 'FORM 5 S', 'FORM 5 MN', 'FORM 5 MS',
            'LOWER SIXTH A1', 'LOWER SIXTH A2', 'LOWER SIXTH S1', 'LOWER SIXTH S2',
            'UPPER SIXTH A1', 'UPPER SIXTH A2', 'UPPER SIXTH S1', 'UPPER SIXTH S2'
        ];

        const existingSubclassNames = subclasses.map(sc => sc.name);
        const missingSubclasses = requiredSubclasses.filter(name => !existingSubclassNames.includes(name));

        if (missingSubclasses.length > 0) {
            console.log('❌ MISSING SUBCLASSES:');
            missingSubclasses.forEach(name => console.log(`   - ${name}`));
            console.log('');

            return { missingSubclasses, academicYear, stats: {
                totalStudents, importedStudents, originalStudents, otherStudents,
                totalEnrollments, enrollmentsWithSubclass, totalFees, totalPayments, feesWithPayments
            }};
        }

        // Show subclasses with students
        const populatedSubclasses = subclasses.filter(sc => sc.current_students > 0);
        console.log('📊 POPULATED SUBCLASSES:');
        populatedSubclasses.forEach(sc => {
            console.log(`   ${sc.name}: ${sc.current_students} students`);
        });

        console.log(`\n✅ Summary completed!`);

        return { missingSubclasses: [], academicYear, stats: {
            totalStudents, importedStudents, originalStudents, otherStudents,
            totalEnrollments, enrollmentsWithSubclass, totalFees, totalPayments, feesWithPayments
        }};

    } catch (error: any) {
        console.error('❌ Error getting summary:', error.message);
        throw error;
    }
}

/**
 * Main function that can both show summary and create missing subclasses
 */
async function runImportSummary(createMissing: boolean = false) {
    try {
        const summary = await getImportSummary();

        if (summary && summary.missingSubclasses.length > 0) {
            if (createMissing) {
                const created = await createMissingSubclasses(summary.missingSubclasses);

                if (created > 0) {
                    console.log('🔄 Re-running summary after creating subclasses...\n');
                    await getImportSummary();
                }
            } else {
                console.log('💡 TIP: Run with --create-missing flag to automatically create missing subclasses');
                console.log('   Example: npx ts-node quick-import-summary.ts --create-missing\n');
            }
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const createMissing = args.includes('--create-missing') || args.includes('--create');
    const helpFlag = args.includes('--help') || args.includes('-h');

    if (helpFlag) {
        console.log(`
📖 USAGE: npx ts-node quick-import-summary.ts [OPTIONS]

🔧 OPTIONS:
  --create-missing, --create    Automatically create missing subclasses
  --help, -h                    Show this help message

📝 EXAMPLES:
  # Show summary only
  npx ts-node quick-import-summary.ts

  # Show summary and create missing subclasses
  npx ts-node quick-import-summary.ts --create-missing

🎯 FEATURES:
  - Shows current database status with student counts
  - Identifies missing subclasses needed for import
  - Intelligently matches subclasses to existing classes
  - Creates missing subclasses with proper relationships
        `);
        process.exit(0);
    }

    runImportSummary(createMissing)
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { getImportSummary, createMissingSubclasses, runImportSummary };