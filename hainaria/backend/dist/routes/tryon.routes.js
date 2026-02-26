"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: 'uploads/raw/' });
// 1. Create Session
router.post('/session', auth_1.authenticateJWT, async (req, res) => {
    const session = await prisma.tryOnSession.create({
        data: { userId: req.user.userId }
    });
    res.json({ ok: true, sessionId: session.id });
});
// 2. Upload Image
router.post('/:id/upload', auth_1.authenticateJWT, upload.single('image'), async (req, res) => {
    const id = req.params.id;
    if (!req.file)
        return res.status(400).json({ ok: false, message: 'No image uploaded' });
    const session = await prisma.tryOnSession.findUnique({ where: { id } });
    if (!session || session.userId !== req.user.userId)
        return res.status(404).json({ ok: false, message: 'Session not found' });
    // Store asset
    const assetUrl = `/uploads/raw/${req.file.filename}`;
    await prisma.tryOnAsset.create({
        data: { sessionId: id, type: 'RAW', url: assetUrl }
    });
    await prisma.tryOnSession.update({
        where: { id },
        data: { status: client_1.TryOnStatus.UPLOADED }
    });
    res.json({ ok: true, status: client_1.TryOnStatus.UPLOADED });
});
const tryon_queue_1 = require("../queues/tryon.queue");
// ... existing code ...
// 3. Trigger BG Removal
router.post('/:id/bg-remove', auth_1.authenticateJWT, async (req, res) => {
    const id = req.params.id;
    const session = await prisma.tryOnSession.findUnique({
        where: { id },
        include: { assets: true }
    });
    if (!session || session.status !== client_1.TryOnStatus.UPLOADED) {
        return res.status(400).json({ ok: false, message: 'Invalid state for BG removal' });
    }
    const rawAsset = session.assets.find((a) => a.type === 'RAW');
    if (!rawAsset)
        return res.status(404).json({ ok: false, message: 'Raw image not found' });
    // Create Job Record
    const jobRecord = await prisma.tryOnJob.create({
        data: {
            sessionId: id,
            type: 'BG_REMOVAL',
            status: 'PENDING',
            payload: { imageUrl: rawAsset.url }
        }
    });
    await prisma.tryOnSession.update({
        where: { id },
        data: { status: client_1.TryOnStatus.BG_REMOVAL_QUEUED }
    });
    // Add to BullMQ
    await (0, tryon_queue_1.addTryOnJob)('BG_REMOVAL', id, { imageUrl: rawAsset.url });
    res.json({ ok: true, status: client_1.TryOnStatus.BG_REMOVAL_QUEUED, jobId: jobRecord.id });
});
// 4. Trigger AI Try-On
router.post('/:id/try', auth_1.authenticateJWT, async (req, res) => {
    const id = req.params.id;
    const { productId } = req.body; // Adjusted to single product for this specific worker implementation
    if (!productId) {
        return res.status(400).json({ ok: false, message: 'No product selected' });
    }
    const session = await prisma.tryOnSession.findUnique({
        where: { id },
        include: { assets: true }
    });
    if (!session || (session.status !== client_1.TryOnStatus.BG_REMOVAL_DONE && session.status !== client_1.TryOnStatus.READY_FOR_TRYON && session.status !== client_1.TryOnStatus.TRYON_DONE)) {
        return res.status(400).json({ ok: false, message: 'Invalid state for AI Try-On' });
    }
    const cutoutAsset = session.assets.find((a) => a.type === 'CUTOUT');
    if (!cutoutAsset)
        return res.status(404).json({ ok: false, message: 'Cutout image not found' });
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true }
    });
    if (!product || !product.images[0])
        return res.status(404).json({ ok: false, message: 'Product or product image not found' });
    // Create Job Record
    const jobRecord = await prisma.tryOnJob.create({
        data: {
            sessionId: id,
            type: 'AI_TRYON',
            status: 'PENDING',
            payload: {
                modelImage: cutoutAsset.url,
                garmentImage: product.images[0].url,
                garmentType: product.category || 'top',
                productId: product.id
            }
        }
    });
    await prisma.tryOnSession.update({
        where: { id },
        data: { status: client_1.TryOnStatus.TRYON_QUEUED }
    });
    // Add to BullMQ
    await (0, tryon_queue_1.addTryOnJob)('AI_TRYON', id, {
        modelImage: cutoutAsset.url,
        garmentImage: product.images[0].url,
        garmentType: product.category || 'top',
        productId: product.id
    });
    res.json({ ok: true, status: client_1.TryOnStatus.TRYON_QUEUED, jobId: jobRecord.id });
});
// 5. Status Polling
router.get('/:id', auth_1.authenticateJWT, async (req, res) => {
    const session = await prisma.tryOnSession.findUnique({
        where: { id: req.params.id },
        include: { assets: true, jobs: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (!session || session.userId !== req.user.userId)
        return res.status(404).json({ ok: false });
    res.json({ ok: true, session });
});
exports.default = router;
