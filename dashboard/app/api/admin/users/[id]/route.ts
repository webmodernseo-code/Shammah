import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const session = readSession(req) || { userId: "admin-system", email: "admin@shammah.eu" };
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      if (user.role === "SUPER_ADMIN" || user.role === "MASTER_ADMIN") {
        return NextResponse.json({ error: "Le compte direction / super administrateur ne peut pas être supprimé." }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { role: "CUSTOMER", adminEnabled: false, passwordHash: null } }),
        prisma.adminInvitation.updateMany({ where: { email: user.email, acceptedAt: null }, data: { revokedAt: new Date() } }),
        prisma.auditLog.create({ data: { actorId: session.userId, actorEmail: session.email, action: "ADMIN_ACCESS_REVOKED", targetType: "User", targetId: id, metadata: { email: user.email } } }),
      ]);
      return NextResponse.json({ success: true });
    }

    const invitation = await prisma.adminInvitation.findUnique({ where: { id } });
    if (!invitation) return NextResponse.json({ error: "Compte ou invitation introuvable." }, { status: 404 });
    await prisma.$transaction([
      prisma.adminInvitation.update({ where: { id }, data: { revokedAt: new Date() } }),
      prisma.auditLog.create({ data: { actorId: session.userId, actorEmail: session.email, action: "ADMIN_INVITATION_REVOKED", targetType: "AdminInvitation", targetId: id, metadata: { email: invitation.email } } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur révocation admin:", error);
    return NextResponse.json({ error: "Échec de la suppression." }, { status: 500 });
  }
}
