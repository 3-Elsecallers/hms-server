import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

import { createWardValidation } from "../validation/wardValidation";

const createWard = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const validation = createWardValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const ward = await prisma.ward.create({
      data: {
        ...req.body,
        createdBy: userId,
        updatedBy: userId
      }
    });

    return res.status(201).json(ward);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create ward" });
  }
}

const getWards = async (req: Request, res: Response) => {
  const wards = await prisma.ward.findMany({ include: { beds: true } });

  return res.json(wards);
}

const getWard = async (req: Request, res: Response) => {
  const { wardId } = req.params;

  const ward = await prisma.ward.findUnique({
    where: { id: String(wardId) },
    include: { beds: true }
  });

  if (!ward) {
    return res.status(404).json({ error: "Ward not found" });
  }

  return res.json(ward);
}

const updateWard = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { wardId } = req.params;

  const validation = createWardValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  const ward = await prisma.ward.findUnique({
    where: { id: String(wardId) },
    include: { beds: true }
  });

  if (!ward) {
    return res.status(404).json({ error: "ward not found" });
  }

  try {
    const updated = await prisma.ward.update({
      where: { id: String(wardId) },
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

const addBed = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { wardId } = req.params;
  const { bedId } = req.body;

  if (!bedId) return res.status(400).json({ errors: "Bed id is required" });

  try {
    const ward = await prisma.ward.findUnique({
      where: { id: String(wardId) },
    });

    if (!ward) {
      return res.status(404).json({ error: "ward not found" });
    }

    const updated = await prisma.ward.update({
      where: { id: String(wardId) },
      data: {
        beds: {
          connect: { id: bedId }
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

const removeBed = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { wardId } = req.params;
  const { bedId } = req.body;

  if (!bedId) return res.status(400).json({ errors: "Bed id is required" });

  try {
    const ward = await prisma.ward.findUnique({
      where: { id: String(wardId) },
      include: { beds: true }
    });

    if (!ward) {
      return res.status(404).json({ error: "ward not found" });
    }

    const updated = await prisma.ward.update({
      where: { id: String(wardId) },
      data: {
        beds: {
          disconnect: { id: bedId }
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

const deleteWard = async (req: Request, res: Response) => {
  const { wardId } = req.params;

  try {
    await prisma.ward.delete({ where: { id: String(wardId) } });

    return res.sendStatus(204);
  } catch (err) {
    return res.status(400).json({ error: "Delete failed" });
  }
}

export default {
  createWard,
  getWards,
  getWard,
  updateWard,
  addBed,
  removeBed,
  deleteWard,
}