import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from '../../middleware/adminAuth';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/temp/' });

// Create uploads/media folder if it doesn't exist
const MEDIA_PATH = path.join(process.cwd(), 'uploads/media');
if (!fs.existsSync(MEDIA_PATH)) fs.mkdirSync(MEDIA_PATH, { recursive: true });

// Upload Media
router.post('/upload', authenticateAdmin, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

    try {
        const ext = path.extname(req.file.originalname);
        const filename = `${Date.now()}${ext}`;
        const targetPath = path.join(MEDIA_PATH, filename);

        // Move file
        fs.renameSync(req.file.path, targetPath);

        // Generate thumbnail for images
        let thumbUrl = null;
        if (req.file.mimetype.startsWith('image/')) {
            const thumbFilename = `thumb-${filename}`;
            const thumbPath = path.join(MEDIA_PATH, thumbFilename);
            await sharp(targetPath)
                .resize(200, 200, { fit: 'cover' })
                .toFile(thumbPath);
            thumbUrl = `/uploads/media/${thumbFilename}`;
        }

        const asset = await prisma.mediaAsset.create({
            data: {
                filename: req.file.originalname,
                url: `/uploads/media/${filename}`,
                thumbUrl,
                mimeType: req.file.mimetype,
                size: req.file.size,
                folderId: req.body.folderId || null
            }
        });

        res.json({ ok: true, asset });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// List Media
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    const assets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' }
    });
    const folders = await prisma.mediaFolder.findMany();
    res.json({ ok: true, assets, folders });
});

export default router;
