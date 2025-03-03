// populate-roles-terms.ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to populate Role and Term tables...');

    // Check if roles already exist to avoid duplicates
    const existingRoles = await prisma.userRole.count();

    // Populate Roles if none exist
    if (existingRoles === 0) {
        console.log('Populating roles...');

        const roles = [
            'SUPER_MANAGER',
            'MANAGER',
            'PRINCIPAL',
            'VICE_PRINCIPAL',
            'BURSAR',
            'TEACHER',
            'DISCIPLINE_MASTER',
            'GUIDANCE_COUNSELOR',
            'PARENT'
        ];

        // Create each role
        for (const role of roles) {
            await prisma.userRole.create({
                data: {
                    name: role,
                    description: `${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')} role in the system`
                }
            });
        }

        console.log('✅ Roles created successfully');
    } else {
        console.log('⚠️ Roles already exist in the database, skipping role creation');
    }

    // Check if terms already exist to avoid duplicates
    const existingTerms = await prisma.term.count();

    // Populate Terms if none exist
    if (existingTerms === 0) {
        console.log('Populating terms...');

        const currentYear = new Date().getFullYear();

        const terms = [
            {
                name: 'First Term',
                number: 1,
                start_date: new Date(`${currentYear}-09-01`),
                end_date: new Date(`${currentYear}-12-20`)
            },
            {
                name: 'Second Term',
                number: 2,
                start_date: new Date(`${currentYear + 1}-01-05`),
                end_date: new Date(`${currentYear + 1}-03-31`)
            },
            {
                name: 'Third Term',
                number: 3,
                start_date: new Date(`${currentYear + 1}-04-15`),
                end_date: new Date(`${currentYear + 1}-06-30`)
            }
        ];

        // Create each term
        for (const term of terms) {
            await prisma.term.create({
                data: term
            });
        }

        console.log('✅ Terms created successfully');
    } else {
        console.log('⚠️ Terms already exist in the database, skipping term creation');
    }

    console.log('✅ Population complete!');
}

main()
    .catch((e) => {
        console.error('Error populating database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 