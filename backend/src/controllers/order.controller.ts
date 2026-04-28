import { Response } from "express";
import * as orderService from "../services/order.service";
import { AuthRequest } from "../types";

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await orderService.getOrdersByUser(req.user!.userId);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function checkout(req: AuthRequest, res: Response) {
  try {
    const orders = await orderService.createOrderFromCart(req.user!.userId);
    res.status(201).json(orders);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
