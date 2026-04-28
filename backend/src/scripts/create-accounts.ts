import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { normalizeEmail } from "../utils/email";
import { assertVetEmailAvailable } from "../services/vet-email.service";

dotenv.config();

const prisma = new PrismaClient();
const db = prisma as any;

async function main() {
  const password = await bcrypt.hash("Sher2004", 10);
  const adminEmail = normalizeEmail("admin@gmail.com");
  const vetEmail = normalizeEmail("vet@gmail.com");

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { password, role: "admin", name: "Admin" },
    create: { email: adminEmail, name: "Admin", password, role: "admin" },
  });
  console.log("✓ Admin created:", admin.email, "| role:", admin.role);

  const vet = await db.user.upsert({
    where: { email: vetEmail },
    update: { password, role: "vet", name: "Dr. Sarah Johnson" },
    create: { email: vetEmail, name: "Dr. Sarah Johnson", password, role: "vet" },
  });
  console.log("✓ Vet user created:", vet.email, "| role:", vet.role);

  const vetProfileData = {
    name: "Dr. Sarah Johnson",
    spec: "General Veterinarian",
    clinic: "PetCare Central Clinic",
    district: "Yunusobod",
    rating: 4.8,
    reviews: 24,
    exp: "5 years",
    price: "50,000 UZS",
    avail: true,
    slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    email: vetEmail,
  };

  const existing = await db.vet.findFirst({ where: { email: vetEmail } });
  const email = await assertVetEmailAvailable(vetEmail, existing?.id);

  let vetProfile: any;
  if (existing) {
    vetProfile = await db.vet.update({
      where: { id: existing.id },
      data: { ...vetProfileData, email },
    });
  } else {
    vetProfile = await db.vet.create({ data: { ...vetProfileData, email } });
  }
  console.log("✓ Vet profile created:", vetProfile.name, "| email:", vetProfile.email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
