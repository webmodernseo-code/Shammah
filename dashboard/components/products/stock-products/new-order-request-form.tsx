"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import {
  ClipboardList,
  Send,
  AlertCircle,
  Clock,
  Factory,
  CheckCircle2,
} from "lucide-react";

interface ProductOption {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  image: string;
  format: string;
}

const DEFAULT_PRODUCTS: ProductOption[] = [
  {
    id: "DIV-H-101",
    code: "DIV-H-101",
    name: "Costume 2 Pièces Laine Vierge",
    category: "Homme — Prêt-à-Porter Luxe",
    stock: 45,
    image: "/images/products/fashion-1.jpg",
    format: "Tailles 46 à 54",
  },
  {
    id: "DIV-F-201",
    code: "DIV-F-201",
    name: "Robe Longue Fluide Soie Sauvage",
    category: "Femme — Robes & Cérémonie",
    stock: 60,
    image: "/images/products/fashion-2.jpg",
    format: "Tailles XS à L",
  },
  {
    id: "DIV-U-301",
    code: "DIV-U-301",
    name: "Hoodie Oversize Signature Coton Bio",
    category: "Unisexe — Streetwear Premium",
    stock: 120,
    image: "/images/products/fashion-3.jpg",
    format: "Tailles XS à XXL",
  },
  {
    id: "DIV-H-102",
    code: "DIV-H-102",
    name: "Chemise Slim Fit Lin Naturel",
    category: "Homme — Chemises",
    stock: 85,
    image: "/images/products/fashion-4.jpg",
    format: "Tailles S à XL",
  },
  {
    id: "DIV-F-202",
    code: "DIV-F-202",
    name: "Trench Coat Ceinturé Imperméable",
    category: "Femme — Manteaux & Vestes",
    stock: 32,
    image: "/images/products/fashion-5.jpg",
    format: "Tailles S à L",
  },
];

export default function NewOrderRequestForm() {
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [products, setProducts] = useState<ProductOption[]>(demoMode ? DEFAULT_PRODUCTS : []);
  const [selectedProductCode, setSelectedProductCode] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(200);
  const [priority, setPriority] = useState<string>("Normale");
  const [orderType, setOrderType] = useState<string>("Réassort Régulier");
  const [atelier, setAtelier] = useState<string>("Atelier Confection & Filature — Porto / Lyon");
  const [targetDate, setTargetDate] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const dbProducts: ProductOption[] = json.data.map((p: any) => ({
              id: p.code || p.id,
              code: p.code || p.id,
              name: p.title || p.name,
              category: p.category?.name || p.category || "Prêt-à-Porter Homme",
              stock: Number(p.stockQuantity) ?? 100,
              image: p.imageRecto || p.image || "/images/products/fashion/product-1.jpg",
              format: p.formats?.[0]?.label || "Taille M / Standard",
            }));

            const dbCodes = new Set(dbProducts.map((p) => p.code.toUpperCase()));
            const remaining = demoMode ? DEFAULT_PRODUCTS.filter(
              (dp) => !dbCodes.has(dp.code.toUpperCase())
            ) : [];
            const merged = [...dbProducts, ...remaining];
            setProducts(merged);
          }
        }
      } catch {
        if (!demoMode) setProducts([]);
      }
    }
    loadProducts();
  }, []);

  const currentProduct =
    products.find((p) => p.code === selectedProductCode) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      toast.error("Aucun produit réel n'est disponible.");
      return;
    }
    toast.error("La demande de réapprovisionnement n'est pas encore reliée à un module de production.");
    return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Ordre de fabrication envoyé avec succès pour ${quantity} unités de "${currentProduct?.name}" !`
      );
      router.push("/products/stocks");
    }, 400);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 border border-gray-200 shadow-2xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-4">
        <PageHeader
          title="Demande de Réapprovisionnement & Production"
          backHref="/products/stocks"
        />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
          <Factory className="size-3.5" />
          <span>Ateliers de Confection & Filature DivinExpress</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Produit concerné */}
        <div className="border border-gray-200/90 rounded-2xl p-5 sm:p-6 bg-gray-50/40 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="size-4 text-emerald-600" />
            1. Sélection de l'Article & État Actuel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Référence Article à fabriquer *
              </label>
              <select
                value={selectedProductCode}
                onChange={(e) => setSelectedProductCode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                {products.map((prod) => (
                  <option key={prod.code} value={prod.code}>
                    {prod.code} - {prod.name} ({prod.format})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Conditionnement standard
              </label>
              <input
                type="text"
                disabled
                value={`${currentProduct?.category} • ${currentProduct?.format}`}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-100/80 text-gray-600 font-medium"
              />
            </div>
          </div>

          {/* Preview info */}
          {currentProduct && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-white border border-gray-200/80 gap-4 shadow-2xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative size-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 p-1">
                  <Image
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                    {currentProduct.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    SKU: {currentProduct.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Stock actuel</span>
                  <span className="text-base font-extrabold text-gray-900">
                    {currentProduct.stock} pièces
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700 font-bold block">Volume demandé</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    +{quantity} pièces
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Détails de l'ordre de réapprovisionnement */}
        <div className="border border-gray-200/90 rounded-2xl p-5 sm:p-6 bg-white space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Factory className="size-4 text-emerald-600" />
            2. Paramètres de Production & Livraison
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Quantité demandée */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Quantité de pièces à fabriquer *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Niveau d'Urgence / Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="Normale">Priorité Normale (délai standard 7-10j)</option>
                <option value="Haute">Priorité Haute (délai 3-5j)</option>
                <option value="Urgente">Urgente / Rupture imminente (48-72h)</option>
              </select>
            </div>

            {/* Type de commande */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Type d'Ordre
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="Réassort Régulier">Réassort Régulier</option>
                <option value="Préparation Pic Saisonnier">Préparation Pic Saisonnier / Soldes</option>
                <option value="Lancement Nouvelle Collection">Lancement Nouvelle Collection Capsule</option>
              </select>
            </div>

            {/* Atelier / Site de production */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Atelier Référent
              </label>
              <select
                value={atelier}
                onChange={(e) => setAtelier(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="Atelier Confection & Filature — Porto / Lyon">
                  Atelier Confection & Filature — Porto / Lyon
                </option>
                <option value="Hub Logistique DivinExpress (Île-de-France)">
                  Hub Logistique DivinExpress (Île-de-France)
                </option>
              </select>
            </div>

            {/* Instructions */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Instructions particulières pour l'atelier
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Contrôle qualité des coutures et ourlets, pose des étiquettes de composition et code-barres..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/products/stocks")}
            className="w-full sm:w-auto rounded-full text-xs font-bold border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
          >
            Annuler
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-full text-xs cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Send className="size-3.5" />
            <span>
              {isSubmitting
                ? "Transmission..."
                : `Transmettre l'ordre de réapprovisionnement`}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
