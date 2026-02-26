"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminAuth_1 = require("../../middleware/adminAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/stats', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const [productCount, userCount, orderCount, totalRevenue, vtoJobsCount, vtoSuccessCount] = await Promise.all([
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
    }
    catch (err) {
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});
exports.default = router;
