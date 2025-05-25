import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null // Important for BullMQ
});

// --- Queues ---
export const reportGenerationQueueName = 'report-generation';

export const reportGenerationQueue = new Queue(reportGenerationQueueName, {
    connection,
    defaultJobOptions: {
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 1000, // Initial delay of 1s, exponential backoff
        },
        removeOnComplete: { // Keep completed jobs for a while for inspection
            age: 3600 * 24 * 7, // Keep for 7 days
            count: 1000,       // Keep max 1000 jobs
        },
        removeOnFail: { // Keep failed jobs for longer
            age: 3600 * 24 * 30, // Keep for 30 days
        }
    }
});

// --- Utility Function ---
export const getWorker = (
    queueName: string,
    processor: (job: any) => Promise<any>,
    options?: import('bullmq').WorkerOptions
) => {
    return new Worker(queueName, processor, {
        connection,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10), // Adjust concurrency as needed
        ...options,
    });
};

console.log(`BullMQ ${reportGenerationQueueName} queue initialized.`);

// Handle connection errors
connection.on('error', err => {
    console.error('Redis connection error:', err);
}); 