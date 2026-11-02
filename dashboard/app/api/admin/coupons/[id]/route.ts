import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.code) updateData.code = body.code.trim().toUpperCase();
    if (body.discountPercent !== undefined) {
      updateData.discountPercent = parseFloat(Number(body.discountPercent).toFixed(2));
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.minOrderAmount !== undefined) {
      updateData.minOrderAmount = body.minOrderAmount ? parseFloat(Number(body.minOrderAmount).toFixed(2)) : null;
    }
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Erreur modification code promo:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de modifier le code promo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Code promo supprimé avec succès.",
    });
  } catch (error: any) {
    console.error("Erreur suppression code promo:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de supprimer ce code promo." },
      { status: 500 }
    );
  }
}
