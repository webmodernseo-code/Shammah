import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`reset-password:${getClientIp(req)}`, 5, 30 * 60 * 1000);
  if (!limit.success) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const passwordError = validatePassword(newPassword);
    if (token.length < 32 || passwordError) {
      return NextResponse.json(
        { error: token.length < 32 ? "Lien de réinitialisation invalide." : passwordError },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date() || !reset.user.adminEnabled) {
      return NextResponse.json({ error: "Ce lien est invalide, expiré ou déjà utilisé." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1) throw new Error("RESET_TOKEN_ALREADY_CONSUMED");
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await tx.auditLog.create({
        data: {
          actorId: reset.userId,
          actorEmail: reset.user.email,
          action: "ADMIN_PASSWORD_RESET",
          targetType: "User",
          targetId: reset.userId,
        },
      });
    });
    return NextResponse.json({ success: true, message: "Mot de passe mis à jour." });
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Impossible de réinitialiser le mot de passe." }, { status: 400 });
  }
}
