import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) return NextResponse.json({ error: "FAQ introuvable." }, { status: 404 });
  return NextResponse.json({ success: true, data: faq });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const question = String(body.question || "").trim();
    const answer = String(body.answer || "").trim();
    if (question.length < 8 || answer.length < 15) {
      return NextResponse.json({ success: false, error: "La question et la réponse sont trop courtes." }, { status: 400 });
    }
    const faq = await prisma.faq.update({ where: { id }, data: {
      question, answer,
      category: String(body.category || "Général").trim() || "Général",
      status: body.status === "Publié" ? "Publié" : "Brouillon",
    } });
    return NextResponse.json({ success: true, data: faq });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return NextResponse.json({ error: "FAQ introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible de modifier la FAQ." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return NextResponse.json({ error: "FAQ introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible de supprimer la FAQ." }, { status: 500 });
  }
}
