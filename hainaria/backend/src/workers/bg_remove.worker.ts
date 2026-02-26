import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queues/connection';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const prisma = new PrismaClient();
const REMOVEBG_SERVICE_URL = process.env.REMOVEBG_SERVICE_URL || 'http://localhost:8000';

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
                data: { status: 'BG_REMOVAL_QUEUED' } // In case it wasn't already
            });

            // 1. Download original image
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);

            // 2. Call Python Service
            const formData = new FormData();
            formData.append('file', buffer, { filename: 'input.png', contentType: 'image/png' });

            const bgRes = await axios.post(`${REMOVEBG_SERVICE_URL}/removebg`, formData, {
                headers: formData.getHeaders(),
                responseType: 'arraybuffer'
            });

            // 3. Save processed image locally (or S3/MinIO)
            const filename = `cutout-${Date.now()}.png`;
            const uploadDir = path.join(process.cwd(), 'uploads/tryon');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const targetPath = path.join(uploadDir, filename);
            fs.writeFileSync(targetPath, Buffer.from(bgRes.data));

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
                prisma.tryOnJob.update({
                    where: { id: job.id as string },
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
