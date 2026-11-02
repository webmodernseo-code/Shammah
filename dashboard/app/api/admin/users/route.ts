import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, readSession } from "@/lib/auth";
import { sendAdminInvitationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  try {
    const [users, invitations] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"] } },
        select: { id: true, name: true, email: true, role: true, adminEnabled: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.adminInvitation.findMany({
        where: { acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true, name: true, email: true, role: true, expiresAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return NextResponse.json({ success: true, users, invitations });
  } catch (error) {
    console.error("Erreur API Admin Users:", error);
    return NextResponse.json(
      { success: false, error: "Service utilisateurs indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const session = readSession(req);
  if (!session) return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Nom et adresse e-mail valides requis." }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && ["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(existing.role)) {
      return NextResponse.json({ error: "Cette personne possède déjà un accès administrateur." }, { status: 409 });
    }

    await prisma.adminInvitation.updateMany({
      where: { email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const invitation = await prisma.adminInvitation.create({
      data: { email, name, tokenHash, role: "ADMIN", invitedById: session.userId, expiresAt },
    });
    const requestOrigin = new URL(req.url).origin;
    const configuredOrigin = process.env.NEXT_PUBLIC_DASHBOARD_URL;
    const configuredIsLocal = configuredOrigin
      ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredOrigin)
      : false;
    const origin = (
      requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1")
        ? (configuredOrigin || requestOrigin)
        : (configuredOrigin && !configuredIsLocal ? configuredOrigin : "https://admin.divinexpress.fr")
    ).replace(/\/$/, "");
    const invitationUrl = `${origin}/accept-invitation?token=${encodeURIComponent(token)}`;
    const delivery = await sendAdminInvitationEmail({ to: email, name, invitationUrl, expiresAt }).catch(() => ({ success: false }));
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorEmail: session.email,
        action: "ADMIN_INVITED",
        targetType: "AdminInvitation",
        targetId: invitation.id,
        metadata: { email, delivered: delivery?.success || false },
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      delivered: delivery?.success || false,
      warning: delivery?.success ? undefined : "L'e-mail n'a pas pu être envoyé automatiquement. Copiez le lien d'invitation généré ci-dessous.",
      invitationUrl: delivery?.success ? undefined : invitationUrl,
    });
  } catch (error) {
    console.error("Erreur création invitation admin:", error);
    return NextResponse.json({ error: "Échec de l'envoi de l'invitation." }, { status: 500 });
  }
}
