"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const replicate_1 = __importDefault(require("replicate"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../utils/prisma"));
const execPromise = util_1.default.promisify(child_process_1.exec);
const router = (0, express_1.Router)();
// GET /api/studio/backgrounds
router.get('/backgrounds', (_req, res) => {
    const backgrounds = [
        '#ffffff',
        '#f3f4f6',
        '#e5e7eb',
        '#d1d5db',
        '#fef2f2',
        '#f0fdf4',
        '#111827',
        '#374151'
    ];
    res.status(200).json({ ok: true, data: backgrounds });
});
// POST /api/studio/remove-bg
router.post('/remove-bg', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { avatarId } = req.body;
        if (!avatarId)
            return res.status(400).json({ ok: false, message: 'Nu ai specificat avatarul (avatarId lipsă).' });
        const avatar = await prisma_1.default.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar || avatar.userId !== req.user.userId) {
            return res.status(404).json({ ok: false, message: 'Avatar negăsit.' });
        }
        if (avatar.cutoutUrl) {
            // Already processed
            return res.status(200).json({ ok: true, data: avatar });
        }
        const filename = path_1.default.basename(avatar.originalUrl);
        const inputPath = path_1.default.join(__dirname, '../../uploads/avatars', filename);
        const ext = path_1.default.extname(filename);
        const cutoutFilename = filename.replace(ext, '-cutout.png');
        const outputPath = path_1.default.join(__dirname, '../../uploads/avatars', cutoutFilename);
        if (!fs_1.default.existsSync(inputPath)) {
            return res.status(404).json({ ok: false, message: 'Imaginea originală nu există pe server.' });
        }
        // Call Python rembg
        const pyScript = path_1.default.join(__dirname, '../../py/remove_bg.py');
        const command = `python3 ${pyScript} "${inputPath}" "${outputPath}"`;
        try {
            await execPromise(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer pt model download logs
        }
        catch (pyErr) {
            console.error('[rembg_error]', pyErr.stderr || pyErr.message);
            // Ignore non-fatal stderr if output file was created anyway
            if (!fs_1.default.existsSync(outputPath)) {
                return res.status(500).json({ ok: false, message: 'Eroare la eliminarea fundalului cu rembg: ' + (pyErr.stderr || pyErr.message).slice(0, 100) });
            }
        }
        if (!fs_1.default.existsSync(outputPath)) {
            return res.status(500).json({ ok: false, message: 'Imaginea procesată nu a fost salvată corect.' });
        }
        // Update DB
        const updated = await prisma_1.default.userAvatar.update({
            where: { id: avatarId },
            data: { cutoutUrl: `/uploads/avatars/${cutoutFilename}` }
        });
        return res.status(200).json({ ok: true, data: updated });
    }
    catch (err) {
        console.error('[Studio remove-bg error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare server la remove-bg.' });
    }
});
// POST /api/studio/looks
router.post('/looks', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { avatarId, name, sceneJson, previewUrl } = req.body;
        if (!avatarId || !sceneJson) {
            return res.status(400).json({ ok: false, message: 'Te rugăm să completezi formularul de look.' });
        }
        const look = await prisma_1.default.tryOnLook.create({
            data: {
                userId: req.user.userId,
                avatarId,
                name,
                sceneJson,
                previewUrl
            }
        });
        return res.status(201).json({ ok: true, data: look });
    }
    catch (err) {
        console.error('[Studio save look error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare la salvarea look-ului.' });
    }
});
// GET /api/studio/looks
router.get('/looks', auth_1.authenticateJWT, async (req, res) => {
    try {
        const looks = await prisma_1.default.tryOnLook.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: { avatar: true }
        });
        return res.status(200).json({ ok: true, data: looks });
    }
    catch (err) {
        return res.status(500).json({ ok: false, message: 'Eroare la preluarea look-urilor.' });
    }
});
// POST /api/studio/product-cutout/:id
router.post('/product-cutout/:id', auth_1.authenticateJWT, async (req, res) => {
    try {
        const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const conf = await prisma_1.default.productTryOnConfig.findUnique({ where: { productId } });
        if (!conf)
            return res.status(404).json({ ok: false, message: 'Produsul nu are date pt probare.' });
        if (conf.cutoutUrl)
            return res.status(200).json({ ok: true, cutoutUrl: conf.cutoutUrl }); // Deja procesat
        const prod = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!prod || !prod.imageUrl)
            return res.status(404).json({ ok: false, message: 'Produs invalid.' });
        // Download Unsplash img to /tmp and process
        const axios = require('axios');
        const imgRes = await axios.get(prod.imageUrl, { responseType: 'arraybuffer' });
        const timestamp = Date.now();
        const tmpInput = path_1.default.join(__dirname, `../../uploads/products/tmp-${timestamp}.jpg`);
        const finalOutput = path_1.default.join(__dirname, `../../uploads/products/prod-${productId}-cutout.png`);
        fs_1.default.writeFileSync(tmpInput, imgRes.data);
        const pyScript = path_1.default.join(__dirname, '../../py/remove_bg.py');
        const command = `python3 ${pyScript} "${tmpInput}" "${finalOutput}"`;
        try {
            await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
        }
        catch (pyErr) {
            if (!fs_1.default.existsSync(finalOutput)) {
                return res.status(500).json({ ok: false, message: 'Eroare procesare produs.' });
            }
        }
        // Curățare temporar
        fs_1.default.unlinkSync(tmpInput);
        const cutoutUrl = `/uploads/products/prod-${productId}-cutout.png`;
        await prisma_1.default.productTryOnConfig.update({
            where: { productId },
            data: { cutoutUrl }
        });
        return res.status(200).json({ ok: true, cutoutUrl });
    }
    catch (err) {
        console.error('[Prod cutout err]', err);
        return res.status(500).json({ ok: false, message: 'Eroare server procesare produs.' });
    }
});
// POST /api/studio/generate-vton
router.post('/generate-vton', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { avatarId, productId } = req.body;
        if (!avatarId || !productId) {
            return res.status(400).json({ ok: false, message: 'Nu ai selectat avatarul sau produsul.' });
        }
        const avatar = await prisma_1.default.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar || avatar.userId !== req.user.userId) {
            return res.status(404).json({ ok: false, message: 'Avatar negăsit.' });
        }
        const conf = await prisma_1.default.productTryOnConfig.findUnique({ where: { productId } });
        if (!conf || !conf.cutoutUrl) {
            return res.status(400).json({ ok: false, message: 'Produsul nu are decupaj valid pt procesare AI.' });
        }
        let category = 'upper_body';
        if (conf.garmentType === 'BOTTOM')
            category = 'lower_body';
        else if (conf.garmentType === 'DRESS')
            category = 'dresses';
        const avatarLocalPath = path_1.default.join(__dirname, '../..', avatar.originalUrl);
        const garmentLocalPath = path_1.default.join(__dirname, '../..', conf.cutoutUrl);
        if (!fs_1.default.existsSync(avatarLocalPath) || !fs_1.default.existsSync(garmentLocalPath)) {
            return res.status(404).json({ ok: false, message: 'Imaginile necesare nu există pe server.' });
        }
        const getBase64DataURI = (file) => {
            const ext = path_1.default.extname(file).toLowerCase();
            const mime = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
            const b64 = fs_1.default.readFileSync(file, { encoding: 'base64' });
            return `data:${mime};base64,${b64}`;
        };
        const humanImg = getBase64DataURI(avatarLocalPath);
        const garmImg = getBase64DataURI(garmentLocalPath);
        const replicate = new replicate_1.default({
            auth: process.env.REPLICATE_API_TOKEN,
        });
        const output = await replicate.run("cuiaxi/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4", {
            input: {
                crop: false,
                seed: 42,
                steps: 30,
                category: category,
                force_dc: false,
                garm_img: garmImg,
                human_img: humanImg,
                garment_des: "clothing item"
            }
        });
        let resultUrl = '';
        if (Array.isArray(output)) {
            resultUrl = String(output[0]);
        }
        else {
            resultUrl = String(output);
        }
        return res.status(200).json({ ok: true, data: { resultUrl } });
    }
    catch (err) {
        console.error('[Studio VTON error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare la procesarea AI: ' + (err.message || 'Necunoscut') });
    }
});
exports.default = router;
