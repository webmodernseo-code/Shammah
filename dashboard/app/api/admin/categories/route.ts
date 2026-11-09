import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SHAMMAH_DEFAULT_CATEGORIES = [
  {
    slug: "t-shirts",
    name: "T-shirts",
    description: "T-shirts chrétiens en coton biologique épais",
  },
  {
    slug: "sweats",
    name: "Sweats à capuche",
    description: "Sweats et hoodies en molleton doux structuré",
  },
  {
    slug: "casquettes",
    name: "Casquettes",
    description: "Casquettes et bonnets brodés",
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    description: "Tasses, mugs, sacs et objets du quotidien",
  },
];

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    // Ensure the 4 official Shammah categories always exist in the database
    for (const cat of SHAMMAH_DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
        },
      });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { products: true },
        },
      },
    });

    // Put the 4 official Shammah categories first in canonical order
    const canonicalOrder = ["t-shirts", "sweats", "casquettes", "accessoires"];
    const sorted = [...categories].sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a.slug);
      const idxB = canonicalOrder.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      data: sorted,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({
      success: true,
      data: SHAMMAH_DEFAULT_CATEGORIES.map((c, idx) => ({
        id: `cat-${idx}`,
        ...c,
        _count: { products: 0 },
      })),
    });
  }
}
