import { Worker, Job } from 'bullmq';
import { redisConnection } from '../services/bull.service';
import { PrismaClient, TryOnStatus } from '@prisma/client';
import Replicate from 'replicate';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
});

export const tryOnWorker = new Worker('try-on-queue', async (job: Job) => {
    const { sessionId, productIds } = job.data;
    console.log(`[TryOn Worker] Processing session ${sessionId} for products ${productIds}`);

    try {
        await prisma.tryOnJob.create({
            data: { sessionId, type: 'AI_TRYON', status: 'PROCESSING', payload: { productIds } }
        });

        const session = await prisma.tryOnSession.findUnique({
            where: { id: sessionId },
            include: { assets: true }
        });

        if (!session) throw new Error('Session not found');
        const cutoutAsset = session.assets.find(a => a.type === 'CUTOUT');
        if (!cutoutAsset) throw new Error('Coutout asset not found');

        // Note: For now, we take the first product as the main garment (VTON limitation)
        const product = await prisma.product.findUnique({
            where: { id: productIds[0] },
            include: { tryOnConfig: true }
        });

        if (!product || !product.tryOnConfig?.cutoutUrl) throw new Error('Product or cutout not found');

        const getBase64 = (filePath: string) => {
            const absolute = path.join(process.cwd(), filePath);
            const b64 = fs.readFileSync(absolute, { encoding: 'base64' });
            return `data:image/png;base64,${b64}`;
        };

        const human_img = getBase64(cutoutAsset.url);
        const garm_img = getBase64(product.tryOnConfig.cutoutUrl);

        console.log(`[TryOn Worker] Calling Replicate...`);
        const output = await replicate.run(
            "cuiaxi/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
            {
                input: {
                    garm_img,
                    human_img,
                    garment_des: product.title,
                    category: 'upper_body' // simplified for now
                }
            }
        );

        let resultUrl = Array.isArray(output) ? String(output[0]) : String(output);

        // Download and store locally
        const response = await axios.get(resultUrl, { responseType: 'arraybuffer' });
        const filename = `result-${sessionId}-${Date.now()}.png`;
        const outputPath = path.join(process.cwd(), 'uploads/results', filename);

        if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, response.data);
        const localUrl = `/uploads/results/${filename}`;

        await prisma.tryOnAsset.create({
            data: { sessionId, type: 'RESULT', url: localUrl }
        });

        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: {
                status: TryOnStatus.TRYON_DONE,
                currentResultUrl: localUrl
            }
        });

        console.log(`[TryOn Worker] Success for ${sessionId}`);
    } catch (err: any) {
        console.error(`[TryOn Worker] Error for ${sessionId}:`, err.message);
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: { status: TryOnStatus.FAILED }
        });
        throw err;
    }
}, { connection: redisConnection });
