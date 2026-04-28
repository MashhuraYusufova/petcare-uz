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
exports.getAllArticles = getAllArticles;
exports.getArticleById = getArticleById;
const prisma_1 = __importDefault(require("../prisma"));
function getAllArticles(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.article.findMany({
            where: Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.cat) && { cat: filters.cat })), ((filters === null || filters === void 0 ? void 0 : filters.search) && { title: { contains: filters.search, mode: "insensitive" } })),
            orderBy: { date: "desc" },
        });
    });
}
function getArticleById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const article = yield prisma_1.default.article.findUnique({ where: { id } });
        if (!article)
            throw new Error("Article not found");
        return article;
    });
}
