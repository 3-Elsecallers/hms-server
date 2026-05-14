import { Router } from "express";

import WardController from "../controllers/ward.controller";

const router = Router();

router.post("/", WardController.createWard);

router.get("/", WardController.getWards);

router.get("/:wardId", WardController.getWard);

router.patch("/:wardId", WardController.updateWard);

router.patch("/add-bed/:wardId", WardController.addBed);

router.patch("/remove-bed/:wardId", WardController.removeBed);

router.delete("/:wardId", WardController.deleteWard);

export default router;
