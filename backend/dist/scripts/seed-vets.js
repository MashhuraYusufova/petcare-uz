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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vet_email_service_1 = require("../services/vet-email.service");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting vets seed...");
        const vetNames = ["Azizbek Rustamov", "Dilshod Karimov", "Gulnora Aliyeva", "Nargiza Qodirova"];
        const clinics = ["PetCare Hayvonot Klinikasi", "Salomat Hayvon", "Toshkent Vet Markazi", "Mehribon Qollar"];
        const districts = ["Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Yashnobod"];
        const specs = ["Umumiy Amaliyot", "Xirurg", "Dermatolog", "Tish shifokori"];
        for (let i = 0; i < 4; i++) {
            const email = `vet${Date.now()}_${i}@petcare.uz`;
            yield (0, vet_email_service_1.assertVetEmailAvailable)(email);
            yield prisma.vet.create({
                data: {
                    name: vetNames[i],
                    spec: specs[i],
                    clinic: clinics[i],
                    district: districts[i],
                    rating: 4.5 + Math.random() * 0.5, // 4.5 to 5.0
                    reviews: Math.floor(Math.random() * 50) + 10,
                    exp: `${Math.floor(Math.random() * 10) + 2} yil`,
                    price: `${(Math.floor(Math.random() * 5) + 1) * 50},000 sum`,
                    avail: true,
                    slots: ["09:00", "11:00", "14:00", "16:00"],
                    email: email
                }
            });
        }
        console.log("Successfully created 4 Uzbek vets.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
