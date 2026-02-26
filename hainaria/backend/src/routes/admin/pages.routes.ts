import { Router, Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { authenticateAdmin, authorizeRole } from '../../middleware/adminAuth';
import { createAuditLog } from '../../utils/audit';
import { AdminRequest } from '../../middleware/adminAuth';

const router = Router();

// GET /api/admin/pages - List all pages
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ ok: true, pages });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/admin/pages/:id - Single page
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const page = await prisma.page.findUnique({
            where: { id: req.params.id as string },
            include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 } }
        });
        if (!page) return res.status(404).json({ ok: false, message: 'Page not found' });
        res.json({ ok: true, page });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// POST /api/admin/pages - Create a new page
router.post('/', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { title, slug, content, status, metaTitle, metaDescription } = req.body;

        const page = await prisma.page.create({
            data: {
                title,
                slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                content,
                status: status || 'DRAFT',
                metaTitle,
                metaDescription,
                versions: {
                    create: { content, isPublished: status === 'PUBLISHED' }
                }
            }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'PAGE_CREATE', 'PAGE', page.id, { title, slug });
        }

        res.json({ ok: true, page });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// PATCH /api/admin/pages/:id - Update a page
router.patch('/:id', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { title, slug, content, status, metaTitle, metaDescription, ogImageAssetId } = req.body;

        const page = await prisma.page.update({
            where: { id: req.params.id as string },
            data: {
                title,
                slug,
                content,
                status,
                metaTitle,
                metaDescription,
                ogImageAssetId,
                versions: content ? {
                    create: { content, isPublished: status === 'PUBLISHED' }
                } : undefined
            }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'PAGE_UPDATE', 'PAGE', page.id, { title, slug, status });
        }

        res.json({ ok: true, page });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// DELETE /api/admin/pages/:id - Delete a page
router.delete('/:id', authenticateAdmin, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        await prisma.page.delete({
            where: { id: req.params.id as string }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'PAGE_DELETE', 'PAGE', req.params.id as string);
        }

        res.json({ ok: true });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

export default router;
