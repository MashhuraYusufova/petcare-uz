import { Request, Response } from "express";
import * as vetService from "../services/vet.service";

export async function getVets(req: Request, res: Response) {
  const { spec, district, avail, search } = req.query;
  try {
    const vets = await vetService.getAllVets({
      spec: typeof spec === "string" ? spec : undefined,
      district: typeof district === "string" ? district : undefined,
      avail: avail === "true" ? true : avail === "false" ? false : undefined,
      search: typeof search === "string" ? search : undefined,
    });
    res.json(vets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVet(req: Request, res: Response) {
  try {
    const vet = await vetService.getVetById(String(req.params.id));
    res.json(vet);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
