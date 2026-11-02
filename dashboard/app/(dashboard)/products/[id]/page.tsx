"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Shirt, Package, AlertCircle } from "lucide-react";
import BasicInfo from "@/components/products/product-details/basic-info";
import ProductMedia from "@/components/products/product-details/product-media";
import ProductVariantTable from "@/components/products/product-details/product-variant-table";

interface VariantItem {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  status: "En stock" | "Stock faible" | "Rupture";
}

interface ProductDetailsData {
  id: string;
  name: string;
  category: string;
  price: number;
  comparePrice?: number;
  sku: string;
  material: string;
  fit: string;
  care: string;
  origin: string;
  status: "Publié" | "Brouillon" | "Archivé";
  description: string;
  image: string;
  totalStock: number;
  season: string;
  gallery: Array<{ url: string; label: string }>;
  variants: VariantItem[];
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [productData, setProductData] = useState<ProductDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Produit introuvable.");
        }

        const p = json.data;
        const variantsList: VariantItem[] = Array.isArray(p.variants)
          ? p.variants.map((v: any) => {
              const stock = Number(v.stock) || 0;
              const status: "En stock" | "Stock faible" | "Rupture" =
                stock > 10 ? "En stock" : stock > 0 ? "Stock faible" : "Rupture";
              return {
                sku: `${p.code || "DIV"}-${(v.color || "STD").slice(0, 3).toUpperCase()}-${v.size || "U"}`,
                color: v.color || "Noir",
                colorHex: v.colorHex || "#111827",
                size: v.size || "Unique",
                stock,
                price: Number(v.price) || Number(p.basePrice) || 0,
                status,
              };
            })
          : [];

        const gallery: Array<{ url: string; label: string }> = [];
        if (p.imageRecto) {
          gallery.push({ url: p.imageRecto, label: "Vue Face Principale" });
        }
        if (p.imageVerso) {
          gallery.push({ url: p.imageVerso, label: "Vue Dos / Verso" });
        }
        if (gallery.length === 0) {
          gallery.push({ url: "/images/products/fashion-1.jpg", label: "Vue par défaut" });
        }

        const formatted: ProductDetailsData = {
          id: p.id,
          name: p.title || p.name || "Pièce Haute Couture",
          category: p.category?.name || "Collection Prêt-à-porter",
          price: Number(p.basePrice) || 0,
          comparePrice: p.baseOldPrice ? Number(p.baseOldPrice) : undefined,
          sku: p.code || id,
          material: p.material || "100% Coton Biologique",
          fit: p.subtitle || "Coupe ajustée & finitions soignées",
          care: "Nettoyage délicat sur l'envers ou pressing spécialisé",
          origin: p.origin || "Atelier Création DivinExpress",
          status: p.isAvailable !== false ? "Publié" : "Brouillon",
          description: p.description || "Création confectionnée dans des matières nobles.",
          image: p.imageRecto || "/images/products/fashion-1.jpg",
          totalStock: p.stockQuantity ?? 0,
          season: "Collection Permanente DivinExpress",
          gallery,
          variants: variantsList,
        };

        setProductData(formatted);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du produit.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-gray-200" />
        <div className="h-64 bg-white rounded-2xl border border-gray-200" />
        <div className="h-48 bg-white rounded-2xl border border-gray-200" />
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-white rounded-2xl border border-gray-200/90 text-center shadow-xs">
          <AlertCircle className="size-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-gray-900">Produit introuvable</h2>
          <p className="text-xs text-gray-500 mt-1">{error || "Aucun article ne correspond à cette référence."}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold"
          >
            <ArrowLeft className="size-4" />
            <span>Retourner au catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Retour au catalogue"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-950">
              {productData.name}
            </h1>
            <p className="text-xs text-gray-500">
              Référence Produit : <span className="font-mono font-medium text-gray-700">{productData.sku}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/products/edit/${encodeURIComponent(productData.id)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#235850] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Edit3 className="size-3.5" />
            <span>Modifier la fiche</span>
          </Link>
        </div>
      </div>

      {/* Main product technical information */}
      <BasicInfo product={productData} />

      {/* Media Studio Gallery */}
      <ProductMedia images={productData.gallery} />

      {/* Color & Size Variant Matrix */}
      <ProductVariantTable variants={productData.variants} />
    </div>
  );
}
