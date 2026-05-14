import { prisma } from '../lib/prisma';

export const logAuditEvent = async ({
  userId,
  action,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      ipAddress,
      userAgent,
      metadata,
    },
  });
};