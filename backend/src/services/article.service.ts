import prisma from "../prisma";

export async function getAllArticles(filters?: { cat?: string; search?: string }) {
  return prisma.article.findMany({
    where: {
      ...(filters?.cat && { cat: filters.cat }),
      ...(filters?.search && { title: { contains: filters.search, mode: "insensitive" } }),
    },
    orderBy: { date: "desc" },
  });
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new Error("Article not found");
  return article;
}
