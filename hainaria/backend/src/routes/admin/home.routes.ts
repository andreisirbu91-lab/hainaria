import { Router, Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { authenticateAdmin, authorizeRole } from '../../middleware/adminAuth';
import { createAuditLog } from '../../utils/audit';
import { AdminRequest } from '../../middleware/adminAuth';

const router = Router();

// GET /api/admin/home - List all blocks
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const blocks = await prisma.contentBlock.findMany({
            orderBy: { position: 'asc' }
        });
        res.json({ ok: true, blocks });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// POST /api/admin/home - Add a new block
router.post('/', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { type, content, position } = req.body;
        const block = await prisma.contentBlock.create({
            data: { type, content, position: position || 0 }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'HOME_BLOCK_CREATE', 'HOME_BLOCK', block.id, { type, content });
        }

        res.json({ ok: true, block });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// PATCH /api/admin/home/reorder - Bulk reorder blocks
router.patch('/reorder', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    try {
        const { orders } = req.body; // Array of { id, position }

        await prisma.$transaction(
            orders.map((o: { id: string, position: number }) =>
                prisma.contentBlock.update({
                    where: { id: o.id },
                    data: { position: o.position }
                })
            )
        );

        res.json({ ok: true });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// PATCH /api/admin/home/:id - Update a block
router.patch('/:id', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { content, active, position } = req.body;
        const block = await prisma.contentBlock.update({
            where: { id: req.params.id as string },
            data: { content, active, position }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'HOME_BLOCK_UPDATE', 'HOME_BLOCK', block.id, { content, active });
        }

        res.json({ ok: true, block });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// DELETE /api/admin/home/:id - Delete a block
router.delete('/:id', authenticateAdmin, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        await prisma.contentBlock.delete({
            where: { id: req.params.id as string }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'HOME_BLOCK_DELETE', 'HOME_BLOCK', req.params.id as string);
        }

        res.json({ ok: true });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

export default router;
