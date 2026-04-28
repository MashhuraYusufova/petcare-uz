import prisma from "../prisma";

const db = prisma as any;

export async function getWishlist(userId: string) {
  const items = await db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  return products;
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const existing = await db.wishlistItem.findFirst({ where: { userId, productId } });
  if (existing) return existing;

  return db.wishlistItem.create({ data: { userId, productId } });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const item = await db.wishlistItem.findFirst({ where: { userId, productId } });
  if (!item) throw new Error("Item not in wishlist");
  return db.wishlistItem.delete({ where: { id: item.id } });
}
