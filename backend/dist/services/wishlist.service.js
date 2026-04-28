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
exports.getWishlist = getWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
const prisma_1 = __importDefault(require("../prisma"));
const db = prisma_1.default;
function getWishlist(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield db.wishlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        const productIds = items.map((i) => i.productId);
        const products = yield prisma_1.default.product.findMany({ where: { id: { in: productIds } } });
        return products;
    });
}
function addToWishlist(userId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new Error("Product not found");
        const existing = yield db.wishlistItem.findFirst({ where: { userId, productId } });
        if (existing)
            return existing;
        return db.wishlistItem.create({ data: { userId, productId } });
    });
}
function removeFromWishlist(userId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield db.wishlistItem.findFirst({ where: { userId, productId } });
        if (!item)
            throw new Error("Item not in wishlist");
        return db.wishlistItem.delete({ where: { id: item.id } });
    });
}
