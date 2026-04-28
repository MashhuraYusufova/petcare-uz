import prisma from "../prisma";
import * as cartService from "./cart.service";

export async function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function createOrderFromCart(userId: string) {
  const cartItems = await cartService.getCart(userId);
  if (cartItems.length === 0) throw new Error("Cart is empty");

  const orders = await Promise.all(
    cartItems.map(async (item: any) => {
      return prisma.order.create({
        data: {
          userId,
          item: `${item.product.name} (x${item.quantity})`,
          date: new Date().toLocaleDateString(),
          status: "Processing",
          price: (item.product.price * item.quantity).toString(),
          img: item.product.img,
        },
      });
    })
  );

  await cartService.clearCart(userId);
  return orders;
}
