import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

import { createBedValidation } from "../validation/bedValidation";

const createBed = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const validation = createBedValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const bed = await prisma.bed.create({
      data: {
        ...req.body,
        createdBy: userId,
        updatedBy: userId
      }
    });

    return res.status(201).json(bed);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create bed" });
  }
}

const getBeds = async (req: Request, res: Response) => {
  const beds = await prisma.bed.findMany();

  return res.json(beds);
}

const getBed = async (req: Request, res: Response) => {
  const { bedId } = req.params;

  const bed = await prisma.bed.findUnique({
    where: { id: String(bedId) },
  });

  if (!bed) {
    return res.status(404).json({ error: "Bed not found" });
  }

  return res.json(bed);
}

const updateBed = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { bedId } = req.params;

  const validation = createBedValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  const bed = await prisma.bed.findUnique({
    where: { id: String(bedId) },
  });

  if (!bed) {
    return res.status(404).json({ error: "Bed not found" });
  }

  try {
    const updated = await prisma.bed.update({
      where: { id: String(bedId) },
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

const deleteBed = async (req: Request, res: Response) => {
  const { bedId } = req.params;

  try {
    await prisma.bed.delete({ where: { id: String(bedId) } });

    return res.sendStatus(204);
  } catch (err) {
    return res.status(400).json({ error: "Delete failed" });
  }
}

export default {
  createBed,
  getBeds,
  getBed,
  updateBed,
  deleteBed,
}