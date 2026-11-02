"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { BlogPostItem, INITIAL_BLOG_POSTS } from "@/data/default-blogs";
import { BookOpen, Plus, Eye as EyeIcon, MessageSquare, Sparkles } from "lucide-react";

const CATEGORY_OPTIONS: Option[] = [
  { label: "Toutes les catégories", value: "Tous" },
  { label: "Homme", value: "Homme" },
  { label: "Femme", value: "Femme" },
  { label: "Enfant", value: "Enfant" },
  { label: "Accessoires", value: "Accessoires" },
  { label: "Tendances", value: "Tendances" },
  { label: "Conseils", value: "Conseils" },
];

const STATUS_OPTIONS: Option[] = [
  { label: "Tous les statuts", value: "Tous" },
  { label: "Publié", value: "Publié" },
  { label: "Brouillon", value: "Brouillon" },
];

export default function BlogListTable() {
  const [posts, setPosts] = useState<BlogPostItem[]>(INITIAL_BLOG_POSTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BlogPostItem | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set("search", searchQuery);
      if (selectedCategory && selectedCategory !== "Tous")
        queryParams.set("category", selectedCategory);
      if (selectedStatus && selectedStatus !== "Tous")
        queryParams.set("status", selectedStatus);

      const res = await fetch(`/api/blog?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des articles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const totalArticles = posts.length;
  const publishedCount = posts.filter((p) => p.status === "Publié").length;
  const totalViews = posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);

  // Filtered & Paginated
  const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
  const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentPosts.map((p) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((i) => i !== id));
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/blog/${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      }
    } catch (e) {
      console.error("Erreur lors de la suppression:", e);
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Homme":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Femme":
        return "bg-pink-50 text-pink-700 border-pink-200/60";
      case "Enfant":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Accessoires":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Tendances":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/60";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Articles de Blog & Inspirations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gérez le contenu éditorial, les guides de style et les publications de mode pour la boutique DivinExpress.
          </p>
        </div>
        <Link href="/blog/add">
          <Button className="bg-gray-900 hover:bg-black text-white gap-2 h-10 px-4 rounded-xl shadow-xs font-medium text-sm">
            <Plus className="size-4" />
            Rédiger un article
          </Button>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Articles</span>
            <span className="p-2 bg-gray-50 rounded-xl text-gray-700">
              <BookOpen className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalArticles}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{publishedCount} en ligne</p>
        </div>

        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Articles Publiés</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Sparkles className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{publishedCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Visibles sur le site</p>
        </div>

        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Lectures & Vues</span>
            <span className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <EyeIcon className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalViews.toLocaleString("fr-FR")}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Lectures cumulées</p>
        </div>

        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Commentaires</span>
            <span className="p-2 bg-purple-50 rounded-xl text-purple-700">
              <MessageSquare className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalComments}</p>
          <p className="text-[11px] text-purple-600 mt-0.5">Interactions clients</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Filters and search */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, auteur, tag..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-44">
              <CustomSelect
                options={CATEGORY_OPTIONS}
                value={CATEGORY_OPTIONS.find((option) => option.value === selectedCategory) || null}
                onChange={(option) => option && setSelectedCategory(String(option.value))}
                placeholder="Catégorie"
              />
            </div>
            <div className="w-40">
              <CustomSelect
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((option) => option.value === selectedStatus) || null}
                onChange={(option) => option && setSelectedStatus(String(option.value))}
                placeholder="Statut"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/60">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="w-12 px-4">
                  <Checkbox
                    checked={
                      currentPosts.length > 0 &&
                      selectedItems.length === currentPosts.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Article & Extrait
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Catégorie
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Auteur
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Temps
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vues
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => {
                  const isChecked = selectedItems.includes(post.id);
                  return (
                    <TableRow
                      key={post.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="px-4 py-3.5">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(c) => handleSelectItem(post.id, !!c)}
                          aria-label={`Sélectionner ${post.title}`}
                        />
                      </TableCell>

                      <TableCell className="py-3.5 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50">
                            <Image
                              src={post.coverImage || "/images/blog/blog-7.jpg"}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/blog/edit/${post.id}`}
                              className="font-medium text-sm text-gray-900 hover:text-primary transition-colors line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getCategoryColor(
                            post.category
                          )}`}
                        >
                          {post.category}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="relative size-6 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={post.authorAvatar || "/images/avatar/blog-author-1.jpg"}
                              alt={post.authorName}
                              fill
                              className="object-cover"
                              sizes="24px"
                            />
                          </div>
                          <span className="text-xs text-gray-700 font-medium">
                            {post.authorName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        <div>{post.publishedAt}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{post.readTime} de lecture</div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-gray-700 font-medium whitespace-nowrap">
                        {post.viewsCount.toLocaleString("fr-FR")}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant={post.status === "Publié" ? "success" : "neutral"}
                          className="text-xs font-normal"
                        >
                          {post.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/edit/${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Modifier l'article"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setItemToDelete(post);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Supprimer l'article"
                          >
                            <Trash className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                    Aucun article trouvé correspondant à vos critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, posts.length)} sur {posts.length} articles
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer cet article"
        description={`Êtes-vous sûr de vouloir supprimer définitivement l'article "${itemToDelete?.title}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
