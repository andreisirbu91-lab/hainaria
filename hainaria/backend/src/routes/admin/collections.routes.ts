import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, authorizeRole, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../utils/audit';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const collectionSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    productIds: z.array(z.string()).optional()
});

// List collections
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    const collections = await prisma.collection.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, collections });
});

// Create collection
router.post('/', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { productIds, ...data } = collectionSchema.parse(req.body);
        const slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

        const collection = await prisma.collection.create({
            data: {
                ...data,
                slug,
                products: productIds ? {
                    create: productIds.map((id, idx) => ({
                        productId: id,
                        position: idx
                    }))
                } : undefined
            }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'COLLECTION_CREATE', 'COLLECTION', collection.id, data);
        }

        res.json({ ok: true, collection });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// Update collection
router.patch('/:id', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response): Promise<any> => {
    const adminReq = req as AdminRequest;
    const id = req.params.id as string;
    try {
        const { productIds, ...data } = collectionSchema.partial().parse(req.body);

        const updateData: any = { ...data };
        if (productIds) {
            updateData.products = {
                deleteMany: {},
                create: productIds.map((pid, idx) => ({
                    productId: pid,
                    position: idx
                }))
            };
        }

        const collection = await prisma.collection.update({
            where: { id },
            data: updateData
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'COLLECTION_UPDATE', 'COLLECTION', id, data);
        }

        res.json({ ok: true, collection });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// Delete collection
router.delete('/:id', authenticateAdmin, authorizeRole(['ADMIN']), async (req: Request, res: Response): Promise<any> => {
    const adminReq = req as AdminRequest;
    const id = req.params.id as string;
    await prisma.collection.delete({ where: { id } });

    if (adminReq.admin) {
        await createAuditLog(adminReq.admin.id, 'COLLECTION_DELETE', 'COLLECTION', id);
    }

    res.json({ ok: true, message: 'Collection deleted' });
});

export default router;
