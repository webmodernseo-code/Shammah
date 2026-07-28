import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Numéro de commande requis" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Retourner uniquement les données publiques pour le suivi
    return NextResponse.json({
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Erreur suivi commande:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
