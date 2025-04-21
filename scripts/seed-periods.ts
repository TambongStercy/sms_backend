// scripts/seed-periods.ts
import { PrismaClient, DayOfWeek } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface PeriodData {
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

async function main() {
    console.log('Starting to seed periods...');

    // Define periods
    const periods: PeriodData[] = [
        { name: 'Period 1', start_time: '07:30', end_time: '08:25', is_break: false },
        { name: 'Period 2', start_time: '08:25', end_time: '09:20', is_break: false },
        { name: 'Period 3', start_time: '09:20', end_time: '10:15', is_break: false },
        { name: 'First Break', start_time: '10:15', end_time: '10:30', is_break: true },     // Break
        { name: 'Period 5', start_time: '10:30', end_time: '11:25', is_break: false },
        { name: 'Period 6', start_time: '11:25', end_time: '12:20', is_break: false },
        { name: 'Second Break', start_time: '12:20', end_time: '12:50', is_break: true },    // Lunch
        { name: 'Period 7', start_time: '12:50', end_time: '13:45', is_break: false },
        { name: 'Period 8', start_time: '13:45', end_time: '14:40', is_break: false },
        { name: 'Period 9', start_time: '14:40', end_time: '15:35', is_break: false },
        { name: 'Closing', start_time: '15:35', end_time: '15:45', is_break: true },         // Break
        { name: 'Period 11', start_time: '15:45', end_time: '16:40', is_break: false },
        { name: 'Period 12', start_time: '16:40', end_time: '17:30', is_break: false },
    ];

    // Define days
    const days: DayOfWeek[] = [
        'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'
    ];

    let createdCount = 0;
    let skippedCount = 0;

    // Create periods for each day
    for (const day of days) {
        for (const period of periods) {
            try {
                // Check if period already exists
                const existingPeriod = await prisma.period.findFirst({
                    where: {
                        day_of_week: day,
                        name: period.name,
                        start_time: period.start_time,
                        end_time: period.end_time
                    }
                });

                if (existingPeriod) {
                    console.log(`Skipping period (already exists): ${day} ${period.name}`);
                    skippedCount++;
                    continue;
                }

                // Create period
                await prisma.period.create({
                    data: {
                        name: period.name,
                        day_of_week: day,
                        start_time: period.start_time,
                        end_time: period.end_time,
                        is_break: period.is_break
                    }
                });

                console.log(`Created period: ${day} ${period.name}`);
                createdCount++;
            } catch (error) {
                console.error(`Error creating period ${day} ${period.name}:`, error);
            }
        }
    }

    console.log(`Seed completed. Created ${createdCount} periods, skipped ${skippedCount} existing periods.`);
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 