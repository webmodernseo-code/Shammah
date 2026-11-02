import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/blog-service";
import { isAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await params;
    const post = await blogService.getById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Article introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await blogService.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Article introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Article mis à jour avec succès",
      post: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await params;
    const deleted = await blogService.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Article introuvable ou déjà supprimé" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Article supprimé avec succès",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
