"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminAuth_1 = require("../../middleware/adminAuth");
const audit_1 = require("../../utils/audit");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const productSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    salePrice: zod_1.z.number().optional().nullable(),
    sku: zod_1.z.string().optional().nullable(),
    stock: zod_1.z.number().int().nonnegative(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']),
    brand: zod_1.z.string().optional().nullable(),
    category: zod_1.z.string().optional().nullable(),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        alt: zod_1.z.string().optional().nullable(),
        isMain: zod_1.z.boolean().optional(),
        position: zod_1.z.number().optional()
    })).optional()
});
// List products
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
    const products = await prisma.product.findMany({
        include: { images: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, products });
});
// Create product
router.post('/', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PRODUCT_CREATE', 'PRODUCT', product.id, data);
        }
        res.json({ ok: true, product });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// Update product
router.patch('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    const id = req.params.id;
    try {
        const { images, ...data } = productSchema.partial().parse(req.body);
        const updateData = { ...data };
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PRODUCT_UPDATE', 'PRODUCT', id, data);
        }
        res.json({ ok: true, product });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// Delete product
router.delete('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    const adminReq = req;
    const id = req.params.id;
    await prisma.product.delete({ where: { id } });
    if (adminReq.admin) {
        await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PRODUCT_DELETE', 'PRODUCT', id);
    }
    res.json({ ok: true, message: 'Product deleted' });
});
// Export CSV
router.get('/export/csv', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        let csv = 'ID,Title,SKU,Price,Stock,Status,Brand,Category\n';
        products.forEach(p => {
            csv += `"${p.id}","${p.title}","${p.sku || ''}",${p.price},${p.stock},"${p.status}","${p.brand || ''}","${p.category || ''}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
        res.status(200).send(csv);
    }
    catch (err) {
        res.status(500).json({ ok: false, message: 'Export failed' });
    }
});
exports.default = router;
