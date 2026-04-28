import { Router, Response } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: any, res: Response) => fn(req as AuthRequest, res);

router.use(authMiddleware);
router.get("/", wrap(wishlistController.getWishlist));
router.post("/", wrap(wishlistController.addToWishlist));
router.delete("/:productId", wrap(wishlistController.removeFromWishlist));

export default router;
