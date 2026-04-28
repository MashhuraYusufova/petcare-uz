import prisma from "../prisma";
import { AnyVet } from "../types";
import { assertVetEmailAvailable } from "./vet-email.service";

const DEFAULT_VET_PROFILE = {
  spec: "General Veterinarian",
  clinic: "PetCare Clinic",
  district: "Tashkent",
  rating: 5,
  reviews: 0,
  exp: "1 year",
  price: "50,000 UZS",
  avail: true,
  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
};

export async function createVetProfileForUser(user: {
  id: string;
  name: string;
  email: string;
}): Promise<AnyVet> {
  const email = await assertVetEmailAvailable(user.email);

  return (prisma.vet as any).create({
    data: {
      name: user.name,
      email,
      ...DEFAULT_VET_PROFILE,
    },
  });
}
