import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from '../../middleware/adminAuth';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const [
            productCount,
            userCount,
            orderCount,
            totalRevenue,
            vtoJobsCount,
            vtoSuccessCount
        ] = await Promise.all([
            prisma.product.count(),
            prisma.user.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { totalAmount: true } }),
            prisma.tryOnJob.count(),
            prisma.tryOnJob.count({ where: { status: 'COMPLETED' } })
        ]);

        const recentLogs = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { name: true } } }
        });

        res.json({
            ok: true,
            stats: {
                products: productCount,
                users: userCount,
                orders: orderCount,
                revenue: totalRevenue._sum.totalAmount || 0,
                vtoJobs: vtoJobsCount,
                vtoSuccessRate: vtoJobsCount > 0 ? (vtoSuccessCount / vtoJobsCount) * 100 : 0
            },
            recentLogs
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});

export default router;
