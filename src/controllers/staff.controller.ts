import { Request, Response } from "express";
import { prisma } from '../lib/prisma';
import crypto from "crypto";

import { assignRoleValidation } from "../validation/staffValidation";
import { logAuditEvent } from "../services/audit.service";

const generateEmployeeCode = (): string => {
  let code = crypto.randomBytes(6).toString('hex').toUpperCase();

  return code;
};

const getUnassignedUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "GUEST" },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
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

const createStaff = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { userId, salary, departmentId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "User id is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (existingStaff) {
      return res.status(400).json({ error: "User is already assigned as staff" });
    }

    let employeeCode = generateEmployeeCode();

    while (
      await prisma.staff.findUnique({
        where: { employeeCode },
      })
    ) {
      employeeCode = generateEmployeeCode();
    }

    const newStaff = await prisma.staff.create({
      data: {
        userId,
        salary,
        departmentId,
        employeeCode,
        employmentStatus: "ACTIVE",
      },
      include: {
        user: true,
        department: true,
      },
    });

    await logAuditEvent({
      userId: adminId,
      action: 'CREATE_STAFF',
      entityName: "Staff",
      entityId: newStaff.id,
      ipAddress: req.ip,
    });

    return res.status(201).json(newStaff);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create staff" });
  }
};

const getAllStaff = async (_req: Request, res: Response) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: true,
        department: true,
        doctor: true,
        nurse: true,
        payrolls: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(staff);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getStaffById = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: String(staffId) },
      include: {
        user: true,
        department: true,
        doctor: true,
        nurse: true,
        payrolls: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found." });
    }

    return res.status(200).json(staff);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateStaff = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { staffId } = req.params;
    const payload = req.body;

    const existingStaff = await prisma.staff.findUnique({
      where: { id: String(staffId) },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: String(staffId) },
      data: {
        salary: payload.salary ? payload.salary : existingStaff.salary,
        departmentId: payload.departmentId ? payload.departmentId : existingStaff.departmentId,
        employmentStatus: payload.employmentStatus ? payload.employmentStatus : existingStaff.employmentStatus,
      },
      include: {
        user: true,
        department: true,
      },
    });
    
    await logAuditEvent({
      userId: adminId,
      action: 'UPDATE_STAFF',
      entityName: "Staff",
      entityId: updatedStaff.id,
      oldValues: {
        salary: existingStaff.salary,
        departmentId: existingStaff.departmentId,
        employmentStatus: existingStaff.employmentStatus
      },
      newValues: { ...payload },
      ipAddress: req.ip,
    });

    return res.status(200).json(updatedStaff);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteStaff = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { staffId } = req.params;

    const existingStaff = await prisma.staff.findUnique({
      where: { id: String(staffId) },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await prisma.staff.delete({
      where: { id: String(staffId) },
    });

    await logAuditEvent({
      userId: adminId,
      action: 'DELETE_STAFF',
      entityName: "Staff",
      entityId: existingStaff.id,
      oldValues: existingStaff,
      ipAddress: req.ip,
    });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


// CRUD DOCTOR
// CRUD NURSE

// ASSIGN DEPARTMENT
// UPDATE EMPLOYMENT STATUS

export default {
  getUnassignedUsers,
  assignRole,
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
}