import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const bgQueue = new Queue('bg-removal-queue', { connection: redisConnection });
export const tryOnQueue = new Queue('try-on-queue', { connection: redisConnection });

export { redisConnection };
