import prisma from '../config/db';
import * as StudentAverageService from '../api/v1/services/studentAverageService';

/**
 * Calculate averages for all students in all active exam sequences that have ended
 * This function can be scheduled to run daily using a scheduler like node-cron
 */
export const calculateAveragesForCompletedSequences = async () => {
    try {
        const today = new Date();

        // Find all exam sequences that have ended (assuming there's an end_date field)
        // If there's no end_date field directly on ExamSequence, we can check through the Term
        const completedSequences = await prisma.examSequence.findMany({
            where: {
                term: {
                    end_date: {
                        lte: today // Term has ended
                    }
                }
            },
            include: {
                term: true,
                academic_year: true
            }
        });

        console.log(`Found ${completedSequences.length} completed exam sequences`);

        // Process each sequence
        for (const sequence of completedSequences) {
            try {
                // Check if we already have calculated averages for this sequence
                const existingAverages = await prisma.studentSequenceAverage.count({
                    where: {
                        exam_sequence_id: sequence.id,
                        status: 'VERIFIED' // Fully processed
                    }
                });

                // If we already have verified averages, skip this sequence
                if (existingAverages > 0) {
                    console.log(`Sequence ${sequence.id} already has ${existingAverages} verified averages. Skipping.`);
                    continue;
                }

                // Calculate averages for all students in this sequence
                console.log(`Calculating averages for sequence ${sequence.id} (Term ${sequence.term.name}, Academic Year ${sequence.academic_year.name})`);
                const averages = await StudentAverageService.calculateAndSaveStudentAverages(sequence.id);

                console.log(`Successfully calculated ${averages.length} averages for sequence ${sequence.id}`);
            } catch (error) {
                console.error(`Error processing sequence ${sequence.id}:`, error);
                // Continue with other sequences
            }
        }

        return {
            success: true,
            message: `Processed ${completedSequences.length} completed sequences`,
        };
    } catch (error) {
        console.error('Error in calculateAveragesForCompletedSequences:', error);
        throw error;
    }
};

/**
 * Schedule the automatic calculation task
 * This can be called from server.ts or a separate scheduler file
 */
export const scheduleAverageCalculations = () => {
    // Check if we're in a production environment
    if (process.env.NODE_ENV === 'production') {
        // Using setInterval for simplicity
        // In a production app, you'd use a proper scheduler like node-cron
        // Example: cron.schedule('0 0 * * *', calculateAveragesForCompletedSequences);

        // For now, we'll run it once a day (24 hours)
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        setInterval(async () => {
            console.log('Running scheduled average calculations');
            try {
                await calculateAveragesForCompletedSequences();
                console.log('Scheduled average calculations completed successfully');
            } catch (error) {
                console.error('Error in scheduled average calculations:', error);
            }
        }, TWENTY_FOUR_HOURS);

        console.log('Scheduled average calculations task set up successfully');
    }
}; 