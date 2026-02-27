import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'super-secret-admin-key';

export interface AdminRequest extends Request {
    admin?: {
        id: string;
        role: AdminRole;
    };
}

export const authenticateAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<any> => {
    // Accept token from cookie OR Authorization Bearer header
    let token = req.cookies?.admin_token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ ok: false, message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: AdminRole };

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
    } catch (err) {
        return res.status(401).json({ ok: false, message: 'Unauthorized: Invalid token' });
    }
};

export const authorizeRole = (roles: AdminRole[]) => {
    return (req: AdminRequest, res: Response, next: NextFunction) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
