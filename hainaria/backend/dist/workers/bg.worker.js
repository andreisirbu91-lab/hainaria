"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bgWorker = void 0;
const bullmq_1 = require("bullmq");
const bull_service_1 = require("../services/bull.service");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const prisma = new client_1.PrismaClient();
const PYTHON_BG_URL = process.env.PYTHON_BG_URL || 'http://python-bg:8000/removebg';
exports.bgWorker = new bullmq_1.Worker('bg-removal-queue', async (job) => {
    const { sessionId, imageUrl } = job.data;
    console.log(`[BG Worker] Processing session ${sessionId}`);
    try {
        await prisma.tryOnJob.create({
            data: { sessionId, type: 'BG_REMOVAL', status: 'PROCESSING' }
        });
        const inputPath = path_1.default.join(process.cwd(), imageUrl);
        const form = new form_data_1.default();
        form.append('file', fs_1.default.createReadStream(inputPath));
        const response = await axios_1.default.post(PYTHON_BG_URL, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        });
        const filename = `cutout-${sessionId}-${Date.now()}.png`;
        const outputPath = path_1.default.join(process.cwd(), 'uploads/avatars', filename);
        if (!fs_1.default.existsSync(path_1.default.dirname(outputPath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
        }
        fs_1.default.writeFileSync(outputPath, response.data);
        const assetUrl = `/uploads/avatars/${filename}`;
        await prisma.tryOnAsset.create({
            data: { sessionId, type: 'CUTOUT', url: assetUrl }
        });
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.TryOnStatus.BG_REMOVAL_DONE,
                currentResultUrl: assetUrl
            }
        });
        console.log(`[BG Worker] Success for ${sessionId}`);
    }
    catch (err) {
        console.error(`[BG Worker] Error for ${sessionId}:`, err.message);
        await prisma.tryOnSession.update({
            where: { id: sessionId },
            data: { status: client_1.TryOnStatus.FAILED }
        });
        throw err;
    }
}, { connection: bull_service_1.redisConnection });
