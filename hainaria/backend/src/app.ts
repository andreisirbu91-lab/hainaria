import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';
import studioRoutes from './routes/studio.routes';
import avatarRoutes from './routes/avatar.routes';
import tryonRoutes from './routes/tryon.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminProductRoutes from './routes/admin/products.routes';
import adminMediaRoutes from './routes/admin/media.routes';
import adminCollectionRoutes from './routes/admin/collections.routes';
import adminDashboardRoutes from './routes/admin/dashboard.routes';
import adminSettingsRoutes from './routes/admin/settings.routes';
import adminHomeRoutes from './routes/admin/home.routes';
import adminPageRoutes from './routes/admin/pages.routes';
import publicRoutes from './routes/public.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieParser());

// Stripe webhook needs raw body — must come before express.json()
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/avatars', avatarRoutes);
app.use('/api/tryon', tryonRoutes);
app.use('/api/public', publicRoutes);

// Admin Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/media', adminMediaRoutes);
app.use('/api/admin/collections', adminCollectionRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/home', adminHomeRoutes);
app.use('/api/admin/pages', adminPageRoutes);

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    const files = fs.readdirSync(process.cwd());
    const envKeys = Object.keys(process.env);

    const hasVenv = fs.existsSync('/opt/venv/bin/python3');
    let pythonVersion = 'unknown';
    let rembgCheck = 'unknown';

    try {
        const { execSync } = require('child_process');
        pythonVersion = execSync('python3 --version').toString().trim();
        rembgCheck = execSync('python3 -c "import rembg; print(\\"ok\\")"').toString().trim();
    } catch (e: any) {
        pythonVersion = 'error: ' + (e.message || e);
    }

    res.status(200).json({
        ok: true,
        timestamp: new Date().toISOString(),
        cwd: process.cwd(),
        files: files.filter((f: string) => !f.startsWith('.')),
        hasDotEnv: fs.existsSync(path.join(process.cwd(), '.env')),
        python: {
            hasVenv,
            version: pythonVersion,
            rembg: rembgCheck
        },
        envKeys: envKeys.sort(),
        debug_tokenExists: !!(process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN),
        debug_tokenLength: (process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || "").length
    });
});

// 404
app.use((_req: Request, res: Response) => {
    res.status(404).json({ ok: false, message: 'Ruta nu a fost găsită.' });
});

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[ERROR]', err.stack || err.message || err);
    res.status(err.status || 500).json({
        ok: false,
        message: err.message || 'Eroare internă de server.',
        code: err.code,
    });
});

export default app;
