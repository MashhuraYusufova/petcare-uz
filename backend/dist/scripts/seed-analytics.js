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
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting analytics seed...");
        // Fetch all products to pick randomly
        const products = yield prisma.product.findMany();
        if (products.length === 0) {
            console.log("No products found! Please add some products first.");
            return;
        }
        const statuses = ["Completed", "Processing", "Shipped", "Delivered"];
        // Generate 25 users
        const createdUsers = [];
        const passwordHash = yield bcryptjs_1.default.hash('password123', 10);
        console.log("Generating 25 users...");
        for (let i = 1; i <= 25; i++) {
            const user = yield prisma.user.create({
                data: {
                    name: `Analytics User ${i}`,
                    email: `analytics.user${i}_${Date.now()}@example.com`,
                    password: passwordHash,
                    role: "user"
                }
            });
            createdUsers.push(user);
        }
        console.log("Generated 25 users successfully.");
        console.log("Generating 5 orders for each user...");
        const ordersToCreate = [];
        for (const user of createdUsers) {
            for (let j = 0; j < 5; j++) {
                // Pick a random product
                const product = products[Math.floor(Math.random() * products.length)];
                // Random date within the last 30 days
                const daysAgo = Math.floor(Math.random() * 30);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                ordersToCreate.push({
                    item: product.name,
                    date: date.toISOString(),
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    price: product.price.toString(),
                    img: product.img,
                    userId: user.id
                });
            }
        }
        // Use createMany to insert all orders at once
        const result = yield prisma.order.createMany({
            data: ordersToCreate
        });
        console.log(`Successfully created ${result.count} orders.`);
        console.log("Seed completed.");
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
