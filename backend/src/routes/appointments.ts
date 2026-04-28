import { Router, Response } from "express";
import * as appointmentController from "../controllers/appointment.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware);
router.get("/", wrap(appointmentController.getAppointments));
router.post("/", wrap(appointmentController.createAppointment));
router.patch("/:id/cancel", wrap(appointmentController.cancelAppointment));

export default router;
