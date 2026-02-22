import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Get profile
router.get('/profile', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: { id: true, email: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
