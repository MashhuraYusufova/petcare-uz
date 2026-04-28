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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const vets_1 = __importDefault(require("./routes/vets"));
const products_1 = __importDefault(require("./routes/products"));
const articles_1 = __importDefault(require("./routes/articles"));
const pets_1 = __importDefault(require("./routes/pets"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const admin_1 = __importDefault(require("./routes/admin"));
const vet_dashboard_1 = __importDefault(require("./routes/vet-dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/vets", vets_1.default);
app.use("/api/products", products_1.default);
app.use("/api/articles", articles_1.default);
app.use("/api/pets", pets_1.default);
app.use("/api/appointments", appointments_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/vet", vet_dashboard_1.default);
app.get("/api/health", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.user.findFirst();
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    }
    catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
