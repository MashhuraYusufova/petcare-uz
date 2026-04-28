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
exports.getPetsByUser = getPetsByUser;
exports.createPet = createPet;
exports.updatePet = updatePet;
exports.deletePet = deletePet;
const prisma_1 = __importDefault(require("../prisma"));
function getPetsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.pet.findMany({ where: { ownerId: userId } });
    });
}
function createPet(userId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.pet.create({ data: Object.assign(Object.assign({}, data), { ownerId: userId }) });
    });
}
function updatePet(userId, petId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const pet = yield prisma_1.default.pet.findUnique({ where: { id: petId } });
        if (!pet || pet.ownerId !== userId)
            throw new Error("Pet not found");
        return prisma_1.default.pet.update({ where: { id: petId }, data });
    });
}
function deletePet(userId, petId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pet = yield prisma_1.default.pet.findUnique({ where: { id: petId } });
        if (!pet || pet.ownerId !== userId)
            throw new Error("Pet not found");
        return prisma_1.default.pet.delete({ where: { id: petId } });
    });
}
