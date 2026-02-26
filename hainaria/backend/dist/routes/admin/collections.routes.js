"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminAuth_1 = require("../../middleware/adminAuth");
const audit_1 = require("../../utils/audit");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const collectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().optional().nullable(),
    productIds: zod_1.z.array(zod_1.z.string()).optional()
});
// List collections
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
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
router.post('/', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'COLLECTION_CREATE', 'COLLECTION', collection.id, data);
        }
        res.json({ ok: true, collection });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// Update collection
router.patch('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    const id = req.params.id;
    try {
        const { productIds, ...data } = collectionSchema.partial().parse(req.body);
        const updateData = { ...data };
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'COLLECTION_UPDATE', 'COLLECTION', id, data);
        }
        res.json({ ok: true, collection });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// Delete collection
router.delete('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    const adminReq = req;
    const id = req.params.id;
    await prisma.collection.delete({ where: { id } });
    if (adminReq.admin) {
        await (0, audit_1.createAuditLog)(adminReq.admin.id, 'COLLECTION_DELETE', 'COLLECTION', id);
    }
    res.json({ ok: true, message: 'Collection deleted' });
});
exports.default = router;
