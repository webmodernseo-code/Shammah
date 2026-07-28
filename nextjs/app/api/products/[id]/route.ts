import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, basePrice, baseCurrency, categoryId, subcategoryId, variants } = body;

    // Update base product fields
    await prisma.product.update({
      where: { id },
      data: {
        title,
        description: description || "",
        basePrice,
        baseCurrency: baseCurrency || "EUR",
        categoryId,
        subcategoryId: subcategoryId || null,
      },
    });

    // Replace variants: delete all existing, recreate from payload
    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      for (const v of variants as {
        colorName: string;
        colorHex: string;
        images?: { url: string; sortOrder: number }[];
        stock?: { size: string; quantity: number }[];
      }[]) {
        await prisma.productVariant.create({
          data: {
            productId: id,
            colorName: v.colorName,
            colorHex: v.colorHex || "#000000",
            images: {
              create: (v.images || []).map((img) => ({
                url: img.url,
                sortOrder: img.sortOrder || 0,
              })),
            },
            stock: {
              create: (v.stock || []).map((s) => ({
                size: s.size,
                quantity: s.quantity || 0,
              })),
            },
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        variants: { include: { images: true, stock: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
