import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET /api/public/home - Get published content blocks
router.get('/home', async (req: Request, res: Response) => {
    try {
        const blocks = await prisma.contentBlock.findMany({
            where: { active: true },
            orderBy: { position: 'asc' }
        });
        res.json({ ok: true, blocks });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/settings - Get global store settings
router.get('/settings', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.settingsStore.findUnique({
            where: { id: 1 }
        });
        res.json({ ok: true, settings });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/products - List products
router.get('/products', async (req: Request, res: Response) => {
    try {
        const { category, collection, q } = req.query;

        const where: any = { status: 'PUBLISHED' };
        if (category) where.category = String(category);
        if (collection) {
            where.collections = {
                some: {
                    collection: { slug: String(collection) }
                }
            };
        }
        if (q) {
            where.OR = [
                { title: { contains: String(q), mode: 'insensitive' } },
                { description: { contains: String(q), mode: 'insensitive' } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: { images: { orderBy: { position: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ ok: true, products });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/products/:slug - Product details
router.get('/products/:slug', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug as string },
            include: {
                images: { orderBy: { position: 'asc' } },
                variants: true,
                attributes: true,
                tryOnConfig: true
            }
        });

        if (!product || product.status !== 'PUBLISHED') {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        res.json({ ok: true, product });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/collections - List collections
router.get('/collections', async (req: Request, res: Response) => {
    try {
        const collections = await prisma.collection.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ ok: true, collections });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/collections/:slug - Collection details + products
router.get('/collections/:slug', async (req: Request, res: Response) => {
    try {
        const collection = await prisma.collection.findUnique({
            where: { slug: req.params.slug as string },
            include: {
                products: {
                    include: {
                        product: {
                            include: { images: { orderBy: { position: 'asc' } } }
                        }
                    },
                    orderBy: { position: 'asc' }
                }
            }
        });

        if (!collection) {
            return res.status(404).json({ ok: false, message: 'Collection not found' });
        }

        res.json({ ok: true, collection });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/public/pages/:slug - Static/Legal pages
router.get('/pages/:slug', async (req: Request, res: Response) => {
    try {
        const page = await prisma.page.findUnique({
            where: { slug: req.params.slug as string }
        });

        if (!page || page.status !== 'PUBLISHED') {
            return res.status(404).json({ ok: false, message: 'Page not found' });
        }

        res.json({ ok: true, page });
    } catch (err: any) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

export default router;
