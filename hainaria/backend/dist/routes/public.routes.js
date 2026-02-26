"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// GET /api/public/home - Get published content blocks
router.get('/home', async (req, res) => {
    try {
        const blocks = await prisma_1.default.contentBlock.findMany({
            where: { active: true },
            orderBy: { position: 'asc' }
        });
        res.json({ ok: true, blocks });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/settings - Get global store settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await prisma_1.default.settingsStore.findUnique({
            where: { id: 1 }
        });
        res.json({ ok: true, settings });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/products - List products
router.get('/products', async (req, res) => {
    try {
        const { category, collection, q } = req.query;
        const where = { status: 'PUBLISHED' };
        if (category)
            where.category = String(category);
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
        const products = await prisma_1.default.product.findMany({
            where,
            include: { images: { orderBy: { position: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ ok: true, products });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/products/:slug - Product details
router.get('/products/:slug', async (req, res) => {
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { slug: req.params.slug },
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
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/collections - List collections
router.get('/collections', async (req, res) => {
    try {
        const collections = await prisma_1.default.collection.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ ok: true, collections });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/collections/:slug - Collection details + products
router.get('/collections/:slug', async (req, res) => {
    try {
        const collection = await prisma_1.default.collection.findUnique({
            where: { slug: req.params.slug },
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
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
// GET /api/public/pages/:slug - Static/Legal pages
router.get('/pages/:slug', async (req, res) => {
    try {
        const page = await prisma_1.default.page.findUnique({
            where: { slug: req.params.slug }
        });
        if (!page || page.status !== 'PUBLISHED') {
            return res.status(404).json({ ok: false, message: 'Page not found' });
        }
        res.json({ ok: true, page });
    }
    catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
exports.default = router;
