import { prisma } from "@/lib/prisma";
import StorefrontShell from "@/components/StorefrontShell";

// Disable server caching for this page so stock levels and order changes are real-time
export const revalidate = 0;

export default async function StorefrontPage() {
  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // 2. Fetch subcategories
  const subcategories = await prisma.subcategory.findMany({
    orderBy: { name: "asc" },
  });

  // 3. Fetch products with all related variants, images, and stock rows
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

  // Safe serialization of Prisma Decimals and Dates for client components
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedSubcategories = JSON.parse(JSON.stringify(subcategories));

  return (
    <StorefrontShell
      initialProducts={serializedProducts}
      initialCategories={serializedCategories}
      initialSubcategories={serializedSubcategories}
    />
  );
}
