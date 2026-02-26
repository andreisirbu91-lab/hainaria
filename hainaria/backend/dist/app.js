"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const studio_routes_1 = __importDefault(require("./routes/studio.routes"));
const avatar_routes_1 = __importDefault(require("./routes/avatar.routes"));
const tryon_routes_1 = __importDefault(require("./routes/tryon.routes"));
const auth_routes_2 = __importDefault(require("./routes/admin/auth.routes"));
const products_routes_1 = __importDefault(require("./routes/admin/products.routes"));
const media_routes_1 = __importDefault(require("./routes/admin/media.routes"));
const collections_routes_1 = __importDefault(require("./routes/admin/collections.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/admin/dashboard.routes"));
const settings_routes_1 = __importDefault(require("./routes/admin/settings.routes"));
const home_routes_1 = __importDefault(require("./routes/admin/home.routes"));
const pages_routes_1 = __importDefault(require("./routes/admin/pages.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
// Stripe webhook needs raw body — must come before express.json()
app.use('/api/orders/webhook', express_1.default.raw({ type: 'application/json' }));
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/studio', studio_routes_1.default);
app.use('/api/avatars', avatar_routes_1.default);
app.use('/api/tryon', tryon_routes_1.default);
app.use('/api/public', public_routes_1.default);
// Admin Routes
app.use('/api/admin/auth', auth_routes_2.default);
app.use('/api/admin/products', products_routes_1.default);
app.use('/api/admin/media', media_routes_1.default);
app.use('/api/admin/collections', collections_routes_1.default);
app.use('/api/admin/dashboard', dashboard_routes_1.default);
app.use('/api/admin/settings', settings_routes_1.default);
app.use('/api/admin/home', home_routes_1.default);
app.use('/api/admin/pages', pages_routes_1.default);
// Static uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (_req, res) => {
    const files = fs_1.default.readdirSync(process.cwd());
    const envKeys = Object.keys(process.env);
    const hasVenv = fs_1.default.existsSync('/opt/venv/bin/python3');
    let pythonVersion = 'unknown';
    let rembgCheck = 'unknown';
    try {
        const { execSync } = require('child_process');
        pythonVersion = execSync('python3 --version').toString().trim();
        rembgCheck = execSync('python3 -c "import rembg; print(\\"ok\\")"').toString().trim();
    }
    catch (e) {
        pythonVersion = 'error: ' + (e.message || e);
    }
    res.status(200).json({
        ok: true,
        timestamp: new Date().toISOString(),
        cwd: process.cwd(),
        files: files.filter((f) => !f.startsWith('.')),
        hasDotEnv: fs_1.default.existsSync(path_1.default.join(process.cwd(), '.env')),
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
app.use((_req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta nu a fost găsită.' });
});
// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.stack || err.message || err);
    res.status(err.status || 500).json({
        ok: false,
        message: err.message || 'Eroare internă de server.',
        code: err.code,
    });
});
exports.default = app;
