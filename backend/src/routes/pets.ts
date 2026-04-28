import { Router, Response } from "express";
import * as petController from "../controllers/pet.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware);
router.get("/", wrap(petController.getPets));
router.post("/", wrap(petController.createPet));
router.put("/:id", wrap(petController.updatePet));
router.delete("/:id", wrap(petController.deletePet));

export default router;
