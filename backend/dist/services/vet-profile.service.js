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
exports.createVetProfileForUser = createVetProfileForUser;
const prisma_1 = __importDefault(require("../prisma"));
const email_1 = require("../utils/email");
const DEFAULT_VET_PROFILE = {
    spec: "General Veterinarian",
    clinic: "PetCare Clinic",
    district: "Tashkent",
    rating: 5,
    reviews: 0,
    exp: "1 year",
    price: "50,000 UZS",
    avail: true,
    slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
};
function createVetProfileForUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.vet.create({
            data: Object.assign({ name: user.name, email: (0, email_1.normalizeEmail)(user.email) }, DEFAULT_VET_PROFILE),
        });
    });
}
