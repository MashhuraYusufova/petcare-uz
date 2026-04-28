import { Response, NextFunction } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../types";
import { createVetProfileForUser } from "../services/vet-profile.service";
import { assertVetEmailAvailable, findVetByEmail } from "../services/vet-email.service";
import { normalizeEmail } from "../utils/email";

export async function vetOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "vet") {
    res.status(403).json({ error: "Vet access required" });
    return;
  }

  const normalizedEmail = normalizeEmail(req.user.email);
  let vet = await findVetByEmail(normalizedEmail);

  if (!vet) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true },
    });

    if (user?.name) {
      const sameNameVets = await prisma.vet.findMany({ where: { name: user.name } });
      const unlinkedMatch = sameNameVets.filter(candidate => !candidate.email);

      if (unlinkedMatch.length === 1) {
        const email = await assertVetEmailAvailable(normalizedEmail, unlinkedMatch[0].id);
        vet = await (prisma.vet as any).update({
          where: { id: unlinkedMatch[0].id },
          data: { email },
        });
      } else if (unlinkedMatch.length === 0) {
        vet = await createVetProfileForUser(user);
      }
    }
  }

  if (vet?.email && vet.email !== normalizedEmail) {
    try {
      const email = await assertVetEmailAvailable(normalizedEmail, vet.id);
      vet = await (prisma.vet as any).update({
        where: { id: vet.id },
        data: { email },
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
