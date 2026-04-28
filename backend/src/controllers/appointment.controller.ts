import { Response } from "express";
import * as appointmentService from "../services/appointment.service";
import { AuthRequest } from "../types";

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    const appointments = await appointmentService.getAppointmentsByUser(req.user!.userId);
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAppointment(req: AuthRequest, res: Response) {
  const { vetId, date } = req.body;
  if (!vetId || !date) {
    res.status(400).json({ error: "vetId and date are required" });
    return;
  }
  try {
    const appointment = await appointmentService.createAppointment(req.user!.userId, vetId, date);
    res.status(201).json(appointment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function cancelAppointment(req: AuthRequest, res: Response) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.user!.userId, String(req.params.id));
    res.json(appointment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
