import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { vetOnly } from "../middleware/vetOnly";
import * as vetDashboardController from "../controllers/vet-dashboard.controller";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware, (req: any, res, next) => vetOnly(req as AuthRequest, res, next));

router.get("/me", wrap(vetDashboardController.getMe));
router.get("/stats", wrap(vetDashboardController.getStats));
router.get("/appointments", wrap(vetDashboardController.getAppointments));
router.patch("/appointments/:id/confirm", wrap(vetDashboardController.confirmAppointment));
router.patch("/appointments/:id/decline", wrap(vetDashboardController.declineAppointment));
router.put("/availability", wrap(vetDashboardController.updateAvailability));
router.put("/profile", wrap(vetDashboardController.updateProfile));

export default router;
