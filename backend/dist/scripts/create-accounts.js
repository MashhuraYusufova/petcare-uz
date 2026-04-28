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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_1 = require("../utils/email");
const vet_email_service_1 = require("../services/vet-email.service");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const db = prisma;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const password = yield bcryptjs_1.default.hash("Sher2004", 10);
        const adminEmail = (0, email_1.normalizeEmail)("admin@gmail.com");
        const vetEmail = (0, email_1.normalizeEmail)("vet@gmail.com");
        const admin = yield db.user.upsert({
            where: { email: adminEmail },
            update: { password, role: "admin", name: "Admin" },
            create: { email: adminEmail, name: "Admin", password, role: "admin" },
        });
        console.log("✓ Admin created:", admin.email, "| role:", admin.role);
        const vet = yield db.user.upsert({
            where: { email: vetEmail },
            update: { password, role: "vet", name: "Dr. Sarah Johnson" },
            create: { email: vetEmail, name: "Dr. Sarah Johnson", password, role: "vet" },
        });
        console.log("✓ Vet user created:", vet.email, "| role:", vet.role);
        const vetProfileData = {
            name: "Dr. Sarah Johnson",
            spec: "General Veterinarian",
            clinic: "PetCare Central Clinic",
            district: "Yunusobod",
            rating: 4.8,
            reviews: 24,
            exp: "5 years",
            price: "50,000 UZS",
            avail: true,
            slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
            email: vetEmail,
        };
        const existing = yield db.vet.findFirst({ where: { email: vetEmail } });
        const email = yield (0, vet_email_service_1.assertVetEmailAvailable)(vetEmail, existing === null || existing === void 0 ? void 0 : existing.id);
        let vetProfile;
        if (existing) {
            vetProfile = yield db.vet.update({
                where: { id: existing.id },
                data: Object.assign(Object.assign({}, vetProfileData), { email }),
            });
        }
        else {
            vetProfile = yield db.vet.create({ data: Object.assign(Object.assign({}, vetProfileData), { email }) });
        }
        console.log("✓ Vet profile created:", vetProfile.name, "| email:", vetProfile.email);
    });
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
