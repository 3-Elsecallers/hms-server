import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

import { createTreatmentValidation } from "../validation/treatmentValidation";

const createTreatment = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const validation = createTreatmentValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  try {
    const treatment = await prisma.treatment.create({
      data: {
        ...req.body,
        createdBy: userId,
        updatedBy: userId
      }
    });

    return res.status(201).json(treatment);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create treatment" });
  }
}

const getTreatments = async (req: Request, res: Response) => {
  const treatments = await prisma.treatment.findMany();

  return res.json(treatments);
}

const getTreatment = async (req: Request, res: Response) => {
  const { treatmentId } = req.params;

  const treatment = await prisma.treatment.findUnique({
    where: { id: String(treatmentId) },
  });

  if (!treatment) {
    return res.status(404).json({ error: "Treatment not found" });
  }

  return res.json(treatment);
}

const updateTreatment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { treatmentId } = req.params;

  const validation = createTreatmentValidation(req.body);
  if (!validation.valid) return res.status(400).json({ errors: validation.errors });

  const treatment = await prisma.treatment.findUnique({
    where: { id: String(treatmentId) },
  });

  if (!treatment) {
    return res.status(404).json({ error: "Treatment not found" });
  }

  try {
    const updated = await prisma.treatment.update({
      where: { id: String(treatmentId) },
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

const deleteTreatment = async (req: Request, res: Response) => {
  const { treatmentId } = req.params;

  try {
    await prisma.treatment.delete({ where: { id: String(treatmentId) } });

    return res.sendStatus(204);
  } catch (err) {
    return res.status(400).json({ error: "Delete failed" });
  }
}

export default {
  createTreatment,
  getTreatments,
  getTreatment,
  updateTreatment,
  deleteTreatment,
}