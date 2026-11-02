import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Layers,
  Sparkles,
  Shirt,
  Scissors,
  CheckCircle2,
  TrendingUp,
  Percent,
  Warehouse,
  ShieldCheck,
} from "lucide-react";

export interface ProductDetailProps {
  product?: {
    id?: string;
    name?: string;
    category?: string;
    price?: number;
    comparePrice?: number;
    sku?: string;
    material?: string;
    fit?: string;
    care?: string;
    origin?: string;
    status?: "Publié" | "Brouillon" | "Archivé";
    description?: string;
    image?: string;
    totalStock?: number;
    season?: string;
  };
}

const DEFAULT_PRODUCT = {
  id: "DIV-H-101",
  name: "Costume 2 Pièces Laine Vierge Italienne",
  category: "Homme — Prêt-à-Porter Luxe",
  price: 289.0,
  comparePrice: 349.0,
  sku: "DIV-H-101-PRM",
  material: "100% Laine Vierge Super 130s Vitale Barberis Canonico",
  fit: "Coupe Ajustée Moderne (Slim Fit Structuré)",
  care: "Nettoyage à sec professionnel uniquement, repassage doux à la vapeur",
  origin: "Confectionné en Italie (Atelier de Biella)",
  status: "Publié" as const,
  description:
    "Costume deux pièces haut de gamme taillé dans une laine vierge d'exception au tombé impeccable. Veste deux boutons semi-entoilée avec revers à cran tailleur et fentes d'aisance latérales. Pantalon ajusté avec ceinture à passants et poches passepoilées. Une pièce maîtresse alliant élégance intemporelle et confort absolu pour vos rendez-vous d'affaires et grandes réceptions.",
  image: "/images/products/fashion-1.jpg",
  totalStock: 87,
  season: "Collection Printemps / Été 2026",
};

export default function BasicInfo({ product = DEFAULT_PRODUCT }: ProductDetailProps) {
  const current = { ...DEFAULT_PRODUCT, ...product };
  const marginPercent = Math.round(((current.price - 115) / current.price) * 100);

  return (
    <div className="border rounded-2xl border-gray-200 bg-white shadow-xs overflow-hidden">
      {/* Header section with status */}
      <div className="py-4 px-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <Shirt className="size-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Fiche Technique Textile & Informations Produit
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
            SKU : {current.sku}
          </span>
          <Badge variant="success" className="px-3 py-0.5 text-xs font-bold">
            <CheckCircle2 className="size-3 mr-1 inline" />
            {current.status}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Product Hero Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white shadow-2xs">
            <Image
              src={current.image || "/images/products/fashion-1.jpg"}
              alt={current.name}
              fill
              sizes="96px"
              priority
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>{current.category}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-normal">{current.season}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-950 truncate">
              {current.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Warehouse className="size-3.5 text-gray-400" />
                Stock Global : <strong className="text-gray-900">{current.totalStock} pièces</strong>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Garantie Qualité DivinExpress
              </span>
            </div>
          </div>

          {/* Pricing highlight */}
          <div className="flex md:flex-col items-baseline md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div className="text-xs text-gray-500 font-medium">Prix Public TTC</div>
            <div className="text-2xl font-extrabold text-gray-950">
              {current.price.toFixed(2).replace(".", ",")} €
            </div>
            {current.comparePrice && (
              <div className="text-xs text-gray-400 line-through">
                {current.comparePrice.toFixed(2).replace(".", ",")} €
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Description Détaillée & Coupe
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
            {current.description}
          </p>
        </div>

        {/* Fashion Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Layers className="size-3.5 text-indigo-600" />
              <span>Matière / Tissu</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-snug">
              {current.material}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Scissors className="size-3.5 text-amber-600" />
              <span>Coupe & Silhouette</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-snug">
              {current.fit}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Tag className="size-3.5 text-emerald-600" />
              <span>Origine & Confection</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-snug">
              {current.origin}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Percent className="size-3.5 text-rose-600" />
              <span>Marge Commerciale</span>
            </div>
            <p className="text-xs font-semibold text-emerald-700 leading-snug flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {marginPercent}% (Rentabilité Élevée)
            </p>
          </div>
        </div>

        {/* Care instructions */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
          <Sparkles className="size-4 text-amber-700 shrink-0" />
          <span>
            <strong>Recommandations d'entretien :</strong> {current.care}
          </span>
        </div>
      </div>
    </div>
  );
}
