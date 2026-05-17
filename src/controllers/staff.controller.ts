import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

import { assignRoleValidation } from "../validation/staffValidation";
import { logAuditEvent } from "../services/audit.service";

const getUnassignedUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { role: "GUEST" },
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return res.json(users);
}

const assignRole = async (req: Request, res: Response) => {
  const { userId, role } = req.body;
  const adminId = req.user?.id;

  const validation = assignRoleValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await logAuditEvent({
      userId: adminId,
      action: 'ASSIGN_ROLE',
      entityName: "User",
      entityId: updatedUser.id,
      oldValues: { role: user.role },
      newValues: { role },
      ipAddress: req.ip,
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user" });
  }
}

// CRUD STAFF
// CRUD DOCTOR
// CRUD NURSE

// ASSIGN DEPARTMENT
// UPDATE EMPLOYMENT STATUS

const createStaff = async (req: Request, res: Response) => { }

export default {
  getUnassignedUsers,
  assignRole,
}