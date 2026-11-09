"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import {
  ArrowLeft,
  UploadCloud,
  Euro,
  Image as ImageIcon,
  Shirt,
  Scissors,
  Palette,
  Layers,
  Trash2,
} from "lucide-react";
import {
  ColorVariant,
  ProductVariantItem,
  PRESET_FASHION_COLORS,
} from "@/lib/fashion-colors";
import ColorPalettePicker from "./color-palette-picker";
import ProductVariantsMatrix from "./product-variants-matrix";

const CATEGORIES = [
  "T-shirts",
  "Sweats à capuche",
  "Casquettes",
  "Accessoires",
];

const MATERIALS = [
  "100% Coton Biologique",
  "Molleton Brossé 350 g/m²",
  "Coton Sergé Brodé",
  "Céramique Haute Qualité",
  "Coton & Polyester Recyclé",
  "100% Lin Naturel",
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Taille Unique"];

interface EditProductFormProps {
  productId?: string;
  initialData?: {
    id?: string;
    title?: string;
    subtitle?: string;
    code?: string;
    category?: string;
    material?: string;
    description?: string;
    careInstructions?: string;
    basePrice?: number;
    baseOldPrice?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
    imageRecto?: string;
    imageVerso?: string;
    sizes?: string[];
    colors?: ColorVariant[];
    variants?: ProductVariantItem[];
  };
}

export default function EditProductForm({ productId, initialData }: EditProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(productId));

  // Form State
  const [name, setName] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [sku, setSku] = useState(initialData?.code || "");
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [material, setMaterial] = useState(initialData?.material || MATERIALS[0]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialData?.sizes || ["S", "M", "L", "XL", "XXL"]
  );

  // Colors State
  const [selectedColors, setSelectedColors] = useState<ColorVariant[]>(
    initialData?.colors && initialData.colors.length > 0
      ? initialData.colors
      : [PRESET_FASHION_COLORS[0], PRESET_FASHION_COLORS[1]]
  );
  const [customColors, setCustomColors] = useState<ColorVariant[]>([]);

  // Variants Matrix State
  const [variants, setVariants] = useState<ProductVariantItem[]>(initialData?.variants || []);

  const [description, setDescription] = useState(initialData?.description || "");
  const [careInstructions, setCareInstructions] = useState(
    initialData?.careInstructions || "Lavage à 30°C sur l'envers. Ne pas repasser sur l'imprimé."
  );
  const [price, setPrice] = useState(initialData?.basePrice?.toString() || "29.00");
  const [comparePrice, setComparePrice] = useState(initialData?.baseOldPrice?.toString() || "");
  const [stock, setStock] = useState(initialData?.stockQuantity?.toString() || "0");
  const [isPublished, setIsPublished] = useState(initialData?.isAvailable !== false);

  const [rectoImage, setRectoImage] = useState<string | null>(initialData?.imageRecto || null);
  const [versoImage, setVersoImage] = useState<string | null>(initialData?.imageVerso || null);
  const [uploadingSide, setUploadingSide] = useState<"recto" | "verso" | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    fetch(`/api/admin/products/${encodeURIComponent(productId)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const p = json.data;
          setName(p.title || p.name || "");
          setSubtitle(p.subtitle || "");
          setSku(p.code || "");
          setCategory(p.category?.name || p.category || CATEGORIES[0]);
          setMaterial(p.material || MATERIALS[0]);
          setDescription(p.description || "");
          setPrice(Number(p.basePrice || 0).toString());
          setComparePrice(p.baseOldPrice ? Number(p.baseOldPrice).toString() : "");
          setStock(Number(p.stockQuantity || 0).toString());
          setIsPublished(p.isAvailable !== false);
          setRectoImage(p.imageRecto || null);
          setVersoImage(p.imageVerso || null);

          if (Array.isArray(p.variants) && p.variants.length > 0) {
            const rawSizes = Array.from(
              new Set(p.variants.map((v: any) => v.size).filter(Boolean))
            );
            if (rawSizes.length > 0) setSelectedSizes(rawSizes as string[]);

            const colorsMap = new Map<string, ColorVariant>();
            p.variants.forEach((v: any) => {
              if (v.color && !colorsMap.has(v.color)) {
                colorsMap.set(v.color, {
                  id: v.color.toLowerCase().replace(/\s+/g, "-"),
                  name: v.color,
                  hex: v.colorHex || "#111827",
                });
              }
            });
            if (colorsMap.size > 0) {
              setSelectedColors(Array.from(colorsMap.values()));
            }

            setVariants(
              p.variants.map((v: any) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || "#111827",
                sku: `${p.code}-${(v.color || "STD").slice(0, 3).toUpperCase()}-${v.size}`,
                stock: Number(v.stock) || 0,
                price: Number(v.price) || Number(p.basePrice) || 0,
                oldPrice: v.oldPrice ? Number(v.oldPrice) : undefined,
                inStock: (Number(v.stock) || 0) > 0,
              }))
            );
          }
        }
      })
      .catch(() => {
        toast.error("Impossible de charger les données du produit.");
      })
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  // Synchronize variants when sizes, colors or base parameters change
  useEffect(() => {
    const numPrice = parseFloat(price) || 0;
    const cleanSku = sku.trim() || "SHM-PROD";

    setVariants((prevVariants) => {
      const prevMap = new Map<string, ProductVariantItem>();
      prevVariants.forEach((v) => {
        prevMap.set(`${v.color}-${v.size}`, v);
      });

      const newVariantsList: ProductVariantItem[] = [];

      selectedColors.forEach((c) => {
        selectedSizes.forEach((s) => {
          const key = `${c.name}-${s}`;
          const existing = prevMap.get(key);
          const colorCode = c.name.slice(0, 3).toUpperCase();

          if (existing) {
            newVariantsList.push({
              ...existing,
              colorHex: c.hex,
              price: existing.price || numPrice,
            });
          } else {
            newVariantsList.push({
              size: s,
              color: c.name,
              colorHex: c.hex,
              sku: `${cleanSku}-${colorCode}-${s}`,
              stock: 15,
              price: numPrice,
              inStock: true,
            });
          }
        });
      });

      return newVariantsList;
    });
  }, [selectedColors, selectedSizes, sku, price]);

  const totalStockCount =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : parseInt(stock, 10) || 0;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "recto" | "verso"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSide(side);
      const form = new FormData();
      form.set("file", file);

      try {
        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: form,
        });
        const json = await response.json();
        if (!response.ok || !json.data?.url) throw new Error(json.error);

        if (side === "recto") setRectoImage(json.data.url);
        else setVersoImage(json.data.url);

        toast.success(
          `Photo ${side === "recto" ? "principale (Recto)" : "secondaire (Verso)"} enregistrée.`
        );
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (side === "recto") setRectoImage(reader.result as string);
          else setVersoImage(reader.result as string);
          toast.success("Visuel chargé avec succès.");
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingSide(null);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: name.trim(),
        name: name.trim(),
        subtitle: subtitle.trim(),
        code: sku.trim(),
        sku: sku.trim(),
        category,
        material,
        description: description.trim(),
        careInstructions: careInstructions.trim(),
        basePrice: parseFloat(price) || 0,
        price: parseFloat(price) || 0,
        baseOldPrice: comparePrice ? parseFloat(comparePrice) : null,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stockQuantity: totalStockCount,
        stock: totalStockCount,
        isAvailable: isPublished,
        isPublished,
        imageRecto: rectoImage || "/images/cls-categories/pod/t-shirts-jesus.jpg",
        imageVerso: versoImage || "",
        sizes: selectedSizes,
        colors: selectedColors,
        variants: variants,
      };

      const targetId = productId || initialData?.id || sku;
      const res = await fetch(`/api/admin/products/${encodeURIComponent(targetId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(resJson?.error || "Erreur lors de la modification du produit.");
      }

      toast.success("Modifications et déclinaisons enregistrées avec succès !");
      router.push("/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Échec de l'enregistrement des modifications.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="space-y-6 animate-pulse p-6 bg-white rounded-2xl border border-gray-100">
        <div className="h-10 w-48 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-50 rounded-2xl" />
        <div className="h-48 bg-slate-50 rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-20">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="size-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Modifier l&apos;article : {name}</h1>
            <p className="text-xs text-gray-500">Mettez à jour les visuels, catégories, tailles, prix ou stocks.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Annuler
          </Link>
          <Button
            type="submit"
            disabled={saving || uploadingSide !== null}
            className="btn btn-primary bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Info, Colors, Sizes & Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Shirt className="size-4 text-[#2b6b61]" />
              <span>Informations générales</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nom de l&apos;article / modèle *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Sous-titre / accroche
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#2b6b61]"
                >
                  {Array.from(new Set([...CATEGORIES, category].filter(Boolean))).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Référence Article (SKU)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-gray-200 bg-gray-50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Matière &amp; confection
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#2b6b61]"
              >
                {Array.from(new Set([...MATERIALS, material].filter(Boolean))).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description de la pièce
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>
          </div>

          {/* Colors & Custom Color Choice */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Palette className="size-4 text-[#2b6b61]" />
              <span>Choix des couleurs disponibles</span>
            </h2>

            <ColorPalettePicker
              selectedColors={selectedColors}
              onChange={setSelectedColors}
              customColors={customColors}
              onCustomColorsChange={setCustomColors}
            />
          </div>

          {/* Sizes Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Scissors className="size-4 text-[#2b6b61]" />
              <span>Tailles disponibles</span>
            </h2>

            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#2b6b61] text-white border-[#2b6b61] shadow-2xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Conseils d&apos;entretien
              </label>
              <textarea
                rows={2}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>
          </div>

          {/* Variants Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="size-4 text-[#2b6b61]" />
              <span>Gestion des déclinaisons (Couleur × Taille)</span>
            </h2>

            <ProductVariantsMatrix
              variants={variants}
              onVariantsChange={setVariants}
              basePrice={parseFloat(price) || 0}
            />
          </div>
        </div>

        {/* Right Column: Pricing & Visibility */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Euro className="size-4 text-[#2b6b61]" />
              <span>Tarification &amp; inventaire</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Prix de vente TTC (€) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-bold text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Prix avant réduction (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full h-11 px-3.5 text-sm text-gray-600 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2b6b61]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Stock total combiné
              </label>
              <div className="w-full h-11 px-3.5 flex items-center justify-between text-sm font-bold rounded-xl border border-gray-200 bg-gray-50 text-gray-800">
                <span>{totalStockCount} pièces</span>
                <span className="text-[11px] font-normal text-gray-500">Calculé via matrice</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Article publié</span>
                <span className="text-[11px] text-gray-400">Visible sur la boutique en ligne</span>
              </div>
              <Switch checked={isPublished} onChange={setIsPublished} />
            </div>
          </div>

          {/* Visuals / Images */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="size-4 text-[#2b6b61]" />
              <span>Visuels du produit</span>
            </h2>

            {/* Front Photo */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Photo principale (Recto)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#2b6b61] transition-colors space-y-2">
                {rectoImage && (
                  <div className="relative size-32 mx-auto rounded-lg overflow-hidden bg-gray-50 border border-gray-200 p-1">
                    <img src={rectoImage} alt="Face" className="w-full h-full object-contain" />
                  </div>
                )}
                <label className="cursor-pointer block">
                  <UploadCloud className="size-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-[#2b6b61] font-bold block">
                    {uploadingSide === "recto"
                      ? "Téléversement..."
                      : rectoImage
                      ? "Remplacer le visuel principal"
                      : "Téléverser visuel principal"}
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP jusqu&apos;à 10 Mo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "recto")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Back / Modeled Photo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Photo secondaire / Dos (Verso)
                </label>
                {versoImage && (
                  <button
                    type="button"
                    onClick={() => setVersoImage(null)}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    <span>Retirer</span>
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#2b6b61] transition-colors space-y-2">
                {versoImage && (
                  <div className="relative size-32 mx-auto rounded-lg overflow-hidden bg-gray-50 border border-gray-200 p-1">
                    <img src={versoImage} alt="Dos" className="w-full h-full object-contain" />
                  </div>
                )}
                <label className="cursor-pointer block">
                  <UploadCloud className="size-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-[#2b6b61] font-bold block">
                    {uploadingSide === "verso"
                      ? "Téléversement..."
                      : versoImage
                      ? "Remplacer le visuel secondaire"
                      : "Téléverser visuel secondaire"}
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP jusqu&apos;à 10 Mo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "verso")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
