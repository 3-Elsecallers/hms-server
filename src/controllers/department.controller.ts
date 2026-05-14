import { Request, Response } from "express";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from '../lib/prisma';

import { createDepartmentValidation, departmentStaffValidation, StaffType } from "../validation/departmentValidation";
import { s3 } from "../utils/s3";
import { disconnect } from "node:cluster";

const createDepartment = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const validation = createDepartmentValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const department = await prisma.department.create({
      data: {
        ...req.body,
        createdBy: userId,
        updatedBy: userId
      }
    });

    return res.status(201).json(department);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create department" });
  }
}

const getDepartments = async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({ include: { treatments: true, wards: true } });

  return res.json(departments);
}

const getDepartment = async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  const department = await prisma.department.findUnique({
    where: { id: String(departmentId) },
    include: { treatments: true, wards: true }
  });

  if (!department) {
    return res.status(404).json({ error: "Department not found" });
  }

  return res.json(department);
}

const updateDepartment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;

  const validation = createDepartmentValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  const department = await prisma.department.findUnique({
    where: { id: String(departmentId) },
    include: { treatments: true, wards: true }
  });

  if (!department) {
    return res.status(404).json({ error: "Department not found" });
  }

  try {
    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        ...req.body,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const addDepartmentStaff = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { staffType, staffId } = req.body;

  const validation = departmentStaffValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        [staffType]: [...department[staffType as StaffType], staffId],
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const removeDepartmentStaff = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { staffType, staffId } = req.body as { staffType: StaffType; staffId: string };

  const validation = departmentStaffValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const updatedStaff = department[staffType].filter((id: string) => id !== staffId);

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        [staffType]: updatedStaff,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const addDepartmentImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { departmentId } = req.params;
    const { key, location } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (!key || !location) {
      return res
        .status(400)
        .json({ error: "An error occurred. Please try again later." });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        image: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${key}`,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const removeDepartmentImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { departmentId } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (department.image) {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: department.image.split("/")[-1],
      });

      await s3.send(command);
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        image: "",
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const deleteDepartment = async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  try {
    await prisma.department.delete({ where: { id: String(departmentId) } });

    return res.sendStatus(204);
  } catch (err) {
    return res.status(400).json({ error: "Delete failed" });
  }
}

const assignWard = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { wardId } = req.body;

  if (!wardId) return res.status(400).json({ errors: "Ward is required" });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const ward = await prisma.ward.findUnique({
      where: { id: wardId },
    });

    if (!ward) {
      return res.status(404).json({ error: "Ward not found" });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        wards: {
          connect: { id: wardId }
        },
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    await prisma.ward.update({
      where: { id: wardId },
      data: {
        departmentId: String(departmentId),
        updatedBy: userId,
        updatedAt: new Date()
      }
    })

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const removeWard = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { wardId } = req.body;

  if (!wardId) return res.status(400).json({ errors: "Ward is required" });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const ward = await prisma.ward.findUnique({
      where: { id: wardId },
    });

    if (!ward) {
      return res.status(404).json({ error: "Ward not found" });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        wards: {
          disconnect: { id: wardId }
        },
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    await prisma.ward.update({
      where: { id: wardId },
      data: {
        departmentId: "",
        updatedBy: userId,
        updatedAt: new Date()
      }
    })

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const addTreatment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { treatmentId } = req.body;

  if (!treatmentId) return res.status(400).json({ errors: "Treatment id is required" });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
    });

    if (!treatment) {
      return res.status(404).json({ error: "Treatment not found" });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        treatments: {
          connect: { id: treatmentId }
        },
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

const removeTreatment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { departmentId } = req.params;
  const { treatmentId } = req.body;

  if (!treatmentId) return res.status(400).json({ errors: "Treatment id is required" });

  try {
    const department = await prisma.department.findUnique({
      where: { id: String(departmentId) },
      include: { treatments: true, wards: true }
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
    });

    if (!treatment) {
      return res.status(404).json({ error: "Treatment not found" });
    }

    const updated = await prisma.department.update({
      where: { id: String(departmentId) },
      data: {
        treatments: {
          disconnect: { id: treatmentId }
        },
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
}

export default {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  addDepartmentStaff,
  removeDepartmentStaff,
  addDepartmentImage,
  removeDepartmentImage,
  deleteDepartment,
  assignWard,
  removeWard,
  addTreatment,
  removeTreatment,
};
