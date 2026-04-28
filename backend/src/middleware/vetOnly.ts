import { Response, NextFunction } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../types";
import { createVetProfileForUser } from "../services/vet-profile.service";
import { emailsMatch, normalizeEmail } from "../utils/email";

export async function vetOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "vet") {
    res.status(403).json({ error: "Vet access required" });
    return;
  }

  const normalizedEmail = normalizeEmail(req.user.email);
  let vet = await (prisma.vet as any).findFirst({ where: { email: normalizedEmail } });

  if (!vet) {
    const vets = await (prisma.vet as any).findMany({ where: { email: { not: null } } });
    vet = vets.find((candidate: { email: string | null }) => emailsMatch(candidate.email, normalizedEmail)) ?? null;
  }

  if (!vet) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true },
    });

    if (user?.name) {
      const sameNameVets = await prisma.vet.findMany({ where: { name: user.name } });
      const unlinkedMatch = sameNameVets.filter(candidate => !candidate.email);

      if (unlinkedMatch.length === 1) {
        vet = await (prisma.vet as any).update({
          where: { id: unlinkedMatch[0].id },
          data: { email: normalizedEmail },
        });
      } else if (unlinkedMatch.length === 0) {
        vet = await createVetProfileForUser(user);
      }
    }
  }

  if (vet?.email && vet.email !== normalizedEmail) {
    try {
      vet = await (prisma.vet as any).update({
        where: { id: vet.id },
        data: { email: normalizedEmail },
      });
    } catch {
      // Keep the matched record even if normalization cannot be persisted.
    }
  }

  if (!vet) {
    res.status(404).json({ error: "Vet profile not linked to this account" });
    return;
  }
  req.vet = vet;
  next();
}
