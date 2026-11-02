"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BlogPostItem } from "@/data/default-blogs";
import CustomSelect, { Option } from "../ui/custom-select";
import { ArrowLeft, Check, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";

interface BlogFormProps {
  initialData?: BlogPostItem | null;
  isEditing?: boolean;
}

const CATEGORY_OPTIONS: Option[] = [
  { label: "Tendances & Mode", value: "Tendances" },
  { label: "Mode Homme", value: "Homme" },
  { label: "Mode Femme", value: "Femme" },
  { label: "Mode Enfant", value: "Enfant" },
  { label: "Accessoires & Maroquinerie", value: "Accessoires" },
  { label: "Conseils de Style", value: "Conseils" },
];

const STATUS_OPTIONS: Option[] = [
  { label: "Publié (En ligne)", value: "Publié" },
  { label: "Brouillon (Non visible)", value: "Brouillon" },
];

export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState<string>(initialData?.category || "Tendances");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || "/images/blog/blog-7.jpg"
  );
  const [authorName, setAuthorName] = useState(
    initialData?.authorName || "Rédaction Shammah"
  );
  const [tags, setTags] = useState<string>(
    initialData?.tags?.join(", ") || "Mode, Tendances, Shammah"
  );
  const [status, setStatus] = useState<string>(initialData?.status || "Publié");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generateSlugFromTitle = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Veuillez renseigner au minimum un titre et le contenu de l'article.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || "/images/blog/blog-7.jpg",
      authorName: authorName.trim() || "Rédaction Shammah",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    };

    try {
      const url = isEditing && initialData ? `/api/blog/${initialData.id}` : `/api/blog`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(isEditing ? "Article mis à jour avec succès !" : "Article publié avec succès !");
        setTimeout(() => {
          router.push("/blog");
          router.refresh();
        }, 800);
      } else {
        setErrorMsg(data.message || "Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="p-2 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              {isEditing ? "Modifier l'article" : "Rédiger un nouvel article"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {isEditing
                ? "Mettez à jour les informations, images ou texte de la publication."
                : "Créez un nouveau contenu de blog captivant pour les clients de Shammah."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/blog">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-gray-200 text-gray-700 h-10 px-4 text-xs sm:text-sm font-medium"
            >
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gray-900 hover:bg-black text-white gap-2 h-10 px-5 rounded-xl shadow-xs font-medium text-xs sm:text-sm"
          >
            {saving ? (
              "Enregistrement..."
            ) : (
              <>
                <Check className="size-4" />
                {isEditing ? "Enregistrer les modifications" : "Publier l'article"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
          <Sparkles className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contenu de l'article
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Titre de l'article *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => generateSlugFromTitle(e.target.value)}
                placeholder="Ex: Les 5 pièces indispensables du dressing masculin cet été"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Identifiant URL (Slug SEO)
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <span className="px-3 text-xs text-gray-400 select-none border-r border-gray-200 bg-gray-50 py-3">
                  shammah.eu/blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="les-5-pieces-indispensables"
                  className="w-full px-3 py-2.5 text-sm bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Extrait / Résumé d'accroche (affiché dans les listes & moteurs de recherche)
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Une courte synthèse attrayante pour susciter l'intérêt du lecteur..."
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Corps de l'article (Markdown / Texte formaté) *
              </label>
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez ici le contenu complet de votre article avec des paragraphes, sous-titres (###) ou listes..."
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400 font-mono text-xs leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Référencement & Tags
            </h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Mots-clés / Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Mode, Tendances, Homme, Lin, Costume"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Meta, Category, Cover Image) */}
        <div className="space-y-6">
          {/* Publication Status & Category */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Paramètres de publication
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Statut
              </label>
              <CustomSelect
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((option) => option.value === status) || null}
                onChange={(option) => option && setStatus(String(option.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Catégorie de mode
              </label>
              <CustomSelect
                options={CATEGORY_OPTIONS}
                value={CATEGORY_OPTIONS.find((option) => option.value === category) || null}
                onChange={(option) => option && setCategory(String(option.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Nom de l'auteur
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex: Élodie Laurent"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Image de couverture
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                URL de l'image
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/blog/blog-7.jpg"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
              />
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 flex items-center justify-center">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt="Aperçu couverture"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={() => {}}
                />
              ) : (
                <div className="text-center p-4 text-gray-400">
                  <ImageIcon className="size-8 mx-auto mb-1 text-gray-300" />
                  <span className="text-xs">Aucune image sélectionnée</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Format conseillé : 1200x800 px (JPG, WebP ou PNG). L'image s'adaptera automatiquement à tous les formats d'écran.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
