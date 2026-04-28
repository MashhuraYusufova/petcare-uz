import prisma from "../prisma";
import { findVetByEmail } from "./vet-email.service";

export async function getVetByEmail(email: string) {
  return findVetByEmail(email);
}

export async function getVetAppointments(vetId: string) {
  return prisma.appointment.findMany({
    where: { vetId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });
}

export async function getVetStats(vetId: string) {
  const [upcomingCount, pendingCount, completedCount] = await Promise.all([
    prisma.appointment.count({ where: { vetId, status: "Upcoming" } }),
    prisma.appointment.count({ where: { vetId, status: "Pending" } }),
    prisma.appointment.count({ where: { vetId, status: "Completed" } }),
  ]);
  const vet = await prisma.vet.findUnique({ where: { id: vetId }, select: { rating: true, reviews: true } });
  return { upcomingCount, pendingCount, completedCount, rating: vet?.rating ?? 0, reviews: vet?.reviews ?? 0 };
}

export async function confirmAppointment(vetId: string, appointmentId: string) {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.vetId !== vetId) throw new Error("Appointment not found");
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "Confirmed" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function declineAppointment(vetId: string, appointmentId: string) {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.vetId !== vetId) throw new Error("Appointment not found");
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "Declined" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateAvailability(vetId: string, slots: string[]) {
  return (prisma.vet as any).update({ where: { id: vetId }, data: { slots } });
}

export async function updateVetProfile(vetId: string, data: Partial<{
  name: string; spec: string; clinic: string; district: string; exp: string; price: string;
}>) {
  return (prisma.vet as any).update({ where: { id: vetId }, data });
}
