"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import {
  Package,
  Layers,
  MapPin,
  Calendar,
  Warehouse,
  Pencil,
  PackagePlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";

interface StockProductDetailProps {
  id?: string;
}

const DEFAULT_PRODUCTS: Record<string, any> = {
  "DIV-H-101": {
    id: "DIV-H-101",
    code: "DIV-H-101",
    name: "Costume 2 Pièces Laine Vierge",
    category: "Homme — Prêt-à-Porter Luxe",
    price: "289,00 €",
    priceNum: 289.0,
    stock: 45,
    origin: "100% Laine Vierge Italienne",
    format: "Tailles 46 à 54",
    image: "/images/products/fashion-1.jpg",
    status: "Publié",
    warehouse: "Entrepôt Central Shammah (Paris)",
    lastUpdated: "Aujourd'hui",
  },
  "DIV-F-201": {
    id: "DIV-F-201",
    code: "DIV-F-201",
    name: "Robe Longue Fluide Soie Sauvage",
    category: "Femme — Robes & Cérémonie",
    price: "195,00 €",
    priceNum: 195.0,
    stock: 60,
    origin: "100% Soie Naturelle",
    format: "Tailles XS à L",
    image: "/images/products/fashion-2.jpg",
    status: "Publié",
    warehouse: "Entrepôt Central Shammah (Paris)",
    lastUpdated: "Hier",
  },
  "DIV-U-301": {
    id: "DIV-U-301",
    code: "DIV-U-301",
    name: "Hoodie Oversize Signature Coton Bio",
    category: "Unisexe — Streetwear Premium",
    price: "89,00 €",
    priceNum: 89.0,
    stock: 120,
    origin: "Coton Bio 450 g/m²",
    format: "Tailles XS à XXL",
    image: "/images/products/fashion-3.jpg",
    status: "Publié",
    warehouse: "Hub Logistique Shammah (Île-de-France)",
    lastUpdated: "05 Sept. 2026",
  },
  "DIV-H-102": {
    id: "DIV-H-102",
    code: "DIV-H-102",
    name: "Chemise Slim Fit Lin Naturel",
    category: "Homme — Chemises",
    price: "79,00 €",
    priceNum: 79.0,
    stock: 85,
    origin: "100% Lin Français",
    format: "Tailles S à XL",
    image: "/images/products/fashion-4.jpg",
    status: "Publié",
    warehouse: "Entrepôt Central Shammah (Paris)",
    lastUpdated: "02 Sept. 2026",
  },
  "DIV-F-202": {
    id: "DIV-F-202",
    code: "DIV-F-202",
    name: "Trench Coat Ceinturé Imperméable",
    category: "Femme — Manteaux & Vestes",
    price: "245,00 €",
    priceNum: 245.0,
    stock: 32,
    origin: "Gabardine Coton Déperlant",
    format: "Tailles S à L",
    image: "/images/products/fashion-5.jpg",
    status: "Publié",
    warehouse: "Entrepôt Central Shammah (Paris)",
    lastUpdated: "01 Sept. 2026",
  },
};

