import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queues/connection';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import Replicate from 'replicate';
import axios from 'axios';

const prisma = new PrismaClient();

export const bgRemoveWorker = new Worker(
    'TryOnQueue',
    async (job: Job) => {
        if (job.name !== 'BG_REMOVAL') return;

        const { sessionId, payload } = job.data;
        const { imageUrl } = payload;

        console.log(`[BG_REMOVE] Processing session ${sessionId}...`);

        try {
            // Update session status
            await prisma.tryOnSession.update({
                where: { id: sessionId },
                data: { status: 'BG_REMOVAL_QUEUED' }
            });

            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_KEY || process.env.REPLICATE_TOKEN || process.env.REPLICATE_API_TOKEN,
            });

            // 1. Resolve input path from disk
            const inputPath = path.join(process.cwd(), imageUrl);
            if (!fs.existsSync(inputPath)) {
                throw new Error(`Image file not found at ${inputPath}`);
            }

            // 2. Prepare output path
            const filename = `cutout-${Date.now()}.png`;
            const uploadDir = path.join(process.cwd(), 'uploads/tryon');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const outputPath = path.join(uploadDir, filename);

            console.log(`[BG_REMOVE] Sending image to Replicate (lucataco/remove-bg)...`);

            // Read file as base64 to send to Replicate
            const ext = path.extname(inputPath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
            const base64Data = fs.readFileSync(inputPath, { encoding: 'base64' });
            const dataUri = `data:${mimeType};base64,${base64Data}`;

            const prediction = await replicate.predictions.create({
                version: "af8a920215b248a395c6c039750bde5b66d483ded0caeb3ce0f1ceab6d141e6e", // af8a9202... is lucataco/remove-bg
                input: {
                    image: dataUri
                }
            });

            const result = await replicate.wait(prediction);

            if (result.status !== 'succeeded' || !result.output) {
                throw new Error(`Replicate bg-remove failed: ${result.error || 'No output'}`);
            }

            const outputUrl = result.output;
            console.log(`[BG_REMOVE] Got result from Replicate: ${outputUrl}`);

            // Download the result back to our local disk
            const response = await axios.get(outputUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, response.data);

            console.log(`[BG_REMOVE] Saved cutout to ${outputPath}`);

            const cutoutUrl = `/uploads/tryon/${filename}`;

            // 4. Update Database
            await prisma.$transaction([
                prisma.tryOnAsset.create({
                    data: {
                        sessionId,
                        type: 'CUTOUT',
                        url: cutoutUrl
                    }
                }),
                prisma.tryOnSession.update({
                    where: { id: sessionId },
                    data: {
                        status: 'BG_REMOVAL_DONE',
                        currentResultUrl: cutoutUrl
                    }
                }),
                prisma.tryOnJob.updateMany({
                    where: { sessionId, type: 'BG_REMOVAL', status: 'PENDING' },
                    data: { status: 'COMPLETED', result: { url: cutoutUrl } }
                })
            ]);

            console.log(`[BG_REMOVE] Success for session ${sessionId}`);
        } catch (err: any) {
            console.error(`[BG_REMOVE] Failed for session ${sessionId}:`, err.message);
            await prisma.tryOnSession.update({
                where: { id: sessionId },
                data: { status: 'FAILED' }
            });
            throw err; // Trigger BullMQ retry
        }
    },
    { connection: redisConnection }
);
