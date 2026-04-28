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
exports.findVetByEmail = findVetByEmail;
exports.assertVetEmailAvailable = assertVetEmailAvailable;
const prisma_1 = __importDefault(require("../prisma"));
const email_1 = require("../utils/email");
function findVetByEmail(email) {
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
function assertVetEmailAvailable(email, excludeVetId) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedEmail = (0, email_1.normalizeEmail)(email);
        const existingVet = yield findVetByEmail(normalizedEmail);
        if (existingVet && existingVet.id !== excludeVetId) {
            throw new Error("Vet email is already linked to another profile");
        }
        return normalizedEmail;
    });
}
