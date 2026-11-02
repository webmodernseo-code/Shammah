import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  success: true,
  message: "Si cette adresse est enregistrée, les instructions ont été envoyées.",
};

export async function POST(req: Request) {
  const limit = rateLimit(`forgot-password:${getClientIp(req)}`, 3, 30 * 60 * 1000);
  if (!limit.success) return NextResponse.json(GENERIC_RESPONSE);

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254) return NextResponse.json(GENERIC_RESPONSE);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.adminEnabled || !["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(user.role)) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      }),
    ]);

    const requestOrigin = new URL(req.url).origin;
    const configuredUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;
    const configuredIsLocal = configuredUrl
      ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredUrl)
      : false;
    const dashboardUrl = requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1")
      ? (configuredUrl || requestOrigin)
      : (configuredUrl && !configuredIsLocal ? configuredUrl : "https://admin.shammah.eu");
    const resetUrl = `${dashboardUrl.replace(/\/$/, "")}/set-new-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
