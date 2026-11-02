import type { BlogPost } from "@prisma/client";
import type { BlogPostItem } from "@/data/default-blogs";
import { prisma } from "@/lib/prisma";

type BlogInput = Partial<BlogPostItem> & Pick<BlogPostItem, "title" | "content">;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function serialize(post: BlogPost): BlogPostItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category as BlogPostItem["category"],
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || "/images/blog/blog-7.jpg",
    authorName: post.authorName,
    authorAvatar: post.authorAvatar || "/images/avatar/blog-author-1.jpg",
    tags: post.tags,
    status: post.status as BlogPostItem["status"],
    publishedAt: (post.publishedAt || post.createdAt).toISOString().slice(0, 10),
    viewsCount: post.viewsCount,
    commentsCount: post.commentsCount,
    readTime: post.readTime,
  };
}

function validatedData(data: BlogInput) {
  const title = data.title?.trim();
  const content = data.content?.trim();
  if (!title || title.length > 180 || !content || content.length > 100_000) {
    throw new Error("Titre ou contenu invalide.");
  }
  const slug = slugify(data.slug?.trim() || title);
  if (!slug) throw new Error("Slug invalide.");
  const status = data.status === "Publié" ? "Publié" : "Brouillon";
  return {
    slug,
    title,
    category: data.category || "Tendances",
    excerpt: data.excerpt?.trim().slice(0, 500) || "",
    content,
    coverImage: data.coverImage?.trim() || null,
    authorName: data.authorName?.trim().slice(0, 120) || "Rédaction Shammah",
    authorAvatar: data.authorAvatar?.trim() || null,
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20) : [],
    status,
    publishedAt: status === "Publié" ? new Date() : null,
    readTime: `${Math.max(2, Math.ceil(content.split(/\s+/).length / 200))} min`,
  };
}

export const blogService = {
  async getAll(filter?: { search?: string; category?: string; status?: string }) {
    const posts = await prisma.blogPost.findMany({
      where: {
        ...(filter?.category && filter.category !== "Tous" ? { category: filter.category } : {}),
        ...(filter?.status && filter.status !== "Tous" ? { status: filter.status } : {}),
        ...(filter?.search
          ? {
              OR: [
                { title: { contains: filter.search, mode: "insensitive" as const } },
                { excerpt: { contains: filter.search, mode: "insensitive" as const } },
                { authorName: { contains: filter.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return posts.map(serialize);
  },

  async getById(id: string) {
    const post = await prisma.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    return post ? serialize(post) : null;
  },

  async create(data: BlogInput) {
    return serialize(await prisma.blogPost.create({ data: validatedData(data) }));
  },

  async update(id: string, updates: Partial<BlogPostItem>) {
    const current = await prisma.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!current) return null;
    const data = validatedData({
      ...serialize(current),
      ...updates,
      title: updates.title ?? current.title,
      content: updates.content ?? current.content,
    });
    return serialize(await prisma.blogPost.update({ where: { id: current.id }, data }));
  },

  async delete(id: string) {
    const result = await prisma.blogPost.deleteMany({ where: { OR: [{ id }, { slug: id }] } });
    return result.count === 1;
  },
};
