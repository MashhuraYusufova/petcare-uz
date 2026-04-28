import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.patch("/:productId", cartController.updateQuantity);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
