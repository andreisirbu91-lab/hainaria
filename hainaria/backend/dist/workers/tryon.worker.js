"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryonWorker = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("../queues/connection");
const client_1 = require("@prisma/client");
const replicate_1 = __importDefault(require("replicate"));
const prisma = new client_1.PrismaClient();
const replicate = new replicate_1.default({
    auth: process.env.REPLICATE_API_TOKEN,
});
exports.tryonWorker = new bullmq_1.Worker('TryOnQueue', async (job) => {
    if (job.name !== 'AI_TRYON')
        return;
    const { sessionId, payload } = job.data;
    const { modelImage, garmentImage, garmentType } = payload;
    console.log(`[AI_TRYON] Processing session ${sessionId}...`);
    try {
        // 1. Trigger Replicate
        const prediction = await replicate.predictions.create({
            version: "7239634f41b96a93574d3062337a6b72d24483321522f7797740e79391054cd2", // IDM-VTON
            input: {
                garm_img: garmentImage,
                human_img: modelImage,
                garment_des: garmentType,
                is_checked: true,
                is_checked_crop: false,
                denoise_steps: 30,
                seed: 42
            }
        });
        // 2. Poll for result (or use webhooks if configured)
        let result = await replicate.wait(prediction);
        if (result.status === 'succeeded' && result.output) {
            const resultUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            // 3. Update Database
            await prisma.$transaction([
                prisma.tryOnAsset.create({
                    data: {
                        sessionId,
                        type: 'RESULT',
                        url: resultUrl
                    }
                }),
                prisma.tryOnSession.update({
                    where: { id: sessionId },
                    data: {
                        status: 'TRYON_DONE',
                        currentResultUrl: resultUrl
                    }
                }),
                prisma.tryOnJob.update({
                    where: { id: job.id },
                    data: { status: 'COMPLETED', result: { url: resultUrl } }
                })
            ]);
            console.log(`[AI_TRYON] Success for session ${sessionId}`);
        }
        else {
            throw new Error(`Replicate failed: ${result.error}`);
        }
    }
    catch (err) {
        console.error(`[AI_TRYON] Failed for session ${sessionId}:`, err.message);
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: { status: 'FAILED' }
        });
        throw err;
    }
}, { connection: connection_1.redisConnection });
