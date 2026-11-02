import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/blog-service";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;

    const posts = await blogService.getAll({ search, category, status });
    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: "Le titre et le contenu sont obligatoires." },
        { status: 400 }
      );
    }

    const newPost = await blogService.create(body);
    return NextResponse.json(
      { success: true, message: "Article créé avec succès", post: newPost },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
