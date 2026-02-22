"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const studio_routes_1 = __importDefault(require("./routes/studio.routes"));
const avatar_routes_1 = __importDefault(require("./routes/avatar.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
// Stripe webhook needs raw body — must come before express.json()
app.use('/api/orders/webhook', express_1.default.raw({ type: 'application/json' }));
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/studio', studio_routes_1.default);
app.use('/api/avatars', avatar_routes_1.default);
// Static uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
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
