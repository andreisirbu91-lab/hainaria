import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queues/connection';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

            // 3. Call Python rembg script directly
            const pythonBin = fs.existsSync('/opt/venv/bin/python3')
                ? '/opt/venv/bin/python3'
                : 'python3';
            const scriptPath = path.join(process.cwd(), 'py/remove_bg.py');

            console.log(`[BG_REMOVE] Running: ${pythonBin} ${scriptPath} ${inputPath} ${outputPath}`);
            const result = execSync(`${pythonBin} "${scriptPath}" "${inputPath}" "${outputPath}"`, {
                timeout: 120000, // 2 minutes max
                encoding: 'utf-8'
            });
            console.log(`[BG_REMOVE] Python output: ${result}`);

            if (!fs.existsSync(outputPath)) {
                throw new Error('Python script ran but output file was not created');
            }

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
