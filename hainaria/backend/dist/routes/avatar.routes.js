"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, '../../uploads/avatars');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const userId = req.user?.userId || 'guest';
        cb(null, userId + '-' + uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 6 * 1024 * 1024 } }); // 6MB limit
// POST /api/avatars/upload
router.post('/upload', auth_1.authenticateJWT, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: 'Nu ai încărcat nicio imagine.' });
        }
        const userId = req.user.userId;
        // For local MVP we just use the local path as URL.
        // Ensure Express serves /uploads statically.
        const originalUrl = `/uploads/avatars/${req.file.filename}`;
        const avatar = await prisma_1.default.userAvatar.create({
            data: {
                userId,
                originalUrl,
                cutoutUrl: '', // Will be generated in step 2
            }
        });
        return res.status(201).json({ ok: true, data: avatar });
    }
    catch (err) {
        console.error('[Avatar Upload error]', err);
        res.status(500).json({ ok: false, message: 'Eroare la încărcarea avatarului.' });
    }
});
// GET /api/avatars
router.get('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const avatars = await prisma_1.default.userAvatar.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ ok: true, data: avatars });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: 'Eroare la preluarea avatarelor.' });
    }
});
exports.default = router;
