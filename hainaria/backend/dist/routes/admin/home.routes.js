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
// GET /api/admin/home - List all blocks
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
    try {
        const blocks = await prisma_1.default.contentBlock.findMany({
            orderBy: { position: 'asc' }
        });
        res.json({ ok: true, blocks });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// POST /api/admin/home - Add a new block
router.post('/', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    try {
        const { type, content, position } = req.body;
        const block = await prisma_1.default.contentBlock.create({
            data: { type, content, position: position || 0 }
        });
        if (adminReq.admin) {
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'HOME_BLOCK_CREATE', 'HOME_BLOCK', block.id, { type, content });
        }
        res.json({ ok: true, block });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// PATCH /api/admin/home/reorder - Bulk reorder blocks
router.patch('/reorder', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    try {
        const { orders } = req.body; // Array of { id, position }
        await prisma_1.default.$transaction(orders.map((o) => prisma_1.default.contentBlock.update({
            where: { id: o.id },
            data: { position: o.position }
        })));
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// PATCH /api/admin/home/:id - Update a block
router.patch('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN', 'EDITOR']), async (req, res) => {
    const adminReq = req;
    try {
        const { content, active, position } = req.body;
        const block = await prisma_1.default.contentBlock.update({
            where: { id: req.params.id },
            data: { content, active, position }
        });
        if (adminReq.admin) {
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'HOME_BLOCK_UPDATE', 'HOME_BLOCK', block.id, { content, active });
        }
        res.json({ ok: true, block });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
// DELETE /api/admin/home/:id - Delete a block
router.delete('/:id', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    const adminReq = req;
    try {
        await prisma_1.default.contentBlock.delete({
            where: { id: req.params.id }
        });
        if (adminReq.admin) {
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'HOME_BLOCK_DELETE', 'HOME_BLOCK', req.params.id);
        }
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
exports.default = router;
