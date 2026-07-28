"use client";

import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { VariantEditor } from "./VariantEditor";
import { ProductPreviewCard } from "./ProductPreviewCard";
import type { ProductRow } from "./ProductsTable";

export type VariantFormState = { colorName: string; colorHex: string; images: string[]; stock: Record<string, number> };
export type ProductFormState = {
  title: string;
  price: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  variants: VariantFormState[];
};

type Category = { id: string; name: string; slug: string; subcategories: { id: string; name: string; slug: string }[] };

function emptyForm(): ProductFormState {
  return { title: "", price: "", categoryId: "", subcategoryId: "", description: "", variants: [] };
}

export function ProductDrawer({
  editingProduct,
  onClose,
  onSaved,
}: {
  editingProduct: ProductRow | null | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [dirty, setDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data));
  }, []);

  // The drawer component never unmounts between opens (editingProduct just cycles
  // null -> "new"/product -> null), so the one-time categories fetch above can't be
  // relied on to backfill categoryId on every open — this effect re-derives the form
  // fresh from both editingProduct AND categories, and waits for categories to be
  // loaded before initializing a new product's categoryId.
  useEffect(() => {
    if (editingProduct && editingProduct !== "new") {
      setForm({
        title: editingProduct.title,
        price: String(editingProduct.basePrice),
        categoryId: editingProduct.categoryId,
        subcategoryId: editingProduct.subcategoryId ?? "",
        description: editingProduct.description,
        variants: editingProduct.variants.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          images: v.images.length ? v.images : [""],
          stock: Object.fromEntries(v.stock.map((s) => [s.size, s.quantity])),
        })),
      });
      setDirty(false);
    } else if (editingProduct === "new" && categories.length > 0) {
      setForm({ ...emptyForm(), categoryId: categories[0].id });
      setDirty(false);
    }
  }, [editingProduct, categories]);

  if (editingProduct === null) return null;

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  function update<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function requestClose() {
    if (dirty) {
      setConfirmingClose(true);
    } else {
      onClose();
    }
  }

  async function handlePublish() {
    if (!form.title.trim() || !form.price || isNaN(Number(form.price))) {
      show("Veuillez renseigner un titre et un prix corrects.", "error");
      return;
    }
    if (form.variants.length === 0) {
      show("Veuillez ajouter au moins une variante de couleur.", "error");
      return;
    }
    if (!form.variants[0].images.some((img) => img.trim())) {
      show("Veuillez renseigner au moins une photo pour la première couleur.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      basePrice: Number(form.price),
      baseCurrency: "EUR",
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      variants: form.variants.map((v) => ({
        colorName: v.colorName,
        colorHex: v.colorHex,
        images: v.images.filter((img) => img.trim()).map((url, i) => ({ url, sortOrder: i })),
        stock: Object.entries(v.stock).map(([size, quantity]) => ({ size, quantity })),
      })),
    };

    const isEdit = editingProduct !== "new" && editingProduct !== null;
    const res = await fetch(isEdit ? `/api/products/${editingProduct.id}` : "/api/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      show(isEdit ? `"${form.title}" mis à jour avec succès.` : `"${form.title}" publié avec succès.`, "success");
      setDirty(false);
      onSaved();
    } else {
      show("Erreur lors de la publication.", "error");
    }
  }

  return (
    <div id="product-drawer" className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-card-bg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-heading">
            {editingProduct === "new" ? "Nouveau Produit" : "Modifier : " + editingProduct.title}
          </h3>
          <button id="drawer-close" onClick={requestClose} aria-label="Fermer" className="text-2xl leading-none text-text-body">
            &times;
          </button>
        </div>

        <section className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-text-heading">Informations générales</h4>
          <div>
            <label className="block text-xs font-medium text-text-body">Nom de l&apos;article*</label>
            <input id="drawer-title" value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Prix de vente*</label>
            <input id="drawer-price" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Catégorie Parente*</label>
            <select
              id="drawer-category"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Sous-Catégorie</label>
            <select
              id="drawer-subcategory"
              value={form.subcategoryId}
              onChange={(e) => update("subcategoryId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Aucune</option>
              {selectedCategory?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Description</label>
            <textarea id="drawer-description" value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
        </section>

        <VariantEditor
          variants={form.variants}
          onChange={(variants) => update("variants", variants)}
          categorySlug={selectedCategory?.slug}
        />

        <ProductPreviewCard
          title={form.title}
          price={Number(form.price) || 0}
          categoryName={selectedCategory?.name ?? ""}
          imageUrl={form.variants[0]?.images.find((img) => img) ?? null}
        />

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={requestClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-heading hover:bg-gray-50">
            Annuler
          </button>
          <button
            id="drawer-publish-btn"
            type="button"
            disabled={saving}
            onClick={handlePublish}
            className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover disabled:opacity-60"
          >
            {editingProduct === "new" ? "Publier sur la boutique" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmingClose}
        title="Fermer sans enregistrer ?"
        message="Les modifications non publiées seront perdues."
        confirmLabel="Fermer"
        onConfirm={() => {
          setConfirmingClose(false);
          onClose();
        }}
        onCancel={() => setConfirmingClose(false)}
      />
    </div>
  );
}
