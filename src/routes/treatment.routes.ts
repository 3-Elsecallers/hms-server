import { Router } from "express";

import TreatmentController from "../controllers/treatment.controller";

const router = Router();

router.post("/", TreatmentController.createTreatment);

router.get("/", TreatmentController.getTreatments);

router.get("/:treatmentId", TreatmentController.getTreatment);

router.patch("/:treatmentId", TreatmentController.updateTreatment);

router.delete("/:treatmentId", TreatmentController.deleteTreatment);

export default router;
