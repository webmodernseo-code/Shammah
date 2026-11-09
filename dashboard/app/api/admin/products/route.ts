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
  defaultPrice: number,
  defaultOldPrice: number | null,
  defaultStock: number
) {
  const map = new Map<
    string,
    {
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
    const vPrice = Number.isFinite(Number(v.price)) && Number(v.price) > 0 ? Number(v.price) : defaultPrice;
    const vOldPrice =
      v.oldPrice != null && Number.isFinite(Number(v.oldPrice)) && Number(v.oldPrice) > 0
        ? Number(v.oldPrice)
        : defaultOldPrice;
    const vStock = Number.isFinite(Number(v.stock)) ? Math.max(0, Math.round(Number(v.stock))) : 10;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.stock += vStock;
      existing.inStock = existing.stock > 0;
    } else {
      map.set(key, {
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

  if (map.size === 0) {
    map.set("unique:::noir", {
      size: "Taille Unique",
      color: "Noir",
      colorHex: "#111827",
      price: defaultPrice,
      oldPrice: defaultOldPrice,
      stock: Math.max(0, defaultStock),
      inStock: defaultStock > 0,
    });
  }

  return Array.from(map.values());
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
        baseOldPrice: p.baseOldPrice ? Number(p.baseOldPrice) : null,
        ratingScore: Number(p.ratingScore),
        variants: p.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
        })),
      })),
    });
  } catch (error) {
    console.error("Products database query failed:", error);
    return NextResponse.json(
      { success: false, error: "Service produits indisponible." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = (body.name ?? body.title ?? "").toString().trim();
    const rawSku = (body.sku ?? body.code ?? "").toString().trim();
    const sku = (rawSku || `SHM-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const price = Number(body.price ?? body.basePrice);
    const rawComparePrice = body.comparePrice ?? body.baseOldPrice;
    const comparePrice =
      rawComparePrice != null && rawComparePrice !== "" && Number.isFinite(Number(rawComparePrice)) && Number(rawComparePrice) > 0
        ? Number(rawComparePrice)
        : null;
    const rawStock = body.stock ?? body.stockQuantity;
    const stock =
      rawStock != null && Number.isFinite(Number(rawStock))
        ? Math.max(0, Math.round(Number(rawStock)))
        : 50;
    const image =
      (body.image ?? body.imageRecto ?? "").toString().trim() ||
      "/images/cls-categories/pod/t-shirts-jesus.jpg";
    const imageVerso =
      (body.imageVerso ?? body.secondaryImage ?? "").toString().trim() || null;

    if (!name) {
      return NextResponse.json(
        { error: "Veuillez renseigner le nom de l'article." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Veuillez renseigner un prix de vente valide supérieur à 0 €." },
        { status: 400 }
      );
    }

    const baseSlug =
      String(name)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `article-${Date.now()}`;

    const { slug: catSlug, name: catName } = normalizeCategory(body.category);
    const cat = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: catName },
      create: { name: catName, slug: catSlug },
    });
    const categoryId = cat.id;

    // Build raw variants list from body.variants or body.sizes/colors
    let rawVariants: any[] = [];
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      rawVariants = body.variants;
    } else if (Array.isArray(body.sizes) && body.sizes.length > 0) {
      const colors =
        Array.isArray(body.colors) && body.colors.length > 0
          ? body.colors
          : [{ name: "Noir", hex: "#111827" }];
      const perVariantStock =
        Math.max(1, Math.floor(stock / (body.sizes.length * colors.length))) || 10;

      colors.forEach((c: any) => {
        body.sizes.forEach((s: string) => {
          rawVariants.push({
            size: s,
            color: c.name || "Noir",
            colorHex: c.hex || "#111827",
            price,
            oldPrice: comparePrice,
            stock: perVariantStock,
          });
        });
      });
    }

    const variantsToCreate = deduplicateVariants(
      rawVariants,
      price,
      comparePrice,
      stock
    );

    const calculatedStock =
      variantsToCreate.reduce((sum, v) => sum + v.stock, 0) || stock;

    // Check if an existing product has the exact same SKU code
    const existingByCode = await prisma.product.findUnique({
      where: { code: sku },
    });

    let product;
    if (existingByCode) {
      await prisma.productVariant.deleteMany({
        where: { productId: existingByCode.id },
      });

      product = await prisma.product.update({
        where: { id: existingByCode.id },
        data: {
          title: name,
          subtitle: body.subtitle?.trim() || undefined,
          description: body.description?.trim() || name,
          origin: body.origin?.trim() || "Atelier Création Shammah",
          material: body.material?.trim() || "100% Coton Biologique",
          gender: body.gender?.trim() || "Unisexe",
          basePrice: price,
          baseOldPrice: comparePrice,
          imageRecto: image,
          imageVerso,
          stockQuantity: calculatedStock,
          isAvailable: body.isPublished !== false,
          isFeatured: Boolean(body.isFeatured),
          categoryId,
          variants: {
            create: variantsToCreate,
          },
        },
        include: { category: true, variants: true },
      });
    } else {
      // Ensure slug is unique so we never collide with another product
      let uniqueSlug = body.slug?.trim() || baseSlug;
      const slugCollision = await prisma.product.findUnique({
        where: { slug: uniqueSlug },
      });
      if (slugCollision) {
        uniqueSlug = `${uniqueSlug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      product = await prisma.product.create({
        data: {
          slug: uniqueSlug,
          code: sku,
          title: name,
          subtitle: body.subtitle?.trim() || null,
          description: body.description?.trim() || name,
          origin: body.origin?.trim() || "Atelier Création Shammah",
          material: body.material?.trim() || "100% Coton Biologique",
          gender: body.gender?.trim() || "Unisexe",
          basePrice: price,
          baseOldPrice: comparePrice,
          imageRecto: image,
          imageVerso,
          stockQuantity: calculatedStock,
          isAvailable: body.isPublished !== false,
          isFeatured: Boolean(body.isFeatured),
          categoryId,
          variants: {
            create: variantsToCreate,
          },
        },
        include: { category: true, variants: true },
      });
    }

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create/update product:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Une erreur est survenue lors de l'enregistrement de l'article.",
      },
      { status: 500 }
    );
  }
}
