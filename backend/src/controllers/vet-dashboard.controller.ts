import { Response } from "express";
import * as vetDashboardService from "../services/vet-dashboard.service";
import { AuthRequest } from "../types";

export async function getMe(req: AuthRequest, res: Response) {
  res.json(req.vet);
}

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    res.json(await vetDashboardService.getVetAppointments(req.vet!.id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    res.json(await vetDashboardService.getVetStats(req.vet!.id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function confirmAppointment(req: AuthRequest, res: Response) {
  try {
    res.json(await vetDashboardService.confirmAppointment(req.vet!.id, String(req.params.id)));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function declineAppointment(req: AuthRequest, res: Response) {
  try {
    res.json(await vetDashboardService.declineAppointment(req.vet!.id, String(req.params.id)));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateAvailability(req: AuthRequest, res: Response) {
  const { slots } = req.body;
  if (!Array.isArray(slots)) {
    res.status(400).json({ error: "slots must be an array" });
    return;
  }
  try {
    res.json(await vetDashboardService.updateAvailability(req.vet!.id, slots));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    res.json(await vetDashboardService.updateVetProfile(req.vet!.id, req.body));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
