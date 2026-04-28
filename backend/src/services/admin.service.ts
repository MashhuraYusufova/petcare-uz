import prisma from "../prisma";
import { createVetProfileForUser } from "./vet-profile.service";
import { assertVetEmailAvailable, findVetByEmail } from "./vet-email.service";
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

export async function getAdvancedAnalytics() {
  const orders = await prisma.order.findMany({
    select: { item: true, price: true, date: true }
  });

  const productCounts = orders.reduce((acc, order) => {
    acc[order.item] = (acc[order.item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mostBoughtProduct = topProducts.length > 0 ? topProducts[0].name : "N/A";

  const revenueByDate = orders.reduce((acc, order) => {
    const dateStr = order.date.split('T')[0] || order.date;
    const priceNum = parseInt(order.price.replace(/,/g, ""), 10);
    const amount = isNaN(priceNum) ? 0 : priceNum;
    
    acc[dateStr] = (acc[dateStr] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueTimeline = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const highestRevenueDay = revenueTimeline.length > 0
    ? revenueTimeline.reduce((max, curr) => (curr.revenue > max.revenue ? curr : max), revenueTimeline[0])
    : { date: "N/A", revenue: 0 };

  return {
    topProducts,
    revenueTimeline,
    mostBoughtProduct,
    highestRevenueDay
  };
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
  const email = data.email ? await assertVetEmailAvailable(data.email) : undefined;

  return (prisma.vet as any).create({
    data: {
      ...data,
      email,
    },
  });
}

export async function updateVet(id: string, data: Partial<{
  name: string; spec: string; clinic: string; district: string; rating: number;
  reviews: number; exp: string; price: string; avail: boolean; slots: string[]; email: string | null;
}>) {
  const vet = await prisma.vet.findUnique({ where: { id } });
  if (!vet) throw new Error("Vet not found");
  const email =
    data.email === undefined
      ? undefined
      : data.email === null
        ? null
        : await assertVetEmailAvailable(data.email, id);

  return (prisma.vet as any).update({
    where: { id },
    data: {
      ...data,
      email,
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
    const existingVet = await findVetByEmail(normalizedEmail);

    if (!existingVet) {
      await createVetProfileForUser(updatedUser);
    }
  }

  return updatedUser;
}
