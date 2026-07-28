import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        variants: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur récupération produits:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, basePrice, baseCurrency, categoryId, subcategoryId, variants } = body;

    if (!title || !basePrice || !categoryId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const baseSlug = slugify(title) + "-" + Math.random().toString(36).slice(2, 7);

    const product = await prisma.product.create({
      data: {
        title,
        slug: baseSlug,
        description: description || "",
        basePrice,
        baseCurrency: baseCurrency || "EUR",
        categoryId,
        subcategoryId: subcategoryId || null,
        variants: {
          create: (variants || []).map((v: {
            colorName: string;
            colorHex: string;
            images?: { url: string; sortOrder: number }[];
            stock?: { size: string; quantity: number }[];
          }) => ({
            colorName: v.colorName,
            colorHex: v.colorHex || "#000000",
            images: {
              create: (v.images || []).map((img: { url: string; sortOrder: number }) => ({
                url: img.url,
                sortOrder: img.sortOrder || 0,
              })),
            },
            stock: {
              create: (v.stock || []).map((s: { size: string; quantity: number }) => ({
                size: s.size,
                quantity: s.quantity || 0,
              })),
            },
          })),
        },
      },
      include: {
        category: true,
        subcategory: true,
        variants: { include: { images: true, stock: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur création produit:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
