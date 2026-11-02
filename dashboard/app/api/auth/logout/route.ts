import { NextResponse } from "next/server";
import { COMPAT_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Déconnexion réussie.",
  });

  const isProd = process.env.NODE_ENV === "production";

  // Expire all session cookies
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(COMPAT_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
