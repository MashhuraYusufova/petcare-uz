import { Response } from "express";
import * as petService from "../services/pet.service";
import { AuthRequest } from "../types";

export async function getPets(req: AuthRequest, res: Response) {
  try {
    const pets = await petService.getPetsByUser(req.user!.userId);
    res.json(pets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPet(req: AuthRequest, res: Response) {
  const { name, species, breed, age, weight } = req.body;
  if (!name || !species || !breed || !age || !weight) {
    res.status(400).json({ error: "name, species, breed, age and weight are required" });
    return;
  }
  try {
    const pet = await petService.createPet(req.user!.userId, { name, species, breed, age, weight });
    res.status(201).json(pet);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updatePet(req: AuthRequest, res: Response) {
  try {
    const pet = await petService.updatePet(req.user!.userId, String(req.params.id), req.body);
    res.json(pet);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function deletePet(req: AuthRequest, res: Response) {
  try {
    await petService.deletePet(req.user!.userId, String(req.params.id));
    res.json({ message: "Pet deleted" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
