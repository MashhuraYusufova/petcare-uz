import prisma from "../prisma";

export async function getAllVets(filters?: { spec?: string; district?: string; avail?: boolean }) {
  return prisma.vet.findMany({
    where: {
      ...(filters?.spec && { spec: filters.spec }),
      ...(filters?.district && { district: filters.district }),
      ...(filters?.avail !== undefined && { avail: filters.avail }),
    },
    orderBy: { rating: "desc" },
  });
}

export async function getVetById(id: string) {
  const vet = await prisma.vet.findUnique({ where: { id } });
  if (!vet) throw new Error("Vet not found");
  return vet;
}
