import prisma from "../prisma";

export async function getPetsByUser(userId: string) {
  return prisma.pet.findMany({ where: { ownerId: userId } });
}

export async function createPet(userId: string, data: { name: string; species: string; breed: string; age: string; weight: string }) {
  return prisma.pet.create({ data: { ...data, ownerId: userId } });
}

export async function updatePet(userId: string, petId: string, data: Partial<{ name: string; species: string; breed: string; age: string; weight: string }>) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== userId) throw new Error("Pet not found");
  return prisma.pet.update({ where: { id: petId }, data });
}

export async function deletePet(userId: string, petId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== userId) throw new Error("Pet not found");
  return prisma.pet.delete({ where: { id: petId } });
}
