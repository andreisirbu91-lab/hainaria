import { Router, Request, Response } from 'express';
import { PrismaClient, TryOnStatus } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { bgQueue, tryOnQueue } from '../services/bull.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/raw/' });

// 1. Create Session
router.post('/session', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    const session = await prisma.tryOnSession.create({
        data: { userId: req.user!.userId }
    });
    res.json({ ok: true, sessionId: session.id });
});

// 2. Upload Image
router.post('/:id/upload', authenticateJWT, upload.single('image'), async (req: AuthRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ ok: false, message: 'No image uploaded' });

    const session = await prisma.tryOnSession.findUnique({ where: { id } });
    if (!session || session.userId !== req.user!.userId) return res.status(404).json({ ok: false, message: 'Session not found' });

    // Store asset
    const assetUrl = `/uploads/raw/${req.file.filename}`;
    await prisma.tryOnAsset.create({
        data: { sessionId: id, type: 'RAW', url: assetUrl }
    });

    await prisma.tryOnSession.update({
        where: { id },
        data: { status: TryOnStatus.UPLOADED }
    });

    res.json({ ok: true, status: TryOnStatus.UPLOADED });
});

// 3. Trigger BG Removal
router.post('/:id/bg-remove', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const session = await prisma.tryOnSession.findUnique({
        where: { id },
        include: { assets: true }
    });

    if (!session || session.status !== TryOnStatus.UPLOADED) {
        return res.status(400).json({ ok: false, message: 'Invalid state for BG removal' });
    }

    const rawAsset = session.assets.find(a => a.type === 'RAW');
    if (!rawAsset) return res.status(404).json({ ok: false, message: 'Raw image not found' });

    await prisma.tryOnSession.update({
        where: { id },
        data: { status: TryOnStatus.BG_REMOVAL_QUEUED }
    });

    await bgQueue.add('remove-bg', {
        sessionId: id,
        imageUrl: rawAsset.url
    });

    res.json({ ok: true, status: TryOnStatus.BG_REMOVAL_QUEUED });
});

// 4. Trigger AI Try-On
router.post('/:id/try', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ ok: false, message: 'No products selected' });
    }

    const session = await prisma.tryOnSession.findUnique({ where: { id } });
    if (!session || session.status !== TryOnStatus.BG_REMOVAL_DONE && session.status !== TryOnStatus.READY_FOR_TRYON && session.status !== TryOnStatus.TRYON_DONE) {
        return res.status(400).json({ ok: false, message: 'Invalid state for AI Try-On' });
    }

    await prisma.tryOnSession.update({
        where: { id },
        data: { status: TryOnStatus.TRYON_QUEUED }
    });

    await tryOnQueue.add('generate-tryon', {
        sessionId: id,
        productIds
    });

    res.json({ ok: true, status: TryOnStatus.TRYON_QUEUED });
});

// 5. Status Polling
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    const session = await prisma.tryOnSession.findUnique({
        where: { id: req.params.id },
        include: { assets: true, jobs: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!session || session.userId !== req.user!.userId) return res.status(404).json({ ok: false });

    res.json({ ok: true, session });
});

export default router;
