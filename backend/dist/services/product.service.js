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
exports.getAllProducts = getAllProducts;
exports.getCategories = getCategories;
exports.getProductById = getProductById;
const prisma_1 = __importDefault(require("../prisma"));
function getAllProducts(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.product.findMany({
            where: Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.cat) && { cat: filters.cat })), ((filters === null || filters === void 0 ? void 0 : filters.search) && { name: { contains: filters.search, mode: "insensitive" } })),
            orderBy: { rating: "desc" },
        });
    });
}
function getCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.category.findMany({
            orderBy: { name: "asc" },
        });
    });
}
function getProductById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield prisma_1.default.product.findUnique({ where: { id } });
        if (!product)
            throw new Error("Product not found");
        return product;
    });
}
