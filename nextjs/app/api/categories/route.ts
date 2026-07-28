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
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur récupération catégories:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, parentId } = body;

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    // Append a short random suffix so two categories/subcategories sharing a name
    // never collide on the unique slug constraint.
    const uniqueSlug = slugify(name) + "-" + Math.random().toString(36).slice(2, 7);

    if (parentId) {
      // Creating a subcategory
      const sub = await prisma.subcategory.create({
        data: { name, slug: uniqueSlug, categoryId: parentId },
      });
      return NextResponse.json(sub, { status: 201 });
    } else {
      // Creating a top-level category
      const cat = await prisma.category.create({
        data: { name, slug: uniqueSlug },
      });
      return NextResponse.json(cat, { status: 201 });
    }
  } catch (error) {
    console.error("Erreur création catégorie:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
