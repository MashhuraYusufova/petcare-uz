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
exports.getAllVets = getAllVets;
exports.getVetById = getVetById;
const prisma_1 = __importDefault(require("../prisma"));
function getAllVets(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.vet.findMany({
            where: Object.assign(Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.spec) && { spec: filters.spec })), ((filters === null || filters === void 0 ? void 0 : filters.district) && { district: filters.district })), ((filters === null || filters === void 0 ? void 0 : filters.avail) !== undefined && { avail: filters.avail })),
            orderBy: { rating: "desc" },
        });
    });
}
function getVetById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const vet = yield prisma_1.default.vet.findUnique({ where: { id } });
        if (!vet)
            throw new Error("Vet not found");
        return vet;
    });
}
