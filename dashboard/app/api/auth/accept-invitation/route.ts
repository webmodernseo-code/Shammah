import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword, validatePassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`accept-invitation:${getClientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.success) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
  const { token, password } = await req.json();
  const passwordError = validatePassword(password);
  if (typeof token !== "string" || token.length < 32 || passwordError) {
    return NextResponse.json({ error: typeof token !== "string" || token.length < 32 ? "Invitation invalide." : passwordError }, { status: 400 });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invitation = await prisma.adminInvitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt <= new Date()) {
    return NextResponse.json({ error: "Cette invitation est invalide, expirée ou déjà utilisée." }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: invitation.email },
      update: { name: invitation.name, passwordHash, role: "ADMIN", adminEnabled: true },
      create: { email: invitation.email, name: invitation.name, passwordHash, role: "ADMIN", adminEnabled: true },
    });
    await tx.adminInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
    await tx.auditLog.create({
      data: { actorId: user.id, actorEmail: user.email, action: "ADMIN_INVITATION_ACCEPTED", targetType: "User", targetId: user.id },
    });
  });
  return NextResponse.json({ success: true });
}
