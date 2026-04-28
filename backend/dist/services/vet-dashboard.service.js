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
exports.getVetByEmail = getVetByEmail;
exports.getVetAppointments = getVetAppointments;
exports.getVetStats = getVetStats;
exports.confirmAppointment = confirmAppointment;
exports.declineAppointment = declineAppointment;
exports.updateAvailability = updateAvailability;
exports.updateVetProfile = updateVetProfile;
const prisma_1 = __importDefault(require("../prisma"));
const email_1 = require("../utils/email");
function getVetByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const normalizedEmail = (0, email_1.normalizeEmail)(email);
        const exact = yield prisma_1.default.vet.findFirst({ where: { email: normalizedEmail } });
        if (exact)
            return exact;
        const vets = yield prisma_1.default.vet.findMany({ where: { email: { not: null } } });
        return (_a = vets.find((vet) => (0, email_1.emailsMatch)(vet.email, normalizedEmail))) !== null && _a !== void 0 ? _a : null;
    });
}
function getVetAppointments(vetId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.appointment.findMany({
            where: { vetId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { date: "desc" },
        });
    });
}
function getVetStats(vetId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const [upcomingCount, pendingCount, completedCount] = yield Promise.all([
            prisma_1.default.appointment.count({ where: { vetId, status: "Upcoming" } }),
            prisma_1.default.appointment.count({ where: { vetId, status: "Pending" } }),
            prisma_1.default.appointment.count({ where: { vetId, status: "Completed" } }),
        ]);
        const vet = yield prisma_1.default.vet.findUnique({ where: { id: vetId }, select: { rating: true, reviews: true } });
        return { upcomingCount, pendingCount, completedCount, rating: (_a = vet === null || vet === void 0 ? void 0 : vet.rating) !== null && _a !== void 0 ? _a : 0, reviews: (_b = vet === null || vet === void 0 ? void 0 : vet.reviews) !== null && _b !== void 0 ? _b : 0 };
    });
}
function confirmAppointment(vetId, appointmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const appt = yield prisma_1.default.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt || appt.vetId !== vetId)
            throw new Error("Appointment not found");
        return prisma_1.default.appointment.update({
            where: { id: appointmentId },
            data: { status: "Confirmed" },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
    });
}
function declineAppointment(vetId, appointmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const appt = yield prisma_1.default.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt || appt.vetId !== vetId)
            throw new Error("Appointment not found");
        return prisma_1.default.appointment.update({
            where: { id: appointmentId },
            data: { status: "Declined" },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
    });
}
function updateAvailability(vetId, slots) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.vet.update({ where: { id: vetId }, data: { slots } });
    });
}
function updateVetProfile(vetId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.vet.update({ where: { id: vetId }, data });
    });
}
