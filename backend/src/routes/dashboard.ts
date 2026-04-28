import { Router, Response } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware);
router.get("/summary", wrap(dashboardController.getSummary));
router.get("/orders", wrap(dashboardController.getOrders));
router.get("/appointments", wrap(dashboardController.getAppointments));
router.get("/pets", wrap(dashboardController.getPets));

export default router;
