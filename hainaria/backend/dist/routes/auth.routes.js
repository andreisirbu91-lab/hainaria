"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ ok: false, message: 'Adresa de email este invalidă.' });
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ ok: false, message: 'Parola trebuie să aibă cel puțin 8 caractere.' });
        }
        // Check duplicate
        let existing;
        try {
            existing = await prisma_1.default.user.findUnique({ where: { email } });
        }
        catch (dbErr) {
            console.error('[DB] register findUnique failed:', dbErr.message);
            return res.status(503).json({ ok: false, message: 'Baza de date este indisponibilă momentan.' });
        }
        if (existing) {
            return res.status(409).json({ ok: false, message: 'Email deja folosit.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        let user;
        try {
            user = await prisma_1.default.user.create({
                data: { email, passwordHash },
                select: { id: true, email: true, createdAt: true },
            });
        }
        catch (dbErr) {
            console.error('[DB] register create failed:', dbErr.message);
            return res.status(503).json({ ok: false, message: 'Nu s-a putut crea contul. Încearcă din nou.' });
        }
        return res.status(201).json({ ok: true, message: 'Cont creat cu succes.', user });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ ok: false, message: 'Email-ul și parola sunt obligatorii.' });
        }
        let user;
        try {
            user = await prisma_1.default.user.findUnique({ where: { email } });
        }
        catch (dbErr) {
            console.error('[DB] login findUnique failed:', dbErr.message);
            return res.status(503).json({ ok: false, message: 'Baza de date este indisponibilă momentan.' });
        }
        if (!user) {
            return res.status(401).json({ ok: false, message: 'Date de autentificare invalide.' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ ok: false, message: 'Date de autentificare invalide.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'hainaria_dev_secret', { expiresIn: '7d' });
        return res.status(200).json({
            ok: true,
            message: 'Autentificare reușită.',
            token,
            user: { id: user.id, email: user.email },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
