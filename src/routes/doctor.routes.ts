import { Router } from "express";

import DoctorController from "../controllers/doctor.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";

const router = Router();

router.post("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), DoctorController.createDoctor);

router.get("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), DoctorController.getAllDoctors);

router.get("/:doctorId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), DoctorController.getDoctorById);

router.patch("/:doctorId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), DoctorController.updateDoctor);

router.delete("/:doctorId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), DoctorController.deleteDoctor);

export default router;
