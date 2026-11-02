import BlogListTable from "@/components/blog/blog-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion du Blog & Articles de Mode | Shammah Admin",
  description: "Gérez les publications du blog, tendances, guides de style et actualités Shammah.",
};

export default function BlogPage() {
  return <BlogListTable />;
}
