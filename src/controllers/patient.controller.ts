import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EhrService } from '../services/ehr.service';

// DOCTOR/ADMIN: Register patient and initialize EHR
const registerPatient = async (req: Request, res: Response) => {
  const { firstName, lastName, birthDate, gender } = req.body;
  const user = req.user;

  try {
    const allowedRoles = ['DOCTOR', 'ADMIN']
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access Denied: You do not have permission to perform this action."
      });
    }

    // 1. Save to Local Admin DB
    const patient = await prisma.patient.create({
      data: { firstName, lastName, birthDate: new Date(birthDate), gender }
    });

    // 2. Provision EHR in openEHR CDR
    const ehrId = await EhrService.createEhr(patient.id);

    // 3. Link them
    await prisma.patient.update({
      where: { id: patient.id },
      data: { ehrId }
    });

    res.status(201).json({ message: "Patient registered and EHR initialized", ehrId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// DOCTOR/NURSE: Record Vitals
const recordVitals = async (req: Request, res: Response) => {
  const user = req.user;

  try {
    const allowedRoles = ['DOCTOR', 'NURSE']
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access Denied: You do not have permission to perform this action."
      });
    }

    const patientId = req.params.id as string;
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });

    if (!patient?.ehrId) return res.status(404).send("EHR not found");

    await EhrService.saveVitals(patient.ehrId, req.body);
    res.send("Clinical data recorded in CDR.");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  registerPatient,
  recordVitals
}