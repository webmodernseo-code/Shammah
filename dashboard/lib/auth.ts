import { createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { queryNeon } from "./neon-http";

const scrypt = promisify(nodeScrypt);

// Version the cookie whenever a security fix must invalidate every existing session.
export const SESSION_COOKIE = "shammah_admin_session_v2";
export const COMPAT_COOKIE = "shammah_session";

export type SessionRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | "MASTER_ADMIN";

export interface SessionPayload {
  userId: string;
  email: string;
  role: SessionRole;
  exp: number;
}

export function getSessionSecret(): string {
  // Never ship a fallback secret. A predictable fallback would allow anyone
  // who can read the source to forge an administrator session.
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

export function sign(value: string, secret = getSessionSecret()): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
  maxAgeSeconds = 7 * 24 * 60 * 60
): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const encoded = Buffer.from(
    JSON.stringify({ ...payload, exp })
  ).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSession(req: NextRequest): SessionPayload | null {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expected = Buffer.from(sign(encoded));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString()
    ) as SessionPayload;

    if (
      !payload.userId ||
      !payload.email ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      !["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(payload.role)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function hasTrustedOrigin(req: NextRequest): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

export async function isAdmin(req: NextRequest): Promise<boolean> {
  if (!hasTrustedOrigin(req)) return false;

  const session = readSession(req);
  if (!session || !["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(session.role)) {
    return false;
  }

  try {
    const prismaPromise = prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, adminEnabled: true },
    });
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Prisma timeout")), 2500)
    );
    const user = (await Promise.race([prismaPromise, timeoutPromise])) as {
      role: string;
      adminEnabled: boolean;
    } | null;

    if (user) {
      return Boolean(
        user.adminEnabled &&
          ["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(user.role as SessionRole) &&
          user.role === session.role,
      );
    }
  } catch {
    try {
      const rows = await queryNeon<{ role: string; adminEnabled: boolean }>(
        'SELECT role, "adminEnabled" FROM public.users WHERE id = $1 LIMIT 1;',
        [session.userId],
      );
      const user = rows[0];
      return Boolean(
        user?.adminEnabled &&
        ["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(user.role) &&
        user.role === session.role
      );
    } catch {
      return false;
    }
  }

  return false;
}

export async function isSuperAdmin(req: NextRequest): Promise<boolean> {
  if (!(await isAdmin(req))) return false;
  const session = readSession(req);
  return Boolean(session && ["SUPER_ADMIN", "MASTER_ADMIN"].includes(session.role));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    return "Le mot de passe doit contenir entre 12 et 128 caractères.";
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Ajoutez au moins une minuscule, une majuscule, un chiffre et un caractère spécial.";
  }
  return null;
}

export async function verifyPassword(
  password: string,
  stored: string | null
): Promise<boolean> {
  if (!stored) return false;
  try {
    const [algorithm, salt, hash] = stored.split(":");
    if (algorithm !== "scrypt" || !salt || !hash) return false;
    const expected = Buffer.from(hash, "hex");
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
