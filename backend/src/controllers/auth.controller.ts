import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  try {
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
