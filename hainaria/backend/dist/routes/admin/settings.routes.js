"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const adminAuth_1 = require("../../middleware/adminAuth");
const audit_1 = require("../../utils/audit");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const settingsSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(1),
    logoAssetId: zod_1.z.string().optional().nullable(),
    faviconAssetId: zod_1.z.string().optional().nullable(),
    // Theme Tokens
    bgColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    surfaceColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    primaryTextColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    mutedTextColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    accentColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    highlightColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    borderColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    borderRadius: zod_1.z.number().int().optional(),
    // Footer & Contact
    footerColumns: zod_1.z.any().optional(),
    contactEmail: zod_1.z.string().email().optional().nullable(),
    contactPhone: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    // Navigation
    menuItems: zod_1.z.any().optional(),
    shippingRules: zod_1.z.any().optional(),
    taxConfig: zod_1.z.any().optional()
});
// Get settings
router.get('/', adminAuth_1.authenticateAdmin, async (req, res) => {
    const settings = await prisma_1.default.settingsStore.findFirst();
    res.json({ ok: true, settings });
});
// Update settings
router.patch('/', adminAuth_1.authenticateAdmin, (0, adminAuth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    const adminReq = req;
    try {
        const data = settingsSchema.parse(req.body);
        const settings = await prisma_1.default.settingsStore.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data }
        });
        if (adminReq.admin) {
            await (0, audit_1.createAuditLog)(adminReq.admin.id, 'SETTINGS_UPDATE', 'SETTINGS', '1', data);
        }
        res.json({ ok: true, settings });
    }
    catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});
exports.default = router;
