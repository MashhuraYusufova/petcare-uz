import prisma from "../prisma";
import { createVetProfileForUser } from "./vet-profile.service";
import { normalizeEmail } from "../utils/email";

export async function getOverviewStats() {
  const [usersCount, ordersCount, appointmentsCount, productsCount, vetsCount] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.appointment.count(),
    prisma.product.count(),
    prisma.vet.count(),
  ]);

  const orders = await prisma.order.findMany({ select: { price: true } });
  const totalRevenue = orders.reduce((sum, o) => {
    const num = parseInt(o.price.replace(/,/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return { usersCount, ordersCount, appointmentsCount, productsCount, vetsCount, totalRevenue };
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    include: {
      vet: { select: { id: true, name: true, spec: true, clinic: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function createProduct(data: {
  name: string; price: number; oldPrice?: number; rating: number;
  reviews: number; tag?: string; img: string; brand: string; cat: string; stock?: number;
}) {
  return (prisma.product as any).create({ data });
}

export async function updateProduct(id: string, data: Partial<{
  name: string; price: number; oldPrice: number | null; rating: number;
  reviews: number; tag: string | null; img: string; brand: string; cat: string; stock: number;
}>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Product not found");
  return (prisma.product as any).update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Product not found");
  return prisma.product.delete({ where: { id } });
}

export async function createVet(data: {
  name: string; spec: string; clinic: string; district: string; rating: number;
  reviews: number; exp: string; price: string; avail: boolean; slots: string[]; email?: string;
}) {
  return (prisma.vet as any).create({
    data: {
      ...data,
      email: data.email ? normalizeEmail(data.email) : undefined,
    },
  });
}

export async function updateVet(id: string, data: Partial<{
  name: string; spec: string; clinic: string; district: string; rating: number;
  reviews: number; exp: string; price: string; avail: boolean; slots: string[]; email: string | null;
}>) {
  const vet = await prisma.vet.findUnique({ where: { id } });
  if (!vet) throw new Error("Vet not found");
  return (prisma.vet as any).update({
    where: { id },
    data: {
      ...data,
      email: data.email === undefined ? undefined : data.email === null ? null : normalizeEmail(data.email),
    },
  });
}

export async function deleteVet(id: string) {
  const vet = await prisma.vet.findUnique({ where: { id } });
  if (!vet) throw new Error("Vet not found");
  return prisma.vet.delete({ where: { id } });
}

export async function updateUserRole(id: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const updatedUser = await prisma.user.update({ where: { id }, data: { role } });

  if (role === "vet") {
    const normalizedEmail = normalizeEmail(updatedUser.email);
    const existingVet = await (prisma.vet as any).findFirst({ where: { email: normalizedEmail } });

    if (!existingVet) {
      await createVetProfileForUser(updatedUser);
    }
  }

  return updatedUser;
}
