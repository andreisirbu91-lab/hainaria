import { Router, Request, Response } from 'express';
import Replicate from 'replicate';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const execPromise = util.promisify(exec);
const router = Router();

// GET /api/studio/backgrounds
router.get('/backgrounds', (_req: Request, res: Response): void => {
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
router.post('/remove-bg', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { avatarId } = req.body;
        console.log('[Studio] remove-bg request:', { avatarId, userId: req.user!.userId });
        if (!avatarId) return res.status(400).json({ ok: false, message: 'Nu ai specificat avatarul (avatarId lipsă).' });

        const avatar = await prisma.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar) {
            console.error('[Studio] Avatar not found in DB:', avatarId);
            return res.status(404).json({ ok: false, message: `Avatar negăsit în baza de date (ID: ${avatarId}).` });
        }

        if (avatar.userId !== req.user!.userId) {
            console.error('[Studio] Avatar ownership mismatch:', { avatarUserId: avatar.userId, requestUserId: req.user!.userId });
            return res.status(403).json({ ok: false, message: 'Nu ai permisiunea de a modifica acest avatar.' });
        }

        if (avatar.cutoutUrl) {
            return res.status(200).json({ ok: true, data: avatar });
        }

        const filename = path.basename(avatar.originalUrl);
        const inputPath = path.join(__dirname, '../../uploads/avatars', filename);
        const ext = path.extname(filename);
        const cutoutFilename = filename.replace(ext, `-cutout-${Date.now()}.png`);
        const outputPath = path.join(__dirname, '../../uploads/avatars', cutoutFilename);

        console.log('[Studio] Background removal paths:', { inputPath, outputPath, filename });

        if (!fs.existsSync(inputPath)) {
            console.error('[Studio] Input file missing:', inputPath);
            return res.status(404).json({ ok: false, message: 'Imaginea originală nu există pe server.' });
        }

        // Call Python rembg via venv if exists
        const pyScript = path.join(__dirname, '../../py/remove_bg.py');
        const pythonPath = fs.existsSync('/opt/venv/bin/python3') ? '/opt/venv/bin/python3' : 'python3';
        const command = `${pythonPath} ${pyScript} "${inputPath}" "${outputPath}"`;

        console.log('[Studio] Executing command:', command);

        try {
            const { stdout, stderr } = await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
            console.log('[Studio] rembg stdout:', stdout);
            if (stderr) console.warn('[Studio] rembg stderr:', stderr);
        } catch (pyErr: any) {
            console.error('[Studio] rembg execution error:', pyErr.stderr || pyErr.message);
            if (!fs.existsSync(outputPath)) {
                return res.status(500).json({
                    ok: false,
                    message: 'Eroare la eliminarea fundalului: ' + (pyErr.stderr || pyErr.message).slice(0, 100),
                    debug_command: command
                });
            }
        }

        if (!fs.existsSync(outputPath)) {
            return res.status(500).json({ ok: false, message: 'Imaginea procesată nu a fost salvată corect.' });
        }

        // Update DB
        const updated = await prisma.userAvatar.update({
            where: { id: avatarId },
            data: { cutoutUrl: `/uploads/avatars/${cutoutFilename}` }
        });

        return res.status(200).json({ ok: true, data: updated });
    } catch (err: any) {
        console.error('[Studio remove-bg error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare server la remove-bg.' });
    }
});

// POST /api/studio/looks
router.post('/looks', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { avatarId, name, sceneJson, previewUrl } = req.body;
        if (!avatarId || !sceneJson) {
            return res.status(400).json({ ok: false, message: 'Te rugăm să completezi formularul de look.' });
        }

        const look = await prisma.tryOnLook.create({
            data: {
                userId: req.user!.userId,
                avatarId,
                name,
                sceneJson,
                previewUrl
            }
        });

        return res.status(201).json({ ok: true, data: look });
    } catch (err: any) {
        console.error('[Studio save look error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare la salvarea look-ului.' });
    }
});

// GET /api/studio/looks
router.get('/looks', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const looks = await prisma.tryOnLook.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            include: { avatar: true }
        });
        return res.status(200).json({ ok: true, data: looks });
    } catch (err: any) {
        return res.status(500).json({ ok: false, message: 'Eroare la preluarea look-urilor.' });
    }
});

