import { Router } from "express";

import DepartmentController from "../controllers/department.controller";

const router = Router();

router.post("/", DepartmentController.createDepartment);

router.get("/", DepartmentController.getDepartments);

router.get("/:departmentId", DepartmentController.getDepartment);

router.patch("/:departmentId", DepartmentController.updateDepartment);

router.patch("/add-staff/:departmentId", DepartmentController.addDepartmentStaff);

router.patch("/remove-staff/:departmentId", DepartmentController.removeDepartmentStaff);

router.patch("/add-image/:departmentId", DepartmentController.addDepartmentImage);

router.patch("/remove-image/:departmentId", DepartmentController.removeDepartmentImage);

router.delete("/:departmentId", DepartmentController.deleteDepartment);

router.patch("/add-treatment/:departmentId", DepartmentController.addTreatment);

router.patch("/remove-treatment/:departmentId", DepartmentController.removeTreatment);

router.patch("/add-ward/:departmentId", DepartmentController.assignWard);

router.patch("/remove-ward/:departmentId", DepartmentController.removeWard);

export default router;
