import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/avatars');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const userId = (req as AuthRequest).user?.userId || 'guest';
        cb(null, userId + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } }); // 6MB limit

// POST /api/avatars/upload
router.post('/upload', authenticateJWT, upload.single('avatar'), async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: 'Nu ai încărcat nicio imagine.' });
        }

        const userId = req.user!.userId;
        // For local MVP we just use the local path as URL.
        // Ensure Express serves /uploads statically.
        const originalUrl = `/uploads/avatars/${req.file.filename}`;

        const avatar = await prisma.userAvatar.create({
            data: {
                userId,
                originalUrl,
                cutoutUrl: '', // Will be generated in step 2
            }
        });

        return res.status(201).json({ ok: true, data: avatar });
    } catch (err: any) {
        console.error('[Avatar Upload error]', err);
        res.status(500).json({ ok: false, message: 'Eroare la încărcarea avatarului.' });
    }
});

// GET /api/avatars
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const avatars = await prisma.userAvatar.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ ok: true, data: avatars });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: 'Eroare la preluarea avatarelor.' });
    }
});

export default router;
