import { Router } from "express";
import * as vetController from "../controllers/vet.controller";

const router = Router();

router.get("/", vetController.getVets);
router.get("/:id", vetController.getVet);

export default router;
