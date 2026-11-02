import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      include: { 
        category: true, 
        variants: {
          orderBy: { id: "asc" }
        } 
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
    return NextResponse.json({ success: false, error: "Service produits indisponible." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name?.trim() || body.title?.trim();
  const sku = (body.sku?.trim() || body.code?.trim() || `DIV-H-${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
  const price = Number(body.price ?? body.basePrice);
  const stock = body.stock != null ? Number(body.stock) : (body.stockQuantity != null ? Number(body.stockQuantity) : 50);
  const image = body.image?.trim() || body.imageRecto?.trim() || "/images/products/fashion-1.jpg";

  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Nom, prix valide et stock valide sont requis." },
      { status: 400 }
    );
  }

  const slug = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let categoryId: string | null = null;
  if (body.category?.trim()) {
    const catName = body.category.trim();
    const catSlug = catName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const cat = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: catName },
      create: { name: catName, slug: catSlug },
    });
    categoryId = cat.id;
  }

  // Extract variants if provided, or generate defaults from sizes & colors
  const variantsToCreate: any[] = [];
  if (Array.isArray(body.variants) && body.variants.length > 0) {
    body.variants.forEach((v: any) => {
      variantsToCreate.push({
        size: v.size || "M",
        color: v.color || "Noir",
        colorHex: v.colorHex || "#111827",
        price: Number(v.price) || price,
        oldPrice: v.oldPrice ? Number(v.oldPrice) : (body.comparePrice ? Number(body.comparePrice) : null),
        stock: Number(v.stock) || 10,
        inStock: (Number(v.stock) || 0) > 0,
      });
    });
  } else if (Array.isArray(body.sizes) && body.sizes.length > 0) {
    const colors = Array.isArray(body.colors) && body.colors.length > 0
      ? body.colors
      : [{ name: "Noir Intense", hex: "#111827" }];

    colors.forEach((c: any) => {
      body.sizes.forEach((s: string) => {
        variantsToCreate.push({
          size: s,
          color: c.name || "Noir",
          colorHex: c.hex || "#111827",
          price: price,
          oldPrice: body.comparePrice ? Number(body.comparePrice) : null,
          stock: Math.floor(stock / (body.sizes.length * colors.length)) || 10,
          inStock: true,
        });
      });
    });
  } else {
    variantsToCreate.push({
      size: "Taille Unique",
      color: "Noir Intense",
      colorHex: "#111827",
      price: price,
      oldPrice: body.comparePrice ? Number(body.comparePrice) : null,
      stock: stock,
      inStock: stock > 0,
    });
  }

  // Check if product with this SKU or slug already exists (upsert)
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ code: sku }, { slug: slug }],
    },
  });

  let product;
  if (existing) {
    // Delete existing variants and re-create updated list
    await prisma.productVariant.deleteMany({ where: { productId: existing.id } });

    product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        title: name,
        subtitle: body.subtitle?.trim() || undefined,
        code: sku,
        slug: body.slug?.trim() || slug,
        description: body.description?.trim() || name,
        origin: body.origin?.trim() || "Atelier Création Shammah",
        material: body.material?.trim() || "100% Coton Biologique",
        gender: body.gender?.trim() || (body.category?.includes("Femme") ? "Femme" : "Homme"),
        basePrice: price,
        baseOldPrice: body.comparePrice ? Number(body.comparePrice) : null,
        imageRecto: image,
        imageVerso: body.imageVerso?.trim() || body.secondaryImage?.trim() || null,
        stockQuantity: stock,
        isAvailable: body.isPublished !== false,
        categoryId: categoryId || existing.categoryId,
        variants: {
          create: variantsToCreate,
        },
      },
      include: { category: true, variants: true },
    });
  } else {
    product = await prisma.product.create({
      data: {
        slug: body.slug?.trim() || slug,
        code: sku,
        title: name,
        subtitle: body.subtitle?.trim() || null,
        description: body.description?.trim() || name,
        origin: body.origin?.trim() || "Atelier Création Shammah",
        material: body.material?.trim() || "100% Coton Biologique",
        gender: body.gender?.trim() || (body.category?.includes("Femme") ? "Femme" : "Homme"),
        basePrice: price,
        baseOldPrice: body.comparePrice ? Number(body.comparePrice) : null,
        imageRecto: image,
        imageVerso: body.imageVerso?.trim() || body.secondaryImage?.trim() || null,
        stockQuantity: stock,
        isAvailable: body.isPublished !== false,
        categoryId,
        variants: {
          create: variantsToCreate,
        },
      },
      include: { category: true, variants: true },
    });
  }

  return NextResponse.json({ success: true, data: product }, { status: 201 });
}
