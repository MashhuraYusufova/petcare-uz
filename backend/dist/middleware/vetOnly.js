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
const vet_email_service_1 = require("../services/vet-email.service");
const email_1 = require("../utils/email");
function vetOnly(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "vet") {
            res.status(403).json({ error: "Vet access required" });
            return;
        }
        const normalizedEmail = (0, email_1.normalizeEmail)(req.user.email);
        let vet = yield (0, vet_email_service_1.findVetByEmail)(normalizedEmail);
        if (!vet) {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: req.user.userId },
                select: { id: true, name: true, email: true },
            });
            if (user === null || user === void 0 ? void 0 : user.name) {
                const sameNameVets = yield prisma_1.default.vet.findMany({ where: { name: user.name } });
                const unlinkedMatch = sameNameVets.filter(candidate => !candidate.email);
                if (unlinkedMatch.length === 1) {
                    const email = yield (0, vet_email_service_1.assertVetEmailAvailable)(normalizedEmail, unlinkedMatch[0].id);
                    vet = yield prisma_1.default.vet.update({
                        where: { id: unlinkedMatch[0].id },
                        data: { email },
                    });
                }
                else if (unlinkedMatch.length === 0) {
                    vet = yield (0, vet_profile_service_1.createVetProfileForUser)(user);
                }
            }
        }
        if ((vet === null || vet === void 0 ? void 0 : vet.email) && vet.email !== normalizedEmail) {
            try {
                const email = yield (0, vet_email_service_1.assertVetEmailAvailable)(normalizedEmail, vet.id);
                vet = yield prisma_1.default.vet.update({
                    where: { id: vet.id },
                    data: { email },
                });
            }
            catch (_b) {
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
