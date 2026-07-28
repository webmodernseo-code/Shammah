"use client";

import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
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

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        setForm((prev) => (prev.categoryId ? prev : { ...prev, categoryId: data[0]?.id ?? "" }));
      });
  }, []);

  useEffect(() => {
    setForm(emptyForm());
    setDirty(false);
  }, [editingProduct]);

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
