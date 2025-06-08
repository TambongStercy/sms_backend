// scripts/migrate-student-status.ts
import { migrateExistingStudentsFirstEnrollmentYear } from '../src/utils/studentStatus';
import prisma from '../src/config/db';

async function main() {
    try {
        console.log('Starting student status migration...');
        
        // Migrate existing students' first enrollment year
        await migrateExistingStudentsFirstEnrollmentYear();
        
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
