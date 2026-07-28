import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code promo requis" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({ error: "Code promo invalide ou expiré" }, { status: 404 });
    }

    // Si une date d'expiration existe, la vérifier
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: "Code promo expiré" }, { status: 400 });
    }

    return NextResponse.json({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });
  } catch (error) {
    console.error("Erreur validation code promo:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
