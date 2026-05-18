import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

const createNurse = async (req: Request, res: Response) => {
  try {
    const { staffId, nursingLicense } = req.body;

    if (!staffId || !nursingLicense) {
      return res.status(400).json({
        error: "Staff Id and Nursing License are required",
      });
    }

    const staffExists = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staffExists) {
      return res.status(404).json({
        error: "Staff not found",
      });
    }

    const existingNurse = await prisma.nurse.findUnique({
      where: { staffId },
    });

    if (existingNurse) {
      return res.status(400).json({
        error: "Nurse profile already exists for this staff",
      });
    }

    const existingLicense = await prisma.nurse.findUnique({
      where: { nursingLicense },
    });

    if (existingLicense) {
      return res.status(400).json({
        error: "Nursing license already exists",
      });
    }

    const nurse = await prisma.nurse.create({
      data: {
        staffId,
        nursingLicense,
      },
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    return res.status(201).json(nurse);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllNurses = async (_req: Request, res: Response) => {
  try {
    const nurses = await prisma.nurse.findMany({
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
        vitals: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json(nurses);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getNurseById = async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.params;

    const nurse = await prisma.nurse.findUnique({
      where: { id: String(nurseId) },
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
        vitals: true,
      },
    });

    if (!nurse) {
      return res.status(404).json({
        error: "Nurse not found",
      });
    }

    return res.status(200).json(nurse);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateNurse = async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.params;
    const { nursingLicense } = req.body;

    const existingNurse = await prisma.nurse.findUnique({
      where: { id: String(nurseId) },
    });

    if (!existingNurse) {
      return res.status(404).json({
        error: "Nurse not found",
      });
    }

    if (
      nursingLicense &&
      nursingLicense !== existingNurse.nursingLicense
    ) {
      const duplicateLicense = await prisma.nurse.findUnique({
        where: { nursingLicense },
      });

      if (duplicateLicense) {
        return res.status(400).json({
          error: "Nursing license already exists",
        });
      }
    }

    const updatedNurse = await prisma.nurse.update({
      where: { id: String(nurseId) },
      data: {
        nursingLicense,
      },
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    return res.status(200).json(updatedNurse);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteNurse = async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.params;

    const existingNurse = await prisma.nurse.findUnique({
      where: { id: String(nurseId) },
    });

    if (!existingNurse) {
      return res.status(404).json({
        error: "Nurse not found",
      });
    }

    await prisma.nurse.delete({
      where: { id: String(nurseId) },
    });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createNurse,
  getAllNurses,
  getNurseById,
  updateNurse,
  deleteNurse
}