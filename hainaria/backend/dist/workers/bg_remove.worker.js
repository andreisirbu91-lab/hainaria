"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bgRemoveWorker = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("../queues/connection");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const prisma = new client_1.PrismaClient();
const REMOVEBG_SERVICE_URL = process.env.REMOVEBG_SERVICE_URL || 'http://localhost:8000';
exports.bgRemoveWorker = new bullmq_1.Worker('TryOnQueue', async (job) => {
    if (job.name !== 'BG_REMOVAL')
        return;
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
        const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        // 2. Call Python Service
        const formData = new form_data_1.default();
        formData.append('file', buffer, { filename: 'input.png', contentType: 'image/png' });
        const bgRes = await axios_1.default.post(`${REMOVEBG_SERVICE_URL}/removebg`, formData, {
            headers: formData.getHeaders(),
            responseType: 'arraybuffer'
        });
        // 3. Save processed image locally (or S3/MinIO)
        const filename = `cutout-${Date.now()}.png`;
        const uploadDir = path_1.default.join(process.cwd(), 'uploads/tryon');
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        const targetPath = path_1.default.join(uploadDir, filename);
        fs_1.default.writeFileSync(targetPath, Buffer.from(bgRes.data));
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
                where: { id: job.id },
                data: { status: 'COMPLETED', result: { url: cutoutUrl } }
            })
        ]);
        console.log(`[BG_REMOVE] Success for session ${sessionId}`);
    }
    catch (err) {
        console.error(`[BG_REMOVE] Failed for session ${sessionId}:`, err.message);
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: { status: 'FAILED' }
        });
        throw err; // Trigger BullMQ retry
    }
}, { connection: connection_1.redisConnection });
