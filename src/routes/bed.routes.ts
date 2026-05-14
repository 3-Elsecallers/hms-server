import { Router } from "express";

import BedController from "../controllers/bed.controller";

const router = Router();

router.post("/", BedController.createBed);

router.get("/", BedController.getBeds);

router.get("/:bedId", BedController.getBed);

router.patch("/:bedId", BedController.updateBed);

router.delete("/:bedId", BedController.deleteBed);

export default router;
