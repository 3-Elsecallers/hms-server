import { Router } from "express";

import StaffController from "../controllers/staff.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";

const router = Router();

router.post("/assign-role", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.assignRole);

router.get("/unassigned-users", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.getUnassignedUsers);

export default router;
