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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, type } = body; // type: "category" | "subcategory"

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    // Append a short random suffix so renaming to a name already used elsewhere
    // never collides on the unique slug constraint.
    const uniqueSlug = slugify(name) + "-" + Math.random().toString(36).slice(2, 7);

    if (type === "subcategory") {
      const updated = await prisma.subcategory.update({
        where: { id },
        data: { name, slug: uniqueSlug },
      });
      return NextResponse.json(updated);
    } else {
      const updated = await prisma.category.update({
        where: { id },
        data: { name, slug: uniqueSlug },
      });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Erreur mise à jour catégorie:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "subcategory") {
      await prisma.subcategory.delete({ where: { id } });
    } else {
      await prisma.category.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur suppression catégorie:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
