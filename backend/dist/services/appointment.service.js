"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentsByUser = getAppointmentsByUser;
exports.createAppointment = createAppointment;
exports.cancelAppointment = cancelAppointment;
const prisma_1 = __importDefault(require("../prisma"));
function getAppointmentsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.appointment.findMany({
            where: { userId },
            include: { vet: true },
            orderBy: { date: "desc" },
        });
    });
}
function createAppointment(userId, vetId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const vet = yield prisma_1.default.vet.findUnique({ where: { id: vetId } });
        if (!vet)
            throw new Error("Vet not found");
        if (!vet.avail)
            throw new Error("Vet is not available");
        return prisma_1.default.appointment.create({
            data: { userId, vetId, date, status: "Upcoming" },
            include: { vet: true },
        });
    });
}
function cancelAppointment(userId, appointmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const appt = yield prisma_1.default.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt || appt.userId !== userId)
            throw new Error("Appointment not found");
        if (appt.status !== "Upcoming")
            throw new Error("Only upcoming appointments can be cancelled");
        return prisma_1.default.appointment.update({
            where: { id: appointmentId },
            data: { status: "Cancelled" },
            include: { vet: true },
        });
    });
}
