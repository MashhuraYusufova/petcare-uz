import prisma from "../prisma";

const db = prisma as any;

export async function getCart(userId: string) {
  return db.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const existing = await db.cartItem.findFirst({ where: { userId, productId } });
  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return db.cartItem.create({
    data: { userId, productId, quantity },
    include: { product: true },
  });
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  const item = await db.cartItem.findFirst({ where: { userId, productId } });
  if (!item) throw new Error("Item not in cart");

  if (quantity <= 0) {
    return db.cartItem.delete({ where: { id: item.id } });
  }

  return db.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  const item = await db.cartItem.findFirst({ where: { userId, productId } });
  if (!item) throw new Error("Item not in cart");
  return db.cartItem.delete({ where: { id: item.id } });
}

export async function clearCart(userId: string) {
  return db.cartItem.deleteMany({ where: { userId } });
}
