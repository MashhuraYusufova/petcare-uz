import { Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import * as orderService from "../services/order.service";
import * as appointmentService from "../services/appointment.service";
import * as petService from "../services/pet.service";
import * as wishlistService from "../services/wishlist.service";
import { AuthRequest } from "../types";

export async function getSummary(req: AuthRequest, res: Response) {
  try {
    const data = await dashboardService.getDashboardSummary(req.user!.userId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await orderService.getOrdersByUser(req.user!.userId);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    const appointments = await appointmentService.getAppointmentsByUser(req.user!.userId);
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPets(req: AuthRequest, res: Response) {
  try {
    const pets = await petService.getPetsByUser(req.user!.userId);
    res.json(pets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWishlist(req: AuthRequest, res: Response) {
  try {
    const items = await wishlistService.getWishlist(req.user!.userId);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
