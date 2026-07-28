import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(promos);
  } catch (error) {
    console.error("Erreur récupération codes promo:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { code, discountType, discountValue, active, expiresAt } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        active: active !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error("Erreur création code promo:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
