import { prisma } from '../lib/prisma';

export const logAuditEvent = async ({
  userId,
  action,
  entityName,
  entityId,
  oldValues,
  newValues,
  ipAddress,
}: {
  userId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityName,
      entityId,
      oldValues,
      newValues,
      ipAddress,
    },
  });
};