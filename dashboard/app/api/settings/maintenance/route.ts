import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_MESSAGE = "Notre boutique Shammah est momentanément en maintenance. Nous revenons très vite.";

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  try {
    const config = await prisma.maintenanceConfig.findUnique({ where: { id: "site" } });
    return NextResponse.json({
      success: true,
      data: config || { enabled: false, message: DEFAULT_MESSAGE, expectedBackAt: null },
    });
  } catch (error) {
    console.error("Erreur lecture maintenance:", error);
    return NextResponse.json(
      { success: false, error: "Service de maintenance indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const session = readSession(req);
  if (!session) return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  const body = await req.json();
  const enabled = Boolean(body.enabled);
  const message = String(body.message || DEFAULT_MESSAGE).trim().slice(0, 500) || DEFAULT_MESSAGE;
  const expectedBackAt = body.expectedBackAt ? new Date(body.expectedBackAt) : null;
  if (expectedBackAt && Number.isNaN(expectedBackAt.getTime())) {
    return NextResponse.json({ error: "Date de retour invalide." }, { status: 400 });
  }

  try {
    const config = await prisma.$transaction(async (tx) => {
      const saved = await tx.maintenanceConfig.upsert({
        where: { id: "site" },
        update: { enabled, message, expectedBackAt, updatedBy: session.userId },
        create: { id: "site", enabled, message, expectedBackAt, updatedBy: session.userId },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorEmail: session.email,
          action: enabled ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
          targetType: "MaintenanceConfig",
          targetId: "site",
          metadata: { message, expectedBackAt: expectedBackAt?.toISOString() || null },
        },
      }).catch(() => null);
      return saved;
    });
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Erreur sauvegarde maintenance:", error);
    return NextResponse.json({ error: "Impossible d'enregistrer la configuration." }, { status: 500 });
  }
}
