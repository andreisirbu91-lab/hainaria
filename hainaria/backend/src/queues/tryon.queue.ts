import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const tryOnQueue = new Queue('TryOnQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    },
});

export const addTryOnJob = async (type: 'BG_REMOVAL' | 'AI_TRYON', sessionId: string, payload: any) => {
    return await tryOnQueue.add(type, { sessionId, payload });
};
