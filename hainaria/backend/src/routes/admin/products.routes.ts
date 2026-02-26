import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, authorizeRole, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../utils/audit';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    salePrice: z.number().optional().nullable(),
    sku: z.string().optional().nullable(),
    stock: z.number().int().nonnegative(),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    brand: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    images: z.array(z.object({
        url: z.string().url(),
        alt: z.string().optional().nullable(),
        isMain: z.boolean().optional(),
        position: z.number().optional()
    })).optional()
});

// List products
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        include: { images: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, products });
});

// Create product
router.post('/', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const { images, ...data } = productSchema.parse(req.body);
        const slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

        const product = await prisma.product.create({
            data: {
                ...data,
                slug,
                images: images ? {
                    create: images.map((img, idx) => ({
                        ...img,
                        position: img.position ?? idx
                    }))
                } : undefined
            },
            include: { images: true }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'PRODUCT_CREATE', 'PRODUCT', product.id, data);
        }

        res.json({ ok: true, product });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// Update product
router.patch('/:id', authenticateAdmin, authorizeRole(['ADMIN', 'EDITOR']), async (req: Request, res: Response): Promise<any> => {
    const adminReq = req as AdminRequest;
    const id = req.params.id as string;
    try {
        const { images, ...data } = productSchema.partial().parse(req.body);

        const updateData: any = { ...data };
        if (images) {
            updateData.images = {
                deleteMany: {},
                create: images.map((img, idx) => ({
                    ...img,
                    position: img.position ?? idx
                }))
            };
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { images: true }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'PRODUCT_UPDATE', 'PRODUCT', id, data);
        }

        res.json({ ok: true, product });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// Delete product
router.delete('/:id', authenticateAdmin, authorizeRole(['ADMIN']), async (req: Request, res: Response): Promise<any> => {
    const adminReq = req as AdminRequest;
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });

    if (adminReq.admin) {
        await createAuditLog(adminReq.admin.id, 'PRODUCT_DELETE', 'PRODUCT', id);
    }

    res.json({ ok: true, message: 'Product deleted' });
});

// Export CSV
router.get('/export/csv', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();

        let csv = 'ID,Title,SKU,Price,Stock,Status,Brand,Category\n';
        products.forEach(p => {
            csv += `"${p.id}","${p.title}","${p.sku || ''}",${p.price},${p.stock},"${p.status}","${p.brand || ''}","${p.category || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ ok: false, message: 'Export failed' });
    }
});

export default router;
