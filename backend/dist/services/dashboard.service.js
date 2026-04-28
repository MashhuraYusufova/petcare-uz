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
exports.getDashboardSummary = getDashboardSummary;
const prisma_1 = __importDefault(require("../prisma"));
const db = prisma_1.default;
function getDashboardSummary(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [user, orders, appointments, pets] = yield Promise.all([
            prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true, role: true, createdAt: true },
            }),
            prisma_1.default.order.findMany({ where: { userId }, orderBy: { date: "desc" } }),
            prisma_1.default.appointment.findMany({ where: { userId }, include: { vet: true }, orderBy: { date: "desc" } }),
            prisma_1.default.pet.findMany({ where: { ownerId: userId } }),
        ]);
        if (!user)
            throw new Error("User not found");
        let wishlistCount = 0;
        try {
            const wishlist = yield db.wishlistItem.findMany({ where: { userId } });
            wishlistCount = wishlist.length;
        }
        catch ( /* wishlist model may not be migrated yet */_a) { /* wishlist model may not be migrated yet */ }
        return {
            user,
            stats: {
                ordersCount: orders.length,
                appointmentsCount: appointments.length,
                petsCount: pets.length,
                wishlistCount,
            },
            recentOrders: orders.slice(0, 3),
            upcomingAppointments: appointments.filter((a) => a.status === "Upcoming"),
            pets,
        };
    });
}
