import { Response } from "express";
import * as adminService from "../services/admin.service";
import { AuthRequest } from "../types";

export async function getOverview(_req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.getOverviewStats());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAnalytics(_req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.getAdvancedAnalytics());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUsers(_req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.getAllUsers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAppointments(_req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.getAllAppointments());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  const { name, price, oldPrice, rating, reviews, tag, img, brand, cat, stock } = req.body;
  if (!name || price == null || !img || !brand || !cat) {
    res.status(400).json({ error: "name, price, img, brand, cat are required" });
    return;
  }
  try {
    res.status(201).json(await adminService.createProduct({ name, price, oldPrice, rating: rating ?? 0, reviews: reviews ?? 0, tag, img, brand, cat, stock }));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.updateProduct(String(req.params.id), req.body));
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    await adminService.deleteProduct(String(req.params.id));
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function createVet(req: AuthRequest, res: Response) {
  const { name, spec, clinic, district, rating, reviews, exp, price, avail, slots, email } = req.body;
  if (!name || !spec || !clinic || !district || !exp || !price) {
    res.status(400).json({ error: "name, spec, clinic, district, exp, price are required" });
    return;
  }
  try {
    res.status(201).json(await adminService.createVet({ name, spec, clinic, district, rating: rating ?? 5.0, reviews: reviews ?? 0, exp, price, avail: avail ?? true, slots: slots ?? [], email }));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateVet(req: AuthRequest, res: Response) {
  try {
    res.json(await adminService.updateVet(String(req.params.id), req.body));
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function deleteVet(req: AuthRequest, res: Response) {
  try {
    await adminService.deleteVet(String(req.params.id));
    res.json({ message: "Vet deleted" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  const { role } = req.body;
  if (!role) {
    res.status(400).json({ error: "role is required" });
    return;
  }
  try {
    res.json(await adminService.updateUserRole(String(req.params.id), role));
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
