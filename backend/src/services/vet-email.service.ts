import prisma from "../prisma";
import { AnyVet } from "../types";
import { emailsMatch, normalizeEmail } from "../utils/email";

export async function findVetByEmail(email: string): Promise<AnyVet | null> {
  const normalizedEmail = normalizeEmail(email);
  const exact = await (prisma.vet as any).findFirst({ where: { email: normalizedEmail } });
  if (exact) return exact;

  const vets = await (prisma.vet as any).findMany({ where: { email: { not: null } } });
  return vets.find((vet: { email: string | null }) => emailsMatch(vet.email, normalizedEmail)) ?? null;
}

export async function assertVetEmailAvailable(email: string, excludeVetId?: string) {
  const normalizedEmail = normalizeEmail(email);
  const existingVet = await findVetByEmail(normalizedEmail);

  if (existingVet && existingVet.id !== excludeVetId) {
    throw new Error("Vet email is already linked to another profile");
  }

  return normalizedEmail;
}
