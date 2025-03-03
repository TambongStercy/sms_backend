import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function addTerms() {
    try {
        console.log('Starting to add terms...');

        // Check if terms already exist
        const existingTerms = await prisma.term.findMany();

        if (existingTerms.length >= 3) {
            console.log('Terms already exist in the database. Skipping creation.');
            return;
        }

        // Define the three terms
        const terms = [
            {
                name: 'First Term',
                number: 1,
                start_date: new Date('2023-09-01'),
                end_date: new Date('2023-12-31'),
            },
            {
                name: 'Second Term',
                number: 2,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-03-31'),
            },
            {
                name: 'Third Term',
                number: 3,
                start_date: new Date('2024-04-01'),
                end_date: new Date('2024-06-30'),
            },
        ];

        // Create terms if they don't exist
        for (const term of terms) {
            const existing = await prisma.term.findUnique({
                where: { number: term.number }
            });

            if (!existing) {
                await prisma.term.create({
                    data: term
                });
                console.log(`Created term: ${term.name}`);
            } else {
                console.log(`Term ${term.name} already exists. Skipping.`);
            }
        }

        console.log('Terms added successfully!');
    } catch (error) {
        console.error('Error adding terms:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
addTerms()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 