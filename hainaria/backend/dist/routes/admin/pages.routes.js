"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const adminAuth_1 = require("../../middleware/adminAuth");
const audit_1 = require("../../utils/audit");
const router = (0, express_1.Router)();
// GET /api/admin/pages - List all pages
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const pages = await prisma_1.default.page.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ ok: true, pages });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/admin/pages/:id - Single page
router.get('/:id', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const page = await prisma_1.default.page.findUnique({
            where: { id: req.params.id },
            include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 } }
        });
        if (!page)
            return res.status(404).json({ ok: false, message: 'Page not found' });
        res.json({ ok: true, page });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// POST /api/admin/pages - Create a new page
router.post('/', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    try {
        const { title, slug, content, status, metaTitle, metaDescription } = req.body;
        const page = await prisma_1.default.page.create({
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PAGE_CREATE', 'PAGE', page.id, { title, slug });
        }
        res.json({ ok: true, page });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// PATCH /api/admin/pages/:id - Update a page
router.patch('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    try {
        const { title, slug, content, status, metaTitle, metaDescription, ogImageAssetId } = req.body;
        const page = await prisma_1.default.page.update({
            where: { id: req.params.id },
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
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PAGE_UPDATE', 'PAGE', page.id, { title, slug, status });
        }
        res.json({ ok: true, page });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// DELETE /api/admin/pages/:id - Delete a page
router.delete('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    const adminReq = req;
    try {
        await prisma_1.default.page.delete({
            where: { id: req.params.id }
        });
        if (adminReq.admin) {
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'PAGE_DELETE', 'PAGE', req.params.id);
        }
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
exports.default = router;
