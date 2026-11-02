import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_AUTH_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/set-new-password",
  "/reset-password",
  "/unauthorized",
  "/accept-invitation",
];

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/accept-invitation",
  "/api/health",
];

async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;
    if (!encodedPayload || !signature) return false;

    // 1. Decode base64url payload
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const decodedStr = atob(padded);
    const payload = JSON.parse(decodedStr);

    // 2. Validate expiration and role
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return false;
    }
    if (!["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(payload.role)) {
      return false;
    }

    // 3. Verify HMAC-SHA256 signature using standard Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(encodedPayload)
    );
    const sigArray = Array.from(new Uint8Array(sigBuffer));
    let binary = "";
    for (let i = 0; i < sigArray.length; i++) {
      binary += String.fromCharCode(sigArray[i]);
    }
    const computedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (computedSig.length !== signature.length) return false;
    let difference = 0;
    for (let i = 0; i < computedSig.length; i++) {
      difference |= computedSig.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return difference === 0;
  } catch {
    return false;
  }
}

function isPublicPath(pathname: string): boolean {
  return [...PUBLIC_AUTH_PATHS, ...PUBLIC_API_PATHS].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function unauthorizedResponse(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Authentification requise." }, { status: 401 });
  }

  const signInUrl = new URL("/signin", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signInUrl);
}

export async function proxy(req: NextRequest) {
  // The storefront owns the single canonical login experience. Keeping this
  // redirect here prevents the legacy dashboard sign-in screen from flashing.

  if (isPublicPath(req.nextUrl.pathname)) return NextResponse.next();

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Configuration d'authentification manquante." },
        { status: 503 },
      );
    }
    return unauthorizedResponse(req);
  }

  const token = req.cookies.get("shammah_admin_session_v2")?.value;
  if (!(await verifySessionToken(token || "", secret))) {
    return unauthorizedResponse(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static images (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
