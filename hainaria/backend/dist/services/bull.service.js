"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = exports.tryOnQueue = exports.bgQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
exports.redisConnection = redisConnection;
exports.bgQueue = new bullmq_1.Queue('bg-removal-queue', { connection: redisConnection });
exports.tryOnQueue = new bullmq_1.Queue('try-on-queue', { connection: redisConnection });