export default function StockProductDetail({ id = "SUL-301" }: StockProductDetailProps) {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const decodedId = decodeURIComponent(id).toUpperCase();
  const fallback = DEFAULT_PRODUCTS[decodedId] || DEFAULT_PRODUCTS["SUL-301"];
  const initialProduct = demoMode ? fallback : {
    ...fallback,
    id: "",
    code: "",
    name: "",
    category: "",
    price: "0,00 €",
    priceNum: 0,
    stock: 0,
    origin: "",
    format: "",
    image: "",
    status: "",
    warehouse: "",
    lastUpdated: "",
  };

  const [product, setProduct] = useState(initialProduct);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState<number>(50);
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const p = json.data;
            if (!Number.isFinite(Number(p.basePrice)) || !Number.isFinite(Number(p.stockQuantity))) {
              throw new Error("Données de stock invalides.");
            }
            setProduct({
              id: p.code || p.id,
              code: p.code || p.id,
              name: p.title || p.name,
              category: p.category?.name || p.category || "Prêt-à-Porter Homme",
              price: `${Number(p.basePrice || 49.90).toFixed(2).replace(".", ",")} €`,
              priceNum: Number(p.basePrice) || 49.90,
              stock: Number(p.stockQuantity) ?? 100,
              origin: p.origin || "France / Portugal",
              format: p.formats?.[0]?.label || "Taille M / Standard",
              image: p.imageRecto || p.image || "/images/products/fashion/product-1.jpg",
              status: p.isAvailable !== false ? "Publié" : "Brouillon",
              warehouse: "Entrepôt Central Shammah (Paris IDF)",
              lastUpdated: p.updatedAt
                ? new Date(p.updatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Aujourd'hui",
            });
          }
        }
      } catch (error) {
        console.error("Chargement du stock impossible:", error);
      }
    }
    loadData();
  }, [id]);

  const isLow = product.stock > 0 && product.stock <= 20;
  const isOut = product.stock === 0;

  // Stock percentage indicator (max cap 300 for visual bar)
  const maxCapacity = 300;
  const stockPercentage = Math.min(100, Math.round((product.stock / maxCapacity) * 100));

  const handleSaveRestock = async () => {
    const newStock = Math.max(0, product.stock + Number(addedQuantity));
    setIsSubmittingRestock(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.code || product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Le stock n'a pas pu être enregistré.");
      }
      setProduct((prev: any) => ({ ...prev, stock: newStock }));
      toast.success(
        `Stock mis à jour pour "${product.name}" : ${newStock} unités désormais en réserve.`
      );
      setRestockModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Le stock n'a pas pu être enregistré.");
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  return (
    <div className="w-full space-y-6 p-5 sm:p-8 bg-white rounded-3xl border border-gray-200 shadow-2xs max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pb-4 border-b border-gray-100">
        <PageHeader
          title={`Fiche de Stock : ${product.code}`}
          backHref="/products/stocks"
        />
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setRestockModalOpen(true)}
            disabled={!product.id}
            size="xs"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
          >
            <PackagePlus className="size-3.5" />
            <span>Réapprovisionner</span>
          </Button>

          <Button
            href={`/products/edit/${encodeURIComponent(product.code || product.id)}`}
            variant="outline"
            size="xs"
            className="rounded-full flex items-center gap-1.5 text-xs font-bold border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
          >
            <Pencil className="size-3.5" />
            <span>Modifier la fiche</span>
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="border border-gray-200/90 rounded-2xl p-5 sm:p-6 bg-gray-50/30 space-y-6">
        {/* Product Identity Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-5 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="relative size-20 sm:size-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 p-1.5">
              <Image
                src={product.image}
                alt={product.name}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-600 px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                  {product.code}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {product.format}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-950">
                {product.name}
              </h2>
              <p className="text-base font-extrabold text-emerald-700">
                {product.price} <span className="text-xs font-semibold text-gray-500">TTC</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start">
            <Badge variant={product.status === "Publié" ? "success" : "warning"}>
              {product.status}
            </Badge>
          </div>
        </div>

        {/* Stock Level Gauge & Bar */}
        <div className="border border-gray-200/90 rounded-2xl p-5 sm:p-6 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Niveau d'Inventaire Actuel
              </h3>
              <p className="text-xs text-gray-500">
                Seuil de réapprovisionnement recommandé : 20 unités
              </p>
            </div>

            {isOut ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                <XCircle className="size-4" />
                <span>Rupture de Stock</span>
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="size-4" />
                <span>Stock Faible (Alerte)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="size-4" />
                <span>Stock Optimal</span>
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/70">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOut
                    ? "bg-rose-500"
                    : isLow
                    ? "bg-amber-500"
                    : "bg-emerald-600"
                }`}
                style={{ width: `${Math.max(4, stockPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
              <span>0 unité</span>
              <span className="text-amber-700 font-bold">Seuil alerte: 20 pcs</span>
              <span className="text-emerald-800 font-extrabold">{product.stock} unités disponibles</span>
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Catégorie</p>
              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                {product.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="size-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Terroir d'Origine</p>
              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                {product.origin}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Warehouse className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Atelier de Stockage</p>
              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                {product.warehouse}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="size-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Dernière MAJ</p>
              <p className="text-xs font-bold text-gray-900">
                {product.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Réapprovisionnement Rapide */}
      {restockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PackagePlus className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Réapprovisionnement
                  </h3>
                  <p className="text-xs text-gray-500">{product.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Stock actuel</span>
                <span className="text-lg font-extrabold text-gray-950">
                  {product.stock} pièces
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Nouveau total estimé</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {Math.max(0, product.stock + Number(addedQuantity || 0))} pièces
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Unités à ajouter
              </label>
              <div className="flex items-center gap-2 mb-3">
                {[+25, +50, +100, +250].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setAddedQuantity(inc)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      addedQuantity === inc
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    +{inc}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={addedQuantity}
                onChange={(e) => setAddedQuantity(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <Button
                type="button"
                onClick={handleSaveRestock}
                disabled={isSubmittingRestock}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-full text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingRestock ? "Mise à jour..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
