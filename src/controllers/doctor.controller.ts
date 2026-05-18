import { Request, Response } from "express";
import { prisma } from '../lib/prisma';

import { createDoctorValidation } from "../validation/doctorValidation";

const createDoctor = async (req: Request, res: Response) => {
  try {
    const {
      staffId,
      specialization,
      licenseNumber,
      yearsOfExperience,
      consultationFee,
    } = req.body;

    const validation = createDoctorValidation(req.body);
    if (!validation.valid) return res.status(400).json({ errors: validation.errors });

    const staffExists = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staffExists) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { staffId },
    });

    if (existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const existingLicense = await prisma.doctor.findUnique({
      where: { licenseNumber },
    });

    if (existingLicense) {
      return res.status(400).json({ error: "License number already exists" });
    }

    const doctor = await prisma.doctor.create({
      data: {
        staffId,
        specialization,
        licenseNumber,
        yearsOfExperience,
        consultationFee,
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

    return res.status(201).json(doctor);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
        schedules: true,
        appointments: true,
      },
      orderBy: {
        specialization: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
      include: {
        staff: {
          include: {
            user: true,
            department: true,
          },
        },
        schedules: true,
        appointments: true,
        encounters: true,
        prescriptions: true,
        labTests: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const {
      specialization,
      licenseNumber,
      yearsOfExperience,
      consultationFee,
    } = req.body;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
    });

    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (
      licenseNumber &&
      licenseNumber !== existingDoctor.licenseNumber
    ) {
      const duplicateLicense = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (duplicateLicense) {
      return res.status(400).json({ error: "License number already exists" });
      }
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: String(doctorId) },
      data: {
        specialization,
        licenseNumber,
        yearsOfExperience,
        consultationFee,
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

    return res.status(200).json(updatedDoctor);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
    });

    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    await prisma.doctor.delete({
      where: { id: String(doctorId) },
    });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
}
