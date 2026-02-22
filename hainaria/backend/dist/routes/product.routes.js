"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// In-memory fallback (used when DB is unavailable)
const MOCK_PRODUCTS = [
    { id: 'm1', title: 'Geacă Denim Supradimensionată', brand: 'H&M', price: 85, size: 'XL', condition: 'Bun', category: 'Geci', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600', description: 'O geacă denim supradimensionată perfectă pentru look-uri casual. Material de calitate, confort maxim.', createdAt: new Date().toISOString() },
    { id: 'm2', title: 'Trench Coat Camel Oversize', brand: 'Mango', price: 210, size: 'L', condition: 'Nou cu etichetă', category: 'Geci', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600', description: 'Trench coat clasic în nuanță camel, stil oversize. Etichetă intactă, niciodată purtat.', createdAt: new Date().toISOString() },
    { id: 'm3', title: 'Blugi Mom Fit Albastru Deschis', brand: 'Bershka', price: 120, size: '28', condition: 'Foarte bun', category: 'Blugi', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=600', description: 'Blugi mom fit în nuanță albastru deschis, stare excelentă. Talie înaltă, croială confortabilă.', createdAt: new Date().toISOString() },
    { id: 'm4', title: 'Rochie Neagră Minimalistă', brand: 'Zara', price: 150, size: 'M', condition: 'Nou cu etichetă', category: 'Rochii', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600', description: 'Rochie neagră cu design minimalist, perfectă pentru ocazii formale sau casual chic.', createdAt: new Date().toISOString() },
    { id: 'm5', title: 'Tricou Bumbac Organic Alb', brand: 'H&M', price: 35, size: 'M', condition: 'Nou cu etichetă', category: 'Tricouri', tag: 'Outlet', stock: 5, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600', description: 'Tricou simplu din bumbac organic 100%, confortabil și durabil. Produs în mod sustenabil.', createdAt: new Date().toISOString() },
    { id: 'm6', title: 'Tenisi Canvas Albi Classic', brand: 'Nike', price: 180, size: '39', condition: 'Nou cu etichetă', category: 'Încălțăminte', tag: 'Outlet', stock: 2, imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600', description: 'Tenisi albi clasici din canvas, versatili și ușori. Perfecti pentru orice ținută street-style.', createdAt: new Date().toISOString() },
    { id: 'm7', title: 'Pulover Tricotat Bej', brand: 'Zara', price: 89, size: 'M', condition: 'Foarte bun', category: 'Pulovere', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1434389678232-04ce6cba1238?auto=format&fit=crop&q=80&w=600', description: 'Pulover tricotat în nuanță bej caldă, ideal pentru sezonul rece. Material moale, non-alergenic.', createdAt: new Date().toISOString() },
    { id: 'm8', title: 'Poșetă Piele Maro Camel', brand: 'Zara', price: 140, size: 'One Size', condition: 'Foarte bun', category: 'Accesorii', tag: 'Second-hand', stock: 1, imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=600', description: 'Poșetă din piele naturală în nuanță maro camel, stare impecabilă. Spațiu generos, hardware auriu.', createdAt: new Date().toISOString() },
];
// GET /api/products
router.get('/', async (req, res, next) => {
    try {
        const { category, tryOn } = req.query;
        let products;
        let source = 'db';
        try {
            const cat = Array.isArray(category) ? category[0] : category;
            const where = {};
            if (cat)
                where.category = cat;
            if (tryOn === 'true')
                where.isTryOnCutout = true;
            products = await prisma_1.default.product.findMany({
                where,
                include: { tryOnConfig: true },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (dbErr) {
            console.error('[DB] GET /products failed, using fallback:', dbErr.message);
            const cat = Array.isArray(category) ? category[0] : category;
            let filteredMock = MOCK_PRODUCTS;
            if (cat)
                filteredMock = filteredMock.filter((p) => p.category === cat);
            if (tryOn === 'true')
                filteredMock = filteredMock.filter((p) => p.isTryOnCutout);
            products = filteredMock;
            source = 'fallback';
        }
        return res.status(200).json({ ok: true, data: products, source });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/products/categories
router.get('/categories', async (_req, res, next) => {
    try {
        let categories;
        try {
            const rows = await prisma_1.default.product.findMany({
                select: { category: true },
                distinct: ['category'],
            });
            categories = rows.map((r) => r.category);
        }
        catch {
            categories = ['Geci', 'Tricouri', 'Pulovere', 'Blugi', 'Rochii', 'Încălțăminte', 'Accesorii'];
        }
        return res.status(200).json({ ok: true, data: categories });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const productId = String(req.params.id);
        let product = null;
        try {
            product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        }
        catch (dbErr) {
            console.error('[DB] GET /products/:id failed:', dbErr.message);
        }
        // If not found in DB, try fallback
        if (!product) {
            product = MOCK_PRODUCTS.find((p) => p.id === productId) || null;
        }
        if (!product) {
            return res.status(404).json({ ok: false, message: 'Produsul nu a fost găsit.' });
        }
        return res.status(200).json({ ok: true, data: product });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
