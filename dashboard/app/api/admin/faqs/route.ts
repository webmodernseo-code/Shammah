import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const faqs = await prisma.faq.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("FAQ list failed:", error);
    return NextResponse.json({ success: false, error: "Service FAQ indisponible." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const body = await req.json();
    const question = String(body.question || "").trim();
    const answer = String(body.answer || "").trim();
    const category = String(body.category || "Général").trim();
    const status = body.status === "Publié" ? "Publié" : "Brouillon";
    if (question.length < 8 || answer.length < 15) {
      return NextResponse.json({ success: false, error: "La question et la réponse sont trop courtes." }, { status: 400 });
    }
    const faq = await prisma.faq.create({ data: { question, answer, category: category || "Général", status } });
    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error("FAQ creation failed:", error);
    return NextResponse.json({ success: false, error: "Impossible de créer la FAQ." }, { status: 500 });
  }
}
