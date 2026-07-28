"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductsTable, type ProductRow } from "./ProductsTable";
import { ProductDrawer } from "./ProductDrawer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null | "new">(null);
  const router = useRouter();
  const { show } = useToast();

  async function confirmDelete() {
    if (!deletingProduct) return;
    const res = await fetch(`/api/products/${deletingProduct.id}`, { method: "DELETE" });
    if (res.ok) {
      show("L'article a été supprimé avec succès.", "success");
      router.refresh();
    } else {
      show("Erreur lors de la suppression.", "error");
    }
    setDeletingProduct(null);
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Produits</h1>
          <p className="mt-1 text-text-body">Ajoutez des articles et gérez les niveaux de stock par variante.</p>
        </div>
        <button id="btn-new-product" onClick={() => setEditingProduct("new")} className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover">
          + Nouveau produit
        </button>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} onEdit={setEditingProduct} onDelete={setDeletingProduct} />
      </div>

      <ConfirmModal
        open={deletingProduct !== null}
        title="Supprimer l'article"
        message="Voulez-vous vraiment supprimer cet article de la boutique ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />

      <ProductDrawer
        editingProduct={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={() => {
          setEditingProduct(null);
          router.refresh();
        }}
      />
    </main>
  );
}
