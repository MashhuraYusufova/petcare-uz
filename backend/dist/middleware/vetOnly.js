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
exports.vetOnly = vetOnly;
const prisma_1 = __importDefault(require("../prisma"));
const vet_profile_service_1 = require("../services/vet-profile.service");
const email_1 = require("../utils/email");
function vetOnly(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "vet") {
            res.status(403).json({ error: "Vet access required" });
            return;
        }
        const normalizedEmail = (0, email_1.normalizeEmail)(req.user.email);
        let vet = yield prisma_1.default.vet.findFirst({ where: { email: normalizedEmail } });
        if (!vet) {
            const vets = yield prisma_1.default.vet.findMany({ where: { email: { not: null } } });
            vet = (_b = vets.find((candidate) => (0, email_1.emailsMatch)(candidate.email, normalizedEmail))) !== null && _b !== void 0 ? _b : null;
        }
        if (!vet) {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: req.user.userId },
                select: { id: true, name: true, email: true },
            });
            if (user === null || user === void 0 ? void 0 : user.name) {
                const sameNameVets = yield prisma_1.default.vet.findMany({ where: { name: user.name } });
                const unlinkedMatch = sameNameVets.filter(candidate => !candidate.email);
                if (unlinkedMatch.length === 1) {
                    vet = yield prisma_1.default.vet.update({
                        where: { id: unlinkedMatch[0].id },
                        data: { email: normalizedEmail },
                    });
                }
                else if (unlinkedMatch.length === 0) {
                    vet = yield (0, vet_profile_service_1.createVetProfileForUser)(user);
                }
            }
        }
        if ((vet === null || vet === void 0 ? void 0 : vet.email) && vet.email !== normalizedEmail) {
            try {
                vet = yield prisma_1.default.vet.update({
                    where: { id: vet.id },
                    data: { email: normalizedEmail },
                });
            }
            catch (_c) {
                // Keep the matched record even if normalization cannot be persisted.
            }
        }
        if (!vet) {
            res.status(404).json({ error: "Vet profile not linked to this account" });
            return;
        }
        req.vet = vet;
        next();
    });
}
