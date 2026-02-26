"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createAuditLog = async (adminId, action, entityType, entityId, changes) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                entityType,
                entityId,
                changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined
            }
        });
    }
    catch (err) {
        console.error('Failed to create audit log:', err);
    }
};
exports.createAuditLog = createAuditLog;
