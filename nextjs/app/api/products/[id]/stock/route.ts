import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { variantId, size, quantity } = body;

    if (!variantId || !size || typeof quantity !== "number") {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const safeQuantity = Math.max(0, Math.trunc(quantity));

    const updated = await prisma.productVariantStock.update({
      where: { variantId_size: { variantId, size } },
      data: { quantity: safeQuantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur mise à jour du stock:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
