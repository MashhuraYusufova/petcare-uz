import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";
import { Response } from "express";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, (req, res: Response) => authController.me(req as AuthRequest, res));

export default router;
