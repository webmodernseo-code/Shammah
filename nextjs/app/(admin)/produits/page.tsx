import { prisma } from "@/lib/prisma";
import { ProductsPageClient } from "@/components/products/ProductsPageClient";
import type { ProductRow } from "@/components/products/ProductsTable";

export default async function ProduitsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: { include: { images: { orderBy: { sortOrder: "asc" } }, stock: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    basePrice: Number(p.basePrice),
    category: { name: p.category.name },
    thumbnailUrl: p.variants[0]?.images[0]?.url ?? null,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock.reduce((s, st) => s + st.quantity, 0), 0),
    variants: p.variants.map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorHex: v.colorHex,
      stock: v.stock.map((s) => ({ size: s.size, quantity: s.quantity })),
    })),
  }));

  return <ProductsPageClient products={rows} />;
}
