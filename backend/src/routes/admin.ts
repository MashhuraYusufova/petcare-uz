import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminOnly } from "../middleware/adminOnly";
import * as adminController from "../controllers/admin.controller";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware, (req: any, res, next) => adminOnly(req as AuthRequest, res, next));

router.get("/overview", wrap(adminController.getOverview));
router.get("/analytics", wrap(adminController.getAnalytics));
router.get("/users", wrap(adminController.getUsers));
router.patch("/users/:id/role", wrap(adminController.updateUserRole));
router.get("/appointments", wrap(adminController.getAppointments));
router.post("/products", wrap(adminController.createProduct));
router.put("/products/:id", wrap(adminController.updateProduct));
router.delete("/products/:id", wrap(adminController.deleteProduct));
router.post("/vets", wrap(adminController.createVet));
router.put("/vets/:id", wrap(adminController.updateVet));
router.delete("/vets/:id", wrap(adminController.deleteVet));

export default router;
