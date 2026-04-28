import prisma from "../prisma";

export async function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}
