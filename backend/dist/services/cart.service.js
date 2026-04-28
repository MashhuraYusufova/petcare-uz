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
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.removeFromCart = removeFromCart;
exports.clearCart = clearCart;
const prisma_1 = __importDefault(require("../prisma"));
const db = prisma_1.default;
function getCart(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db.cartItem.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: "desc" },
        });
    });
}
function addToCart(userId_1, productId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, productId, quantity = 1) {
        const product = yield prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new Error("Product not found");
        const existing = yield db.cartItem.findFirst({ where: { userId, productId } });
        if (existing) {
            return db.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
            });
        }
        return db.cartItem.create({
            data: { userId, productId, quantity },
            include: { product: true },
        });
    });
}
function updateCartItemQuantity(userId, productId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield db.cartItem.findFirst({ where: { userId, productId } });
        if (!item)
            throw new Error("Item not in cart");
        if (quantity <= 0) {
            return db.cartItem.delete({ where: { id: item.id } });
        }
        return db.cartItem.update({
            where: { id: item.id },
            data: { quantity },
        });
    });
}
function removeFromCart(userId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield db.cartItem.findFirst({ where: { userId, productId } });
        if (!item)
            throw new Error("Item not in cart");
        return db.cartItem.delete({ where: { id: item.id } });
    });
}
function clearCart(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db.cartItem.deleteMany({ where: { userId } });
    });
}
