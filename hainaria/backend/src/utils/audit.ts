import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuditLog = async (
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: any
) => {
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
    } catch (err) {
        console.error('Failed to create audit log:', err);
    }
};
