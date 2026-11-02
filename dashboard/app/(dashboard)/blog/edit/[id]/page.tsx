import BlogForm from "@/components/blog/blog-form";
import { blogService } from "@/lib/blog-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Modifier l'article de Blog | DivinExpress Admin",
  description: "Mettez à jour votre publication du blog DivinExpress.",
};

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await blogService.getById(id);

  if (!post) {
    notFound();
  }

  return <BlogForm initialData={post} isEditing={true} />;
}
