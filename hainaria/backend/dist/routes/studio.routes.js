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
        console.log('[Studio] remove-bg request:', { avatarId, userId: req.user.userId });
        if (!avatarId)
            return res.status(400).json({ ok: false, message: 'Nu ai specificat avatarul (avatarId lipsă).' });
        const avatar = await prisma_1.default.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar) {
            console.error('[Studio] Avatar not found in DB:', avatarId);
            return res.status(404).json({ ok: false, message: `Avatar negăsit în baza de date (ID: ${avatarId}).` });
        }
        if (avatar.userId !== req.user.userId) {
            console.error('[Studio] Avatar ownership mismatch:', { avatarUserId: avatar.userId, requestUserId: req.user.userId });
            return res.status(403).json({ ok: false, message: 'Nu ai permisiunea de a modifica acest avatar.' });
        }
        if (avatar.cutoutUrl) {
            return res.status(200).json({ ok: true, data: avatar });
        }
        const filename = path_1.default.basename(avatar.originalUrl);
        const inputPath = path_1.default.join(__dirname, '../../uploads/avatars', filename);
        const ext = path_1.default.extname(filename);
        const cutoutFilename = filename.replace(ext, `-cutout-${Date.now()}.png`);
        const outputPath = path_1.default.join(__dirname, '../../uploads/avatars', cutoutFilename);
        console.log('[Studio] Background removal paths:', { inputPath, outputPath, filename });
        if (!fs_1.default.existsSync(inputPath)) {
            console.error('[Studio] Input file missing:', inputPath);
            return res.status(404).json({ ok: false, message: 'Imaginea originală nu există pe server.' });
        }
        // Call Python rembg via venv if exists
        const pyScript = path_1.default.join(__dirname, '../../py/remove_bg.py');
        const pythonPath = fs_1.default.existsSync('/opt/venv/bin/python3') ? '/opt/venv/bin/python3' : 'python3';
        const command = `${pythonPath} ${pyScript} "${inputPath}" "${outputPath}"`;
        console.log('[Studio] Executing command:', command);
        try {
            const { stdout, stderr } = await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
            console.log('[Studio] rembg stdout:', stdout);
            if (stderr)
                console.warn('[Studio] rembg stderr:', stderr);
        }
        catch (pyErr) {
            console.error('[Studio] rembg execution error:', pyErr.stderr || pyErr.message);
            if (!fs_1.default.existsSync(outputPath)) {
                return res.status(500).json({
                    ok: false,
                    message: 'Eroare la eliminarea fundalului: ' + (pyErr.stderr || pyErr.message).slice(0, 100),
                    debug_command: command
                });
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
        const prod = await prisma_1.default.product.findUnique({ where: { id: productId }, include: { images: true } });
        const imageUrl = prod?.images?.[0]?.url;
        if (!prod || !imageUrl)
            return res.status(404).json({ ok: false, message: 'Produs invalid.' });
        // Download Unsplash img to /tmp and process
        const axios = require('axios');
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const timestamp = Date.now();
        const productsDir = path_1.default.join(__dirname, '../../uploads/products');
        if (!fs_1.default.existsSync(productsDir)) {
            fs_1.default.mkdirSync(productsDir, { recursive: true });
        }
        const tmpInput = path_1.default.join(productsDir, `tmp-${timestamp}.jpg`);
        const finalOutput = path_1.default.join(productsDir, `prod-${productId}-cutout.png`);
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
        console.log('[Studio] generate-vton request:', { avatarId, productId, userId: req.user.userId });
        if (!avatarId || !productId) {
            return res.status(400).json({ ok: false, message: 'Nu ai selectat avatarul sau produsul.' });
        }
        const avatar = await prisma_1.default.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar) {
            console.error('[Studio] Avatar not found:', avatarId);
            return res.status(404).json({ ok: false, message: 'Avatarul nu a fost găsit în baza de date.' });
        }
        if (avatar.userId !== req.user.userId) {
            console.error('[Studio] Avatar ownership mismatch:', { avatarUserId: avatar.userId, requestUserId: req.user.userId });
            return res.status(403).json({ ok: false, message: 'Nu ai permisiunea de a folosi acest avatar.' });
        }
        const conf = await prisma_1.default.productTryOnConfig.findUnique({ where: { productId } });
        if (!conf || !conf.cutoutUrl) {
            console.error('[Studio] Product config missing or partial:', { productId, conf });
            return res.status(400).json({ ok: false, message: 'Produsul nu are decupaj valid pt procesare AI.' });
        }
        // --- NEW: Filter out non-clothing items ---
        if (conf.garmentType === 'ACCESSORY' || conf.garmentType === 'SHOES') {
            console.log('[Studio] Skipping AI for non-clothing item:', conf.garmentType);
            // Pentru accesorii, doar returnam imaginea decupată a produsului, 
            // iar front-end-ul se va ocupa de suprapunere sau afișaj simplu.
            return res.status(200).json({
                ok: true,
                data: {
                    resultUrl: conf.cutoutUrl,
                    isAccessory: true,
                    message: "Accesoriile sunt vizualizate fară procesare AI momentan."
                }
            });
        }
        let category = 'upper_body';
        if (conf.garmentType === 'BOTTOM')
            category = 'lower_body';
        else if (conf.garmentType === 'DRESS')
            category = 'dresses';
        else if (conf.garmentType === 'OUTER' || conf.garmentType === 'TOP')
            category = 'upper_body';
        console.log('[Studio] Category mapped:', { category, garmentType: conf.garmentType });
        const avatarLocalPath = path_1.default.join(__dirname, '../..', avatar.originalUrl);
        const garmentLocalPath = path_1.default.join(__dirname, '../..', conf.cutoutUrl);
        console.log('[Studio] AI Try-on paths:', { avatarLocalPath, garmentLocalPath });
        if (!fs_1.default.existsSync(avatarLocalPath)) {
            console.error('[Studio] Avatar file missing on disk:', avatarLocalPath);
            return res.status(404).json({ ok: false, message: 'Poza ta a dispărut de pe server (probabil de la un Restart). Te rugăm să re-încarci poza.' });
        }
        if (!fs_1.default.existsSync(garmentLocalPath)) {
            console.warn('[Studio] Garment file missing on disk, attempting re-generation:', garmentLocalPath);
            // Re-run cutout logic internally
            const prod = await prisma_1.default.product.findUnique({ where: { id: productId }, include: { images: true } });
            const imageUrl = prod?.images?.[0]?.url;
            if (!prod || !imageUrl)
                return res.status(404).json({ ok: false, message: 'Imaginea produsului nu mai există.' });
            try {
                const axios = require('axios');
                const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const productsDir = path_1.default.dirname(garmentLocalPath);
                if (!fs_1.default.existsSync(productsDir))
                    fs_1.default.mkdirSync(productsDir, { recursive: true });
                const tmpInput = garmentLocalPath + '.tmp.jpg';
                fs_1.default.writeFileSync(tmpInput, imgRes.data);
                const pyScript = path_1.default.join(__dirname, '../../py/remove_bg.py');
                const pythonPath = fs_1.default.existsSync('/opt/venv/bin/python3') ? '/opt/venv/bin/python3' : 'python3';
                const command = `${pythonPath} ${pyScript} "${tmpInput}" "${garmentLocalPath}"`;
                await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
                fs_1.default.unlinkSync(tmpInput);
                console.log('[Studio] Re-generation successful for garment:', productId);
            }
            catch (reGenErr) {
                console.error('[Studio] Re-generation failed:', reGenErr);
                return res.status(500).json({ ok: false, message: 'Nu am putut re-genera decupajul hainei.' });
            }
        }
        if (!fs_1.default.existsSync(garmentLocalPath)) {
            return res.status(404).json({ ok: false, message: 'Imaginea decupată a hainei nu a putut fi găsită.' });
        }
        const getBase64DataURI = (file) => {
            const actualExt = path_1.default.extname(file).toLowerCase();
            const mime = actualExt === '.png' ? 'image/png' : (actualExt === '.webp' ? 'image/webp' : 'image/jpeg');
            const b64 = fs_1.default.readFileSync(file, { encoding: 'base64' });
            return `data:${mime};base64,${b64}`;
        };
        const humanImg = getBase64DataURI(avatarLocalPath);
        const garmImg = getBase64DataURI(garmentLocalPath);
        const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
        if (!replicateToken || replicateToken === 'mock' || (replicateToken.length < 10 && replicateToken !== 'mock')) {
            console.log('[Studio VTON] MOCK MODE: No valid Replicate Token attached. Simulating a 10s delay...');
            // Simulam o procesare lunga
            await new Promise(resolve => setTimeout(resolve, 10000));
            // Returnam o imagine de test de la hainaria/unsplash
            return res.status(200).json({
                ok: true,
                data: { resultUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' }
            });
        }
        const replicate = new replicate_1.default({
            auth: replicateToken,
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
        // --- NEW: Post-process result to remove background again (to keep it clean) ---
        try {
            console.log('[Studio] Post-processing AI result to remove background:', resultUrl);
            const axios = require('axios');
            const imgRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
            const timestamp = Date.now();
            const resultDir = path_1.default.join(__dirname, '../../uploads/results');
            if (!fs_1.default.existsSync(resultDir))
                fs_1.default.mkdirSync(resultDir, { recursive: true });
            const tmpInput = path_1.default.join(resultDir, `ai-in-${timestamp}.png`);
            const finalCleanOutput = path_1.default.join(resultDir, `ai-out-${timestamp}.png`);
            fs_1.default.writeFileSync(tmpInput, imgRes.data);
            const pyScript = path_1.default.join(__dirname, '../../py/remove_bg.py');
            const pythonPath = fs_1.default.existsSync('/opt/venv/bin/python3') ? '/opt/venv/bin/python3' : 'python3';
            const command = `${pythonPath} ${pyScript} "${tmpInput}" "${finalCleanOutput}"`;
            await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
            // If success, we serve the local clean version
            if (fs_1.default.existsSync(finalCleanOutput)) {
                fs_1.default.unlinkSync(tmpInput);
                const localResultUrl = `/uploads/results/ai-out-${timestamp}.png`;
                return res.status(200).json({ ok: true, data: { resultUrl: localResultUrl } });
            }
        }
        catch (postErr) {
            console.warn('[Studio] Post-processing AI result failed, falling back to original Replicate URL:', postErr);
        }
        return res.status(200).json({ ok: true, data: { resultUrl } });
    }
    catch (err) {
        console.error('[Studio VTON error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare la procesarea AI: ' + (err.message || 'Necunoscut') });
    }
});
exports.default = router;
