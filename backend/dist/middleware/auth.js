"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "petcare_secret_key";
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!(header === null || header === void 0 ? void 0 : header.startsWith("Bearer "))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = header.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (_a) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
