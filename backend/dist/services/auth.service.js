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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const email_1 = require("../utils/email");
const JWT_SECRET = process.env.JWT_SECRET || "petcare_secret_key";
const SALT_ROUNDS = 10;
function signToken(userId, email, role) {
    return jsonwebtoken_1.default.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
}
function findUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedEmail = (0, email_1.normalizeEmail)(email);
        const exact = yield prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (exact)
            return exact;
        const users = yield prisma_1.default.user.findMany();
        const legacy = users.find(candidate => (0, email_1.emailsMatch)(candidate.email, normalizedEmail));
        if (!legacy)
            return null;
        if (legacy.email !== normalizedEmail) {
            try {
                return yield prisma_1.default.user.update({
                    where: { id: legacy.id },
                    data: { email: normalizedEmail },
                });
            }
            catch (_a) {
                return legacy;
            }
        }
        return legacy;
    });
}
function register(name, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedEmail = (0, email_1.normalizeEmail)(email);
        const existing = yield findUserByEmail(normalizedEmail);
        if (existing)
            throw new Error("Email already in use");
        const hashed = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = yield prisma_1.default.user.create({
            data: { name, email: normalizedEmail, password: hashed, role: "user" },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        return { user, token: signToken(user.id, user.email, user.role) };
    });
}
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield findUserByEmail(email);
        if (!user || !user.password)
            throw new Error("Invalid credentials");
        const match = yield bcryptjs_1.default.compare(password, user.password);
        if (!match)
            throw new Error("Invalid credentials");
        const _a = user, { password: _ } = _a, safeUser = __rest(_a, ["password"]);
        return { user: safeUser, token: signToken(user.id, user.email, user.role) };
    });
}
function getMe(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        if (!user)
            throw new Error("User not found");
        return user;
    });
}
