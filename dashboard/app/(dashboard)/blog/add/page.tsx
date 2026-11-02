import BlogForm from "@/components/blog/blog-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rédiger un article de Blog | DivinExpress Admin",
  description: "Créez une nouvelle publication pour le blog DivinExpress.",
};

export default function AddBlogPage() {
  return <BlogForm isEditing={false} />;
}
