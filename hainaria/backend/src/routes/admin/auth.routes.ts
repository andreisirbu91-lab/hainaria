import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, AdminRequest } from '../../middleware/adminAuth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'super-secret-admin-key';

// Admin Login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: admin.id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

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
    } catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});

// Admin Logout
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('admin_token');
    res.json({ ok: true, message: 'Logged out' });
});

// Me (Get profile)
router.get('/me', authenticateAdmin, async (req: AdminRequest, res: Response): Promise<any> => {
    try {
        const admin = await prisma.adminUser.findUnique({
            where: { id: req.admin!.id },
            select: { id: true, email: true, name: true, role: true }
        });
        res.json({ ok: true, admin });
    } catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});

export default router;
