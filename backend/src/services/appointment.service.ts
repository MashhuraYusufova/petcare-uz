import prisma from "../prisma";

export async function getAppointmentsByUser(userId: string) {
  return prisma.appointment.findMany({
    where: { userId },
    include: { vet: true },
    orderBy: { date: "desc" },
  });
}

export async function createAppointment(userId: string, vetId: string, date: string) {
  const vet = await prisma.vet.findUnique({ where: { id: vetId } });
  if (!vet) throw new Error("Vet not found");
  if (!vet.avail) throw new Error("Vet is not available");

  return prisma.appointment.create({
    data: { userId, vetId, date, status: "Upcoming" },
    include: { vet: true },
  });
}

export async function cancelAppointment(userId: string, appointmentId: string) {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.userId !== userId) throw new Error("Appointment not found");
  if (appt.status !== "Upcoming") throw new Error("Only upcoming appointments can be cancelled");

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "Cancelled" },
    include: { vet: true },
  });
}
