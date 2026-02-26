import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, TryOnStatus } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { bgQueue, tryOnQueue } from '../services/bull.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/raw/' });

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
            if (!err) {
                req.user = user as { userId: string; role: string };
            } else {
                req.user = { userId: 'demo_user_id', role: 'USER' };
            }
            next();
        });
    } else {
        req.user = { userId: 'demo_user_id', role: 'USER' };
        next();
    }
};

// 1. Create Session
router.post('/session', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
    const session = await prisma.tryOnSession.create({
        data: { userId: req.user!.userId }
    });
    res.json({ ok: true, sessionId: session.id });
});

// 2. Upload Image
router.post('/:id/upload', optionalAuth, upload.single('image'), async (req: AuthRequest, res: Response): Promise<any> => {
    const id = req.params.id as string;
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

import { addTryOnJob } from '../queues/tryon.queue';

// ... existing code ...

// 3. Trigger BG Removal
router.post('/:id/bg-remove', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
    const id = req.params.id as string;
    const session = await prisma.tryOnSession.findUnique({
        where: { id },
        include: { assets: true }
    });

    if (!session || session.status !== TryOnStatus.UPLOADED) {
        return res.status(400).json({ ok: false, message: 'Invalid state for BG removal' });
    }

    const rawAsset = (session as any).assets.find((a: any) => a.type === 'RAW');
    if (!rawAsset) return res.status(404).json({ ok: false, message: 'Raw image not found' });

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
        data: { status: TryOnStatus.BG_REMOVAL_QUEUED }
    });

    // Add to BullMQ
    await addTryOnJob('BG_REMOVAL', id, { imageUrl: rawAsset.url });

    res.json({ ok: true, status: TryOnStatus.BG_REMOVAL_QUEUED, jobId: jobRecord.id });
});

// 4. Trigger AI Try-On
router.post('/:id/try', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
    const id = req.params.id as string;
    const { productId } = req.body; // Adjusted to single product for this specific worker implementation

    if (!productId) {
        return res.status(400).json({ ok: false, message: 'No product selected' });
    }

    const session = await prisma.tryOnSession.findUnique({
        where: { id },
        include: { assets: true }
    });

    if (!session || (session.status !== TryOnStatus.BG_REMOVAL_DONE && session.status !== TryOnStatus.READY_FOR_TRYON && session.status !== TryOnStatus.TRYON_DONE)) {
        return res.status(400).json({ ok: false, message: 'Invalid state for AI Try-On' });
    }

    const cutoutAsset = (session as any).assets.find((a: any) => a.type === 'CUTOUT');
    if (!cutoutAsset) return res.status(404).json({ ok: false, message: 'Cutout image not found' });

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true }
    });
    if (!product || !product.images[0]) return res.status(404).json({ ok: false, message: 'Product or product image not found' });

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
        data: { status: TryOnStatus.TRYON_QUEUED }
    });

    // Add to BullMQ
    await addTryOnJob('AI_TRYON', id, {
        modelImage: cutoutAsset.url,
        garmentImage: product.images[0].url,
        garmentType: product.category || 'top',
        productId: product.id
    });

    res.json({ ok: true, status: TryOnStatus.TRYON_QUEUED, jobId: jobRecord.id });
});

// 5. Status Polling
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
    const session = await prisma.tryOnSession.findUnique({
        where: { id: req.params.id as string },
        include: { assets: true, jobs: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!session || session.userId !== req.user!.userId) return res.status(404).json({ ok: false });

    res.json({ ok: true, session });
});

export default router;
