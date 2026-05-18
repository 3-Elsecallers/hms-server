import { Router } from "express";

import StaffController from "../controllers/staff.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";

const router = Router();

router.get("/unassigned-users", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.getUnassignedUsers);

router.post("/assign-role", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.assignRole);

router.post("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.createStaff);

router.get("/", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.getAllStaff);

router.get("/:staffId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.getStaffById);

router.patch("/:staffId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.updateStaff);

router.delete("/:staffId", checkAuth, authorize("SUPER_ADMIN", "ADMIN"), StaffController.deleteStaff);

export default router;
