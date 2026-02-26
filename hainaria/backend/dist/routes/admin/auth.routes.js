"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const adminAuth_1 = require("../../middleware/adminAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'super-secret-admin-key';
// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin)
            return res.status(401).json({ ok: false, message: 'Invalid credentials' });
        const isMatch = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!isMatch)
            return res.status(401).json({ ok: false, message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '8h' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });
        res.json({
            ok: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});
// Admin Logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ ok: true, message: 'Logged out' });
});
// Me (Get profile)
router.get('/me', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const admin = await prisma.adminUser.findUnique({
            where: { id: req.admin.id },
            select: { id: true, email: true, name: true, role: true }
        });
        res.json({ ok: true, admin });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});
exports.default = router;
