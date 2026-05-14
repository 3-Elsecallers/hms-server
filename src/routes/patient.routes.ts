import { Router } from 'express';

import { checkAuth } from '../middlewares/auth.middleware';
import PatientController from "../controllers/patient.controller";

const router = Router();

// DOCTOR/NURSE: Register patient and initialize EHR
router.post('/register', checkAuth, PatientController.registerPatient);

// DOCTOR only: Record Vitals
router.post('/:id/vitals', checkAuth, PatientController.recordVitals);

export default router;