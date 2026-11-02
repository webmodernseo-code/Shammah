import { NextRequest, NextResponse } from "next/server";
import { hashPassword, isAdmin, readSession, validatePassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limit = rateLimit(`change-password:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  try {
    const session = readSession(req);
    if (!session || !(await isAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "Session expirée ou non autorisée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword, confirmPassword } = await req.json();
    if (typeof oldPassword !== "string" || !oldPassword) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe actuel est requis." },
        { status: 400 }
      );
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Le nouveau mot de passe et la confirmation ne correspondent pas." },
        { status: 400 }
      );
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: "Service temporairement indisponible. Le mot de passe n'a pas été modifié." },
        { status: 503 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { id: session.userId } });
    } catch (error) {
      console.error("Impossible de lire le compte administrateur:", error);
      return NextResponse.json(
        { success: false, error: "Service temporairement indisponible. Le mot de passe n'a pas été modifié." },
        { status: 503 }
      );
    }

    if (!user?.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Compte administrateur introuvable en base de données." },
        { status: 404 }
      );
    }

    const oldPasswordIsValid = await verifyPassword(oldPassword, user.passwordHash);

    if (!oldPasswordIsValid) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe actuel est incorrect." },
        { status: 400 }
      );
    }

    if (await verifyPassword(newPassword, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: "Le nouveau mot de passe doit être différent du mot de passe actuel." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "ADMIN_PASSWORD_CHANGED",
          targetType: "User",
          targetId: user.id,
        },
      }),
    ]);

    const persistedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    const passwordWasPersisted = await verifyPassword(
      newPassword,
      persistedUser?.passwordHash ?? null
    );
    if (!passwordWasPersisted) {
      console.error("Password update verification failed for authenticated administrator");
      return NextResponse.json(
        { success: false, error: "La vérification en base a échoué. Le nouveau mot de passe n'est pas confirmé." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Nouveau mot de passe enregistré et vérifié avec succès.",
    });
  } catch (error) {
    console.error("Erreur change-password:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du changement de mot de passe." },
      { status: 500 }
    );
  }
}
