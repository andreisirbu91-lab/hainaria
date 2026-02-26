"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTryOnJob = exports.tryOnQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.tryOnQueue = new bullmq_1.Queue('TryOnQueue', {
    connection: connection_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    },
});
const addTryOnJob = async (type, sessionId, payload) => {
    return await exports.tryOnQueue.add(type, { sessionId, payload });
};
exports.addTryOnJob = addTryOnJob;
