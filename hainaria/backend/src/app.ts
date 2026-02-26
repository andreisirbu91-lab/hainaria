import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';
import studioRoutes from './routes/studio.routes';
import avatarRoutes from './routes/avatar.routes';
import path from 'path';

dotenv.config();

const app = express();

// CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:80',
    'https://hainaria.rzs-it.ro',
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Configurație CORS invalidă pentru această sursă.'));
        }
    },
    credentials: true,
}));

// Stripe webhook needs raw body — must come before express.json()
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/avatars', avatarRoutes);

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
