import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { emailsMatch, normalizeEmail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "petcare_secret_key";
const SALT_ROUNDS = 10;

function signToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
}

async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const exact = await prisma.user.findUnique({ where: { email: normalizedEmail } }) as any;
  if (exact) return exact;

  const users = await prisma.user.findMany() as any[];
  const legacy = users.find(candidate => emailsMatch(candidate.email, normalizedEmail));
  if (!legacy) return null;

  if (legacy.email !== normalizedEmail) {
    try {
      return await prisma.user.update({
        where: { id: legacy.id },
        data: { email: normalizedEmail },
      }) as any;
    } catch {
      return legacy;
    }
  }

  return legacy;
}

export async function register(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed, role: "user" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return { user, token: signToken(user.id, user.email, user.role) };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.password) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const { password: _, ...safeUser } = user as { password: string; id: string; email: string; name: string; role: string; createdAt: Date; updatedAt: Date };
  return { user: safeUser, token: signToken(user.id, user.email, user.role) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}
