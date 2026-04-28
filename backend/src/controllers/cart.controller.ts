import { Response } from "express";
import * as cartService from "../services/cart.service";
import { AuthRequest } from "../types";

export async function getCart(req: AuthRequest, res: Response) {
  try {
    const items = await cartService.getCart(req.user!.userId);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addToCart(req: AuthRequest, res: Response) {
  const { productId, quantity } = req.body;
  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }
  try {
    const item = await cartService.addToCart(req.user!.userId, productId, quantity);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateQuantity(req: AuthRequest, res: Response) {
  const { quantity } = req.body;
  const { productId } = req.params;
  try {
    const item = await cartService.updateCartItemQuantity(req.user!.userId, productId, quantity);
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response) {
  const { productId } = req.params;
  try {
    await cartService.removeFromCart(req.user!.userId, productId);
    res.json({ message: "Removed from cart" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function clearCart(req: AuthRequest, res: Response) {
  try {
    await cartService.clearCart(req.user!.userId);
    res.json({ message: "Cart cleared" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
