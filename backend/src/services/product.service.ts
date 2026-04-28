import prisma from "../prisma";

export async function getAllProducts(filters?: { cat?: string; search?: string }) {
  return prisma.product.findMany({
    where: {
      ...(filters?.cat && { cat: filters.cat }),
      ...(filters?.search && { name: { contains: filters.search, mode: "insensitive" } }),
    },
    orderBy: { rating: "desc" },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Product not found");
  return product;
}
