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
exports.getOverviewStats = getOverviewStats;
exports.getAllUsers = getAllUsers;
exports.getAllAppointments = getAllAppointments;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.createVet = createVet;
exports.updateVet = updateVet;
exports.deleteVet = deleteVet;
exports.updateUserRole = updateUserRole;
const prisma_1 = __importDefault(require("../prisma"));
const vet_profile_service_1 = require("./vet-profile.service");
const email_1 = require("../utils/email");
function getOverviewStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const [usersCount, ordersCount, appointmentsCount, productsCount, vetsCount] = yield Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.order.count(),
            prisma_1.default.appointment.count(),
            prisma_1.default.product.count(),
            prisma_1.default.vet.count(),
        ]);
        const orders = yield prisma_1.default.order.findMany({ select: { price: true } });
        const totalRevenue = orders.reduce((sum, o) => {
            const num = parseInt(o.price.replace(/,/g, ""), 10);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
        return { usersCount, ordersCount, appointmentsCount, productsCount, vetsCount, totalRevenue };
    });
}
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });
    });
}
function getAllAppointments() {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.appointment.findMany({
            include: {
                vet: { select: { id: true, name: true, spec: true, clinic: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { date: "desc" },
        });
    });
}
function createProduct(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.product.create({ data });
    });
}
function updateProduct(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield prisma_1.default.product.findUnique({ where: { id } });
        if (!product)
            throw new Error("Product not found");
        return prisma_1.default.product.update({ where: { id }, data });
    });
}
function deleteProduct(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield prisma_1.default.product.findUnique({ where: { id } });
        if (!product)
            throw new Error("Product not found");
        return prisma_1.default.product.delete({ where: { id } });
    });
}
function createVet(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.vet.create({
            data: Object.assign(Object.assign({}, data), { email: data.email ? (0, email_1.normalizeEmail)(data.email) : undefined }),
        });
    });
}
function updateVet(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const vet = yield prisma_1.default.vet.findUnique({ where: { id } });
        if (!vet)
            throw new Error("Vet not found");
        return prisma_1.default.vet.update({
            where: { id },
            data: Object.assign(Object.assign({}, data), { email: data.email === undefined ? undefined : data.email === null ? null : (0, email_1.normalizeEmail)(data.email) }),
        });
    });
}
function deleteVet(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const vet = yield prisma_1.default.vet.findUnique({ where: { id } });
        if (!vet)
            throw new Error("Vet not found");
        return prisma_1.default.vet.delete({ where: { id } });
    });
}
function updateUserRole(id, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new Error("User not found");
        const updatedUser = yield prisma_1.default.user.update({ where: { id }, data: { role } });
        if (role === "vet") {
            const normalizedEmail = (0, email_1.normalizeEmail)(updatedUser.email);
            const existingVet = yield prisma_1.default.vet.findFirst({ where: { email: normalizedEmail } });
            if (!existingVet) {
                yield (0, vet_profile_service_1.createVetProfileForUser)(updatedUser);
            }
        }
        return updatedUser;
    });
}