// POST /api/studio/product-cutout/:id
router.post('/product-cutout/:id', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const productId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
        const conf = await prisma.productTryOnConfig.findUnique({ where: { productId } });

        if (!conf) return res.status(404).json({ ok: false, message: 'Produsul nu are date pt probare.' });
        if (conf.cutoutUrl) return res.status(200).json({ ok: true, cutoutUrl: conf.cutoutUrl }); // Deja procesat

        const prod = await prisma.product.findUnique({ where: { id: productId } });
        if (!prod || !prod.imageUrl) return res.status(404).json({ ok: false, message: 'Produs invalid.' });

        // Download Unsplash img to /tmp and process
        const axios = require('axios');
        const imgRes = await axios.get(prod.imageUrl, { responseType: 'arraybuffer' });

        const timestamp = Date.now();
        const productsDir = path.join(__dirname, '../../uploads/products');
        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
        }

        const tmpInput = path.join(productsDir, `tmp-${timestamp}.jpg`);
        const finalOutput = path.join(productsDir, `prod-${productId}-cutout.png`);

        fs.writeFileSync(tmpInput, imgRes.data);

        const pyScript = path.join(__dirname, '../../py/remove_bg.py');
        const command = `python3 ${pyScript} "${tmpInput}" "${finalOutput}"`;

        try {
            await execPromise(command, { maxBuffer: 10 * 1024 * 1024 });
        } catch (pyErr: any) {
            if (!fs.existsSync(finalOutput)) {
                return res.status(500).json({ ok: false, message: 'Eroare procesare produs.' });
            }
        }

        // Curățare temporar
        fs.unlinkSync(tmpInput);

        const cutoutUrl = `/uploads/products/prod-${productId}-cutout.png`;

        await prisma.productTryOnConfig.update({
            where: { productId },
            data: { cutoutUrl }
        });

        return res.status(200).json({ ok: true, cutoutUrl });
    } catch (err) {
        console.error('[Prod cutout err]', err);
        return res.status(500).json({ ok: false, message: 'Eroare server procesare produs.' });
    }
});

// POST /api/studio/generate-vton
router.post('/generate-vton', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { avatarId, productId } = req.body;
        console.log('[Studio] generate-vton request:', { avatarId, productId, userId: req.user!.userId });

        if (!avatarId || !productId) {
            return res.status(400).json({ ok: false, message: 'Nu ai selectat avatarul sau produsul.' });
        }

        const avatar = await prisma.userAvatar.findUnique({ where: { id: avatarId } });
        if (!avatar) {
            console.error('[Studio] Avatar not found:', avatarId);
            return res.status(404).json({ ok: false, message: 'Avatarul nu a fost găsit în baza de date.' });
        }

        if (avatar.userId !== req.user!.userId) {
            console.error('[Studio] Avatar ownership mismatch:', { avatarUserId: avatar.userId, requestUserId: req.user!.userId });
            return res.status(403).json({ ok: false, message: 'Nu ai permisiunea de a folosi acest avatar.' });
        }

        const conf = await prisma.productTryOnConfig.findUnique({ where: { productId } });
        if (!conf || !conf.cutoutUrl) {
            console.error('[Studio] Product config missing or partial:', { productId, conf });
            return res.status(400).json({ ok: false, message: 'Produsul nu are decupaj valid pt procesare AI.' });
        }

        let category = 'upper_body';
        if (conf.garmentType === 'BOTTOM') category = 'lower_body';
        else if (conf.garmentType === 'DRESS') category = 'dresses';

        console.log('[Studio] Category mapped:', { category, garmentType: conf.garmentType });

        const avatarLocalPath = path.join(__dirname, '../..', avatar.originalUrl);
        const garmentLocalPath = path.join(__dirname, '../..', conf.cutoutUrl);

        console.log('[Studio] AI Try-on paths:', { avatarLocalPath, garmentLocalPath });

        if (!fs.existsSync(avatarLocalPath)) {
            console.error('[Studio] Avatar file missing on disk:', avatarLocalPath);
            return res.status(404).json({ ok: false, message: 'Imaginea avatarului a dispărut de pe server.' });
        }

        if (!fs.existsSync(garmentLocalPath)) {
            console.error('[Studio] Garment file missing on disk:', garmentLocalPath);
            return res.status(404).json({ ok: false, message: 'Imaginea decupată a produsului a dispărut de pe server.' });
        }

        const getBase64DataURI = (file: string) => {
            const ext = path.extname(file).toLowerCase();
            const mime = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
            const b64 = fs.readFileSync(file, { encoding: 'base64' });
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

        const replicate = new Replicate({
            auth: replicateToken,
        });

        const output = await replicate.run(
            "cuiaxi/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
            {
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
            }
        );

        let resultUrl = '';
        if (Array.isArray(output)) {
            resultUrl = String(output[0]);
        } else {
            resultUrl = String(output);
        }

        return res.status(200).json({ ok: true, data: { resultUrl } });
    } catch (err: any) {
        console.error('[Studio VTON error]', err);
        return res.status(500).json({ ok: false, message: 'Eroare la procesarea AI: ' + (err.message || 'Necunoscut') });
    }
});

export default router;
