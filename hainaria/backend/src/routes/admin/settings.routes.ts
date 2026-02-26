import { Router, Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { authenticateAdmin, authorizeRole, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../utils/audit';
import { z } from 'zod';

const router = Router();

const settingsSchema = z.object({
    storeName: z.string().min(1),
    logoAssetId: z.string().optional().nullable(),
    faviconAssetId: z.string().optional().nullable(),

    // Theme Tokens
    bgColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    surfaceColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    primaryTextColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    mutedTextColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    highlightColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    borderColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    borderRadius: z.number().int().optional(),

    // Footer & Contact
    footerColumns: z.any().optional(),
    contactEmail: z.string().email().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),

    // Navigation
    menuItems: z.any().optional(),

    shippingRules: z.any().optional(),
    taxConfig: z.any().optional()
});

// Get settings
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    const settings = await prisma.settingsStore.findFirst();
    res.json({ ok: true, settings });
});

// Update settings
router.patch('/', authenticateAdmin, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const adminReq = req as AdminRequest;
    try {
        const data = settingsSchema.parse(req.body);
        const settings = await prisma.settingsStore.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data }
        });

        if (adminReq.admin) {
            await createAuditLog(adminReq.admin.id, 'SETTINGS_UPDATE', 'SETTINGS', '1', data);
        }

        res.json({ ok: true, settings });
    } catch (err: any) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

export default router;
