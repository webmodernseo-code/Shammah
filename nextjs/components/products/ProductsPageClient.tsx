"use client";

import { ProductsTable, type ProductRow } from "./ProductsTable";

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Produits</h1>
          <p className="mt-1 text-text-body">Ajoutez des articles et gérez les niveaux de stock par variante.</p>
        </div>
        <button id="btn-new-product" className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover">
          + Nouveau produit
        </button>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} onEdit={() => {}} onDelete={() => {}} />
      </div>
    </main>
  );
}
