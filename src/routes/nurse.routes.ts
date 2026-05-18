import { Router } from "express";

import NurseController from "../controllers/nurse.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";

const router = Router();

router.post("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), NurseController.createNurse);

router.get("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), NurseController.getAllNurses);

router.get("/:nurseId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), NurseController.getNurseById);

router.patch("/:nurseId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), NurseController.updateNurse);

router.delete("/:nurseId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), NurseController.deleteNurse);

export default router;
