"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'super-secret-admin-key';
const authenticateAdmin = async (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ ok: false, message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if admin still exists in DB
        const admin = await prisma.adminUser.findUnique({
            where: { id: decoded.id }
        });
        if (!admin) {
            return res.status(401).json({ ok: false, message: 'Unauthorized: Admin user no longer exists' });
        }
        req.admin = {
            id: admin.id,
            role: admin.role
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ ok: false, message: 'Unauthorized: Invalid token' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
