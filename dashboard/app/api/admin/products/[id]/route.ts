import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeCategory(rawCategory?: string): { slug: string; name: string } {
  const clean = (rawCategory || "T-shirts").trim();
  const lower = clean
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (lower.includes("sweat") || lower.includes("hoodie") || lower.includes("capuche")) {
    return { slug: "sweats", name: "Sweats à capuche" };
  }
  if (lower.includes("casquette") || lower.includes("bonnet") || lower.includes("chapeau")) {
    return { slug: "casquettes", name: "Casquettes" };
  }
  if (lower.includes("accessoire") || lower.includes("tasse") || lower.includes("mug") || lower.includes("sac")) {
    return { slug: "accessoires", name: "Accessoires" };
  }
  if (lower.includes("t-shirt") || lower.includes("tshirt") || lower.includes("tee")) {
    return { slug: "t-shirts", name: "T-shirts" };
  }

  const fallbackSlug = lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "t-shirts";
  return { slug: fallbackSlug, name: clean || "T-shirts" };
}

function deduplicateVariants(
  rawVariants: any[],
  productId: string,
  defaultPrice: number,
  defaultOldPrice: number | null
) {
  const map = new Map<
    string,
    {
      productId: string;
      size: string;
      color: string;
      colorHex: string;
      price: number;
      oldPrice: number | null;
      stock: number;
      inStock: boolean;
    }
  >();

  for (const v of rawVariants) {
    const size = String(v.size || "Unique").trim() || "Unique";
    const color = String(v.color || "Noir").trim() || "Noir";
    const key = `${size.toLowerCase()}:::${color.toLowerCase()}`;
    const vPrice =
      Number.isFinite(Number(v.price)) && Number(v.price) > 0
        ? Number(v.price)
        : defaultPrice;
    const vOldPrice =
      v.oldPrice != null && Number.isFinite(Number(v.oldPrice)) && Number(v.oldPrice) > 0
        ? Number(v.oldPrice)
        : defaultOldPrice;
    const vStock = Number.isFinite(Number(v.stock))
      ? Math.max(0, Math.round(Number(v.stock)))
      : 10;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.stock += vStock;
      existing.inStock = existing.stock > 0;
    } else {
      map.set(key, {
        productId,
        size,
        color,
        colorHex: v.colorHex || "#111827",
        price: vPrice,
        oldPrice: vOldPrice,
        stock: vStock,
        inStock: vStock > 0,
      });
    }
  }

  return Array.from(map.values());
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { code: decodedId },
          { code: decodedId.toUpperCase() },
          { slug: decodedId },
          { slug: decodedId.toLowerCase() },
        ],
      },
      include: {
        category: true,
        variants: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        basePrice: Number(product.basePrice),
        baseOldPrice: product.baseOldPrice ? Number(product.baseOldPrice) : null,
        ratingScore: Number(product.ratingScore),
        variants: product.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du produit." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

async function handleUpdate(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);
    const body = await req.json();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { code: decodedId },
          { code: decodedId.toUpperCase() },
          { slug: decodedId },
          { slug: decodedId.toLowerCase() },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    let categoryId = existing.categoryId;
    if (body.category && typeof body.category === "string" && body.category.trim()) {
      const { slug: catSlug, name: catName } = normalizeCategory(body.category);
      const cat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: catName },
        create: { name: catName, slug: catSlug },
      });
      categoryId = cat.id;
    }

    const price =
      body.price != null && body.price !== ""
        ? Number(body.price ?? body.basePrice)
        : Number(existing.basePrice);
    const comparePrice =
      body.comparePrice === "" || body.comparePrice === null
        ? null
        : body.comparePrice != null
        ? Number(body.comparePrice)
        : existing.baseOldPrice
        ? Number(existing.baseOldPrice)
        : null;
    const stock =
      body.stock != null && body.stock !== ""
        ? Number(body.stock ?? body.stockQuantity)
        : existing.stockQuantity;
    const isAvailable =
      body.isPublished !== undefined
        ? Boolean(body.isPublished)
        : body.isAvailable !== undefined
        ? Boolean(body.isAvailable)
        : undefined;

    if (Array.isArray(body.variants) && body.variants.length > 0) {
      const deduped = deduplicateVariants(
        body.variants,
        existing.id,
        price,
        comparePrice
      );
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.productVariant.createMany({
        data: deduped,
      });
    } else if (stock !== existing.stockQuantity) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: existing.id },
      });
      if (existingVariants.length > 0) {
        const stockDiff = stock - existing.stockQuantity;
        const perVariantAdd = Math.floor(stockDiff / existingVariants.length);
        const remainder = stockDiff % existingVariants.length;
        for (let i = 0; i < existingVariants.length; i++) {
          const v = existingVariants[i];
          const add = perVariantAdd + (i < remainder ? 1 : 0);
          const newVStock = Math.max(0, v.stock + add);
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { stock: newVStock, inStock: newVStock > 0 },
          });
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        title: body.name?.trim() || body.title?.trim() || undefined,
        subtitle: body.subtitle?.trim() || undefined,
        code:
          body.sku?.trim()?.toUpperCase() ||
          body.code?.trim()?.toUpperCase() ||
          undefined,
        description: body.description?.trim() || undefined,
        origin: body.origin?.trim() || undefined,
        material: body.material?.trim() || undefined,
        basePrice: price,
        baseOldPrice: comparePrice,
        stockQuantity: stock,
        isAvailable: isAvailable,
        imageRecto: body.image?.trim() || body.imageRecto?.trim() || undefined,
        imageVerso:
          body.secondaryImage === "" || body.imageVerso === ""
            ? null
            : body.secondaryImage?.trim() || body.imageVerso?.trim() || undefined,
        categoryId: categoryId,
      },
      include: { category: true, variants: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        basePrice: Number(updated.basePrice),
        baseOldPrice: updated.baseOldPrice ? Number(updated.baseOldPrice) : null,
        ratingScore: Number(updated.ratingScore),
        variants: updated.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
        })),
      },
    });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "Erreur lors de la modification de l'article.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { code: decodedId },
          { code: decodedId.toUpperCase() },
          { slug: decodedId },
          { slug: decodedId.toLowerCase() },
        ],
      },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    if (existing._count.orderItems === 0) {
      await prisma.product.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        deleted: true,
        message: "Article supprimé définitivement du catalogue.",
      });
    }

    await prisma.product.update({
      where: { id: existing.id },
      data: { isAvailable: false },
    });

    return NextResponse.json({
      success: true,
      deleted: false,
      message: "Article archivé et retiré de la boutique (historique de commandes conservé).",
    });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la suppression de l'article." },
      { status: 500 }
    );
  }
}
