import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword, SESSION_COOKIE, type SessionRole } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { queryNeon } from "@/lib/neon-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AdminUserRecord {
  id: string;
  email: string;
  name: string | null;
  role: SessionRole;
  adminEnabled: boolean;
  passwordHash: string | null;
}

async function findAdminUser(email: string): Promise<AdminUserRecord | null> {
  try {
    const prismaPromise = prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
    });
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Prisma timeout")), 3000)
    );
    const user = (await Promise.race([prismaPromise, timeoutPromise])) as AdminUserRecord | null;
    if (user) return user;
  } catch (prismaError) {
    console.warn("Dashboard Prisma lookup failed, using Neon HTTPS.", prismaError);
    try {
      const rows = await queryNeon<AdminUserRecord>(
        'SELECT id, email, name, role, "adminEnabled", "passwordHash" FROM public.users WHERE LOWER(email) = LOWER($1) LIMIT 1;',
        [email],
      );
      return rows[0] || null;
    } catch (httpError) {
      console.error("Dashboard Neon HTTPS lookup failed:", httpError);
    }
  }

  return null;
}

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const limit = rateLimit(`login:${clientIp}`, 10, 15 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quinze minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
    }

    const user = await findAdminUser(email);
    const authorized = Boolean(
      user?.adminEnabled && user.passwordHash &&
      ["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(user.role),
    );
    const validPassword = authorized
      ? await verifyPassword(password, user?.passwordHash ?? null)
      : false;

    if (!user || !validPassword) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
    }

    const token = createSessionToken(
      { userId: user.id, email: user.email, role: user.role },
      12 * 60 * 60,
    );
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const isProductionDomain = host.includes("divinexpress.fr");
    const cookieDomain = isProductionDomain ? ".divinexpress.fr" : undefined;

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: cookieDomain,
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Dashboard login failed", error);
    return NextResponse.json({ error: "Service de connexion indisponible." }, { status: 503 });
  }
}
