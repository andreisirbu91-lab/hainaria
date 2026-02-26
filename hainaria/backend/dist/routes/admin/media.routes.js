"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminAuth_1 = require("../../middleware/adminAuth");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: 'uploads/temp/' });
// Create uploads/media folder if it doesn't exist
const MEDIA_PATH = path_1.default.join(process.cwd(), 'uploads/media');
if (!fs_1.default.existsSync(MEDIA_PATH))
    fs_1.default.mkdirSync(MEDIA_PATH, { recursive: true });
// Upload Media
router.post('/upload', adminAuth_1.authenticateAdmin, upload.single('file'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ ok: false, message: 'No file uploaded' });
    try {
        const ext = path_1.default.extname(req.file.originalname);
        const filename = `${Date.now()}${ext}`;
        const targetPath = path_1.default.join(MEDIA_PATH, filename);
        // Move file
        fs_1.default.renameSync(req.file.path, targetPath);
        // Generate thumbnail for images
        let thumbUrl = null;
        if (req.file.mimetype.startsWith('image/')) {
            const thumbFilename = `thumb-${filename}`;
            const thumbPath = path_1.default.join(MEDIA_PATH, thumbFilename);
            await (0, sharp_1.default)(targetPath)
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
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// List Media
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
    const assets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' }
    });
    const folders = await prisma.mediaFolder.findMany();
    res.json({ ok: true, assets, folders });
});
exports.default = router;
