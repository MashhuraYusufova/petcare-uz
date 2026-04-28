import { Router, Response } from "express";
import * as orderController from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware);
router.get("/", wrap(orderController.getOrders));
router.post("/checkout", wrap(orderController.checkout));

export default router;
