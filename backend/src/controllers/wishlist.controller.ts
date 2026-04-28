import { Response } from "express";
import * as wishlistService from "../services/wishlist.service";
import { AuthRequest } from "../types";

export async function getWishlist(req: AuthRequest, res: Response) {
  try {
    const items = await wishlistService.getWishlist(req.user!.userId);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addToWishlist(req: AuthRequest, res: Response) {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }
  try {
    const item = await wishlistService.addToWishlist(req.user!.userId, productId);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function removeFromWishlist(req: AuthRequest, res: Response) {
  try {
    await wishlistService.removeFromWishlist(req.user!.userId, String(req.params.productId));
    res.json({ message: "Removed from wishlist" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
