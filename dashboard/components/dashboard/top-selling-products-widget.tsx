"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageOpen, Trophy } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  code: string;
  category: string;
  units: number;
}

export default function TopSellingProductsWidget() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        setProducts(Array.isArray(payload?.data?.topProducts) ? payload.data.topProducts : []);
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-[#2b6b61]" strokeWidth={1.8} aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">Produits les plus vendus</h2>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2b6b61]">
          Voir tous <ArrowRight className="size-3" />
        </Link>
      </div>

      {unavailable ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm text-rose-800">
          Données produits indisponibles.
        </div>
      ) : loading ? (
        <div className="flex flex-1 items-center justify-center py-8 text-sm text-slate-400">Chargement du catalogue…</div>
      ) : products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          <PackageOpen className="mb-2 size-5" />
          Aucune vente payée enregistrée.
        </div>
      ) : (
        <div className="space-y-3.5">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl p-2 transition hover:bg-slate-50">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <PackageOpen className="size-5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{product.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{product.code} · {product.category}</p>
                </div>
              </div>
              <p className="shrink-0 text-xs font-bold text-slate-900">
                {product.units.toLocaleString("fr-FR")} vendu{product.units > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
