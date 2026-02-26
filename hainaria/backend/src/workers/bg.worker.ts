import { Worker, Job } from 'bullmq';
import { redisConnection } from '../services/bull.service';
import { PrismaClient, TryOnStatus } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const prisma = new PrismaClient();
const PYTHON_BG_URL = process.env.PYTHON_BG_URL || 'http://python-bg:8000/removebg';

export const bgWorker = new Worker('bg-removal-queue', async (job: Job) => {
    const { sessionId, imageUrl } = job.data;
    console.log(`[BG Worker] Processing session ${sessionId}`);

    try {
        await prisma.tryOnJob.create({
            data: { sessionId, type: 'BG_REMOVAL', status: 'PROCESSING' }
        });

        const inputPath = path.join(process.cwd(), imageUrl);
        const form = new FormData();
        form.append('file', fs.createReadStream(inputPath));

        const response = await axios.post(PYTHON_BG_URL, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        });

        const filename = `cutout-${sessionId}-${Date.now()}.png`;
        const outputPath = path.join(process.cwd(), 'uploads/avatars', filename);

        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }

        fs.writeFileSync(outputPath, response.data);
        const assetUrl = `/uploads/avatars/${filename}`;

        await prisma.tryOnAsset.create({
            data: { sessionId, type: 'CUTOUT', url: assetUrl }
        });

        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: {
                status: TryOnStatus.BG_REMOVAL_DONE,
                currentResultUrl: assetUrl
            }
        });

        console.log(`[BG Worker] Success for ${sessionId}`);
    } catch (err: any) {
        console.error(`[BG Worker] Error for ${sessionId}:`, err.message);
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: { status: TryOnStatus.FAILED }
        });
        throw err;
    }
}, { connection: redisConnection });
