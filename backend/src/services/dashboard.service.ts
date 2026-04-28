import prisma from "../prisma";

const db = prisma as any;

export async function getDashboardSummary(userId: string) {
  const [user, orders, appointments, pets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.appointment.findMany({ where: { userId }, include: { vet: true }, orderBy: { date: "desc" } }),
    prisma.pet.findMany({ where: { ownerId: userId } }),
  ]);

  if (!user) throw new Error("User not found");

  let wishlistCount = 0;
  try {
    const wishlist = await db.wishlistItem.findMany({ where: { userId } });
    wishlistCount = wishlist.length;
  } catch { /* wishlist model may not be migrated yet */ }

  return {
    user,
    stats: {
      ordersCount: orders.length,
      appointmentsCount: appointments.length,
      petsCount: pets.length,
      wishlistCount,
    },
    recentOrders: orders.slice(0, 3),
    upcomingAppointments: (appointments as any[]).filter((a: any) => a.status === "Upcoming"),
    pets,
  };
}
