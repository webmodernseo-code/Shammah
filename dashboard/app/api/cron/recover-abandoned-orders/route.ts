import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Route de relance automatique des paniers abandonnés / commandes impayées
 * Exécutable via tâche automatisée (Cron).
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || cronSecret.length < 32 || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: { in: ["UNPAID", "FAILED", "PENDING"] },
        status: "PENDING",
        createdAt: {
          lte: oneHourAgo,
          gte: fortyEightHoursAgo,
        },
      },
      include: {
        items: true,
      },
      take: 20,
    });

    const report = {
      evaluated: pendingOrders.length,
      recovered: 0,
      skippedAlreadyPaid: 0,
      errors: [] as string[],
    };

    for (const order of pendingOrders) {
      // Check if user already completed another paid order
      const paidOrder = await prisma.order.findFirst({
        where: {
          customerEmail: order.customerEmail,
          paymentStatus: "PAID",
        },
      });

      if (paidOrder) {
        report.skippedAlreadyPaid++;
        continue;
      }

      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
        const cartUrl = `${siteUrl.replace(/\/$/, "")}/checkout?orderNumber=${encodeURIComponent(order.orderNumber)}`;
        const emailRes = await sendAbandonedCartReminderEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          cartUrl,
        });

        if (emailRes.success) {
          report.recovered++;
        } else if (emailRes.error) {
          report.errors.push(`Order ${order.orderNumber}: ${emailRes.error}`);
        }
      } catch (err: any) {
        report.errors.push(`Order ${order.orderNumber}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error: any) {
    console.error("Erreur Cron Abandoned Orders Recovery:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la relance des commandes abandonnées",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
