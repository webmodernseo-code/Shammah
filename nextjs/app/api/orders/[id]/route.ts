import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["EN_ATTENTE", "PAYEE", "EXPEDIEE", "ANNULEE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new Error("NOT_FOUND");

      const order = await tx.order.update({ where: { id }, data: { status } });

      // Restore stock the first time an order transitions into ANNULEE —
      // public/orders decrements stock at creation, so cancelling must give it back.
      if (status === "ANNULEE" && existing.status !== "ANNULEE") {
        for (const item of existing.items) {
          if (item.variantId && item.size) {
            await tx.productVariantStock.updateMany({
              where: { variantId: item.variantId, size: item.size },
              data: { quantity: { increment: item.quantity } },
            });
          }
        }
      }

      return order;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    console.error("Erreur mise à jour statut commande:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
