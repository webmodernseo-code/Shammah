"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Send,
  Image as ImageIcon,
  Package,
  Settings,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
  Plus,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  Unlink,
  Eye,
  Database,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import Switch from "@/components/ui/switch";

// Option Type Definition
export type OptionType = "Taille" | "Pointure" | "Couleur" | "Dimension" | "Matière" | "Personnalisée";

export interface ProductOption {
  id: string;
  type: OptionType;
  customName?: string;
  values: string[];
}

export interface GeneratedVariant {
  id: string;
  name: string;
  size: string;
  color: string;
  colorHex?: string;
  sku: string;
  price: string;
  stock: string;
  image?: string;
  selected: boolean;
}

export interface ProductImageItem {
  id: string;
  url: string;
  isMain: boolean;
  name?: string;
}

// Preset Values for Fast Selection
const PRESET_OPTIONS: Record<OptionType, string[]> = {
  Taille: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Pointure: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  Couleur: ["Noir", "Blanc", "Beige", "Marine", "Marron", "Gris", "Terracotta", "Doré", "Argenté"],
  Dimension: ["20 × 30 cm", "30 × 40 cm", "40 × 60 cm", "50 × 70 cm", "Unique"],
  Matière: ["Coton Biologique", "Lin Naturel", "Soie Italienne", "Laine Vierge", "Cuir Pleine Fleur", "Cachemire"],
  Personnalisée: [],
};

const COLOR_SWATCHES: Record<string, string> = {
  Noir: "#111827",
  Blanc: "#ffffff",
  Beige: "#d4b996",
  Marine: "#1e3a8a",
  Marron: "#78350f",
  Gris: "#64748b",
  Terracotta: "#c2410c",
  Doré: "#d97706",
  Argenté: "#94a3b8",
};

const DEFAULT_CATEGORIES = [
  "Femme",
  "Homme",
  "Enfant",
  "Accessoires",
  "Robes & Soirées",
  "Chaussures",
  "Maroquinerie & Sacs",
];

const INITIAL_IMAGES: ProductImageItem[] = [
  { id: "img-1", url: "/images/products/fashion/product-1.jpg", isMain: true, name: "Visuel face principale" },
  { id: "img-2", url: "/images/products/fashion/women-1.jpg", isMain: false, name: "Silhouette portée" },
  { id: "img-3", url: "/images/products/fashion/product-2.jpg", isMain: false, name: "Détail matière & drapé" },
  { id: "img-4", url: "/images/products/fashion/women-black-1.jpg", isMain: false, name: "Vue de dos" },
];

export default function AddProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Saving State
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Dynamic Categories from API
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const names = json.data.map((c: any) => c.name);
          setCategoriesList(Array.from(new Set([...names, ...DEFAULT_CATEGORIES])));
        }
      } catch {
        // Fallback to default categories
      }
    }
    loadCategories();
  }, []);

  // 1. General Information State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("DivinExpress");
  const [sku, setSku] = useState(`DIV-PROD-${Math.floor(100 + Math.random() * 900)}`);
  const [price, setPrice] = useState("89.00");
  const [comparePrice, setComparePrice] = useState("119.00");
  const [vatRate, setVatRate] = useState("20%");
  const [description, setDescription] = useState("");

  // Simple product stock (when hasVariants is false)
  const [simpleStock, setSimpleStock] = useState("15");

  // Rich Text State
  const [textFormat, setTextFormat] = useState("Paragraphe");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // 2. Images State
  const [images, setImages] = useState<ProductImageItem[]>(INITIAL_IMAGES);

  // 3. Variants State
  const [hasVariants, setHasVariants] = useState(true);

  // Generic Product Options list
  const [options, setOptions] = useState<ProductOption[]>([
    { id: "opt-1", type: "Taille", values: ["XS", "S", "M", "L", "XL", "XXL"] },
    { id: "opt-2", type: "Couleur", values: ["Noir", "Blanc", "Beige"] },
  ]);

  // Input state for adding new value to an option
  const [activeAddOptionId, setActiveAddOptionId] = useState<string | null>(null);
  const [newValueInput, setNewValueInput] = useState("");

  // Generated Variants Matrix
  const [variantsList, setVariantsList] = useState<GeneratedVariant[]>([
    { id: "v-1", name: "Noir · XS", size: "XS", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-XS", price: "89.00", stock: "12", selected: true },
    { id: "v-2", name: "Noir · S", size: "S", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-S", price: "89.00", stock: "8", selected: true },
    { id: "v-3", name: "Noir · M", size: "M", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-M", price: "89.00", stock: "10", selected: true },
    { id: "v-4", name: "Noir · L", size: "L", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-L", price: "89.00", stock: "6", selected: true },
    { id: "v-5", name: "Noir · XL", size: "XL", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-XL", price: "89.00", stock: "4", selected: true },
    { id: "v-6", name: "Noir · XXL", size: "XXL", color: "Noir", colorHex: "#111827", sku: "DIV-ROBE-NOIR-XXL", price: "89.00", stock: "3", selected: true },
  ]);

  // 4. Publication State
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");
  const [visibility, setVisibility] = useState<"VISIBLE" | "HIDDEN">("VISIBLE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowReviews, setAllowReviews] = useState(true);

  // 5. Options Avancées State
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [weight, setWeight] = useState("0.45");
  const [dimensions, setDimensions] = useState("35 x 25 x 4");
  const [barcode, setBarcode] = useState("3760123456789");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Total calculated stock
  const totalStockCount = useMemo(() => {
    if (!hasVariants) {
      return parseInt(simpleStock, 10) || 0;
    }
    return variantsList
      .filter((v) => v.selected)
      .reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  }, [hasVariants, simpleStock, variantsList]);

  // Add Option to Product (e.g. Pointure, Couleur, Dimension, etc.)
  const handleAddOption = (type: OptionType) => {
    const existing = options.find((o) => o.type === type && type !== "Personnalisée");
    if (existing) {
      toast.info(`L'option « ${type} » est déjà présente.`);
      return;
    }

    const newOption: ProductOption = {
      id: `opt-${Date.now()}`,
      type,
      customName: type === "Personnalisée" ? "Longueur" : undefined,
      values: PRESET_OPTIONS[type] ? [...PRESET_OPTIONS[type].slice(0, 3)] : ["Valeur 1", "Valeur 2"],
    };

    setOptions((prev) => [...prev, newOption]);
    toast.success(`Option « ${type} » ajoutée.`);
  };

  // Remove Option
  const handleRemoveOption = (optionId: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== optionId));
  };

  // Remove Tag Value from Option
  const handleRemoveOptionValue = (optionId: string, valueToRemove: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId
          ? { ...opt, values: opt.values.filter((v) => v !== valueToRemove) }
          : opt
      )
    );
  };

  // Add Tag Value to Option
  const handleAddOptionValue = (optionId: string) => {
    const clean = newValueInput.trim();
    if (!clean) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(clean)) return opt;
          return { ...opt, values: [...opt.values, clean] };
        }
        return opt;
      })
    );
    setNewValueInput("");
    setActiveAddOptionId(null);
  };

  // Generate Matrix Combinations from all active options
  const handleGenerateVariants = () => {
    const validOptions = options.filter((o) => o.values.length > 0);

    if (validOptions.length === 0) {
      toast.error("Veuillez renseigner au moins une valeur dans vos options.");
      return;
    }

    const cleanBaseSku = (sku || "DIV-PROD").trim().toUpperCase();
    const basePrice = price || "89.00";

    // Helper: Cartesian product of option value arrays
    function cartesian(arr: string[][]): string[][] {
      return arr.reduce(
        (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
        [[]] as string[][]
      );
    }

    const optionsValues = validOptions.map((o) => o.values);
    const combinations = cartesian(optionsValues);

    const generated: GeneratedVariant[] = combinations.map((combo, idx) => {
      const comboName = combo.join(" · ");
      const skuSuffix = combo
        .map((val) => val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase())
        .join("-");

      // Check if any value is a known color
      const colorVal = combo.find((c) => COLOR_SWATCHES[c] !== undefined) || combo[1] || combo[0] || "Noir";
      const sizeVal = combo.find((s) => s !== colorVal) || combo[0] || "Unique";
      const colorHex = COLOR_SWATCHES[colorVal] || "#111827";

      return {
        id: `var-gen-${idx}-${Date.now()}`,
        name: comboName,
        size: sizeVal,
        color: colorVal,
        colorHex,
        sku: `${cleanBaseSku}-${skuSuffix}`,
        price: basePrice,
        stock: "10",
        selected: true,
      };
    });

    setVariantsList(generated);
    toast.success(`${generated.length} variante(s) générée(s) avec succès !`);
  };

  // Image Upload handler (with Cloudinary / Local upload API)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedList: ProductImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.set("file", file);

      try {
        const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
        const json = await res.json();
        if (res.ok && json.data?.url) {
          uploadedList.push({
            id: `img-${Date.now()}-${i}`,
            url: json.data.url,
            isMain: images.length === 0 && i === 0,
            name: file.name,
          });
        } else {
          // Fallback preview
          uploadedList.push({
            id: `img-${Date.now()}-${i}`,
            url: URL.createObjectURL(file),
            isMain: images.length === 0 && i === 0,
            name: file.name,
          });
        }
      } catch {
        uploadedList.push({
          id: `img-${Date.now()}-${i}`,
          url: URL.createObjectURL(file),
          isMain: images.length === 0 && i === 0,
          name: file.name,
        });
      }
    }

    setImages((prev) => [...prev, ...uploadedList]);
    setUploadingImage(false);
    toast.success(`${uploadedList.length} photo(s) ajoutée(s) !`);
  };

  // Set Main Image
  const handleSetMainImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
    toast.success("Image principale définie.");
  };

  // Delete Image
  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  // Save product to database
  const handleSave = async (submitStatus: "DRAFT" | "ACTIVE") => {
    if (!name.trim()) {
      toast.error("Veuillez renseigner le nom du produit.");
      return;
    }

    const numPrice = parseFloat(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      toast.error("Veuillez indiquer un prix de vente valide supérieur à 0 €.");
      return;
    }

    if (hasVariants && variantsList.length === 0) {
      toast.error("Vous avez activé les variantes : veuillez cliquer sur « Générer les variantes ».");
      return;
    }

    setSaving(true);
    try {
      const mainImg = images.find((i) => i.isMain)?.url || images[0]?.url || "/images/products/fashion-1.jpg";
      const secondaryImg = images.find((i) => !i.isMain)?.url || null;

      const payloadVariants = hasVariants
        ? variantsList.filter((v) => v.selected).map((v) => ({
            size: v.size || "Unique",
            color: v.color || "Standard",
            colorHex: v.colorHex || "#111827",
            price: parseFloat(v.price) || numPrice,
            stock: parseInt(v.stock, 10) || 0,
          }))
        : [];

      const payload = {
        name: name.trim(),
        title: name.trim(),
        category: category || "Prêt-à-porter",
        brand: brand.trim(),
        sku: sku.trim() || `DIV-PROD-${Date.now()}`,
        code: sku.trim() || `DIV-PROD-${Date.now()}`,
        price: numPrice,
        basePrice: numPrice,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        baseOldPrice: comparePrice ? parseFloat(comparePrice) : null,
        description: description.trim() || name.trim(),
        stock: totalStockCount,
        stockQuantity: totalStockCount,
        isPublished: submitStatus === "ACTIVE",
        image: mainImg,
        imageRecto: mainImg,
        imageVerso: secondaryImg,
        variants: payloadVariants,
        weight: parseFloat(weight) || 0.45,
        barcode: barcode.trim(),
        seoTitle: seoTitle.trim() || name.trim(),
        seoDescription: seoDescription.trim() || description.trim(),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }

      toast.success(
        submitStatus === "ACTIVE"
          ? "Produit publié sur la boutique avec succès !"
          : "Brouillon de produit enregistré avec succès !"
      );
      router.push("/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du produit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="space-y-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#667085] font-medium">
          <Link href="/products" className="hover:text-[#101828] transition-colors">
            Produits
          </Link>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Nouveau produit</span>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <Link
              href="/products"
              className="mt-0.5 size-8.5 rounded-lg bg-white hover:bg-slate-50 border border-[#e4e7ec] flex items-center justify-center text-[#667085] hover:text-[#101828] transition-colors shadow-2xs cursor-pointer"
              title="Retour aux produits"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
                Nouveau produit
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Ajoutez un produit à votre catalogue. Vous pourrez définir ses variantes, ses stocks et le publier sur la boutique.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("DRAFT")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e4e7ec] bg-white hover:bg-slate-50 text-[#101828] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <FileText className="size-4 text-[#667085]" strokeWidth={2} />
              <span>Enregistrer brouillon</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("ACTIVE")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Send className="size-4 text-white" strokeWidth={2} />
              <span>{saving ? "Publication..." : "Publier le produit"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-Column Grid Layout (70% Left / 30% Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (70% width / 8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Informations Générales */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] p-6 shadow-2xs space-y-5">
            {/* Card Header */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center">
                <FileText className="size-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#101828]">Informations générales</h2>
                <p className="text-xs text-[#667085]">Renseignez les informations principales de votre produit.</p>
              </div>
            </div>

            {/* Row 1: Nom du produit & Catégorie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Nom du produit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Robe longue satinée"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Catégorie <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3.5 pr-8 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] appearance-none transition-all cursor-pointer text-[#101828]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Marque & Référence (SKU) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Marque
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex : DivinExpress"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all bg-white"
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <label className="text-xs font-semibold text-[#101828]">
                    Référence (SKU)
                  </label>
                  <span title="Générée automatiquement pour le stock et la logistique. Modifiable si besoin." className="cursor-help">
                    <Info className="size-3.5 text-[#667085]" />
                  </span>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Générée automatiquement"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm font-mono rounded-lg border border-[#e4e7ec] bg-slate-50/70 focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all"
                />
              </div>
            </div>

            {/* Row 3: Prix TTC, Prix avant réduction, Taux TVA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Prix de vente TTC <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-sm font-semibold">
                    €
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="89,00"
                    className="w-full h-10 pl-8 pr-3.5 text-xs sm:text-sm font-semibold text-[#101828] rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Prix avant réduction
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-sm font-semibold">
                    €
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="119,00"
                    className="w-full h-10 pl-8 pr-3.5 text-xs sm:text-sm text-[#667085] rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Taux de TVA
                </label>
                <div className="relative">
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="w-full h-10 px-3.5 pr-8 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] appearance-none transition-all cursor-pointer text-[#101828]"
                  >
                    <option value="20%">20% (Standard)</option>
                    <option value="10%">10% (Intermédiaire)</option>
                    <option value="5.5%">5.5% (Réduit)</option>
                    <option value="0%">0% (Exonéré)</option>
                  </select>
                  <ChevronDown className="size-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Description with Clean Toolbar */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>

              <div className="border border-[#e4e7ec] rounded-lg overflow-hidden focus-within:border-[#2b6b61] focus-within:ring-1 focus-within:ring-[#2b6b61] transition-all">
                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-[#e4e7ec] px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
                  <div className="relative">
                    <select
                      value={textFormat}
                      onChange={(e) => setTextFormat(e.target.value)}
                      className="text-xs font-medium text-[#101828] bg-white border border-[#e4e7ec] rounded-md px-2.5 py-1 pr-6 appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="Paragraphe">Paragraphe</option>
                      <option value="Titre 2">Titre 2</option>
                      <option value="Titre 3">Titre 3</option>
                    </select>
                    <ChevronDown className="size-3 text-[#667085] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="h-4 w-px bg-[#e4e7ec] mx-1" />

                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      isBold ? "bg-slate-200 text-[#101828] font-bold" : "text-[#667085] hover:bg-slate-200/70"
                    }`}
                    title="Gras"
                  >
                    <Bold className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsItalic(!isItalic)}
                    className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      isItalic ? "bg-slate-200 text-[#101828] italic" : "text-[#667085] hover:bg-slate-200/70"
                    }`}
                    title="Italique"
                  >
                    <Italic className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      isUnderline ? "bg-slate-200 text-[#101828] underline" : "text-[#667085] hover:bg-slate-200/70"
                    }`}
                    title="Souligné"
                  >
                    <Underline className="size-3.5" />
                  </button>

                  <div className="h-4 w-px bg-[#e4e7ec] mx-1" />

                  <button
                    type="button"
                    className="size-7 rounded-md flex items-center justify-center text-[#667085] hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="Liste à puces"
                  >
                    <List className="size-3.5" />
                  </button>

                  <div className="h-4 w-px bg-[#e4e7ec] mx-1" />

                  <button
                    type="button"
                    className="size-7 rounded-md flex items-center justify-center text-[#667085] hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="Lien"
                  >
                    <Link2 className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    className="size-7 rounded-md flex items-center justify-center text-[#667085] hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="Supprimer lien"
                  >
                    <Unlink className="size-3.5" />
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={description}
                  maxLength={5000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre produit : matière, coupe, détails, conseils d'entretien..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-white focus:outline-none resize-y min-h-[110px] text-[#101828]"
                />

                <div className="px-3.5 py-1.5 bg-slate-50 border-t border-[#e4e7ec] flex justify-end">
                  <span className="text-[11px] text-[#667085] font-mono">
                    {description.length} / 5000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Photos du produit */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center">
                  <ImageIcon className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#101828]">Photos du produit</h2>
                  <p className="text-xs text-[#667085]">
                    Ajoutez des photos de qualité. La première image sera utilisée comme image principale.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#667085] bg-slate-100 px-2.5 py-1 rounded-full border border-[#e4e7ec] shrink-0">
                {images.length} image(s)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="lg:col-span-5 border-2 border-dashed border-[#e4e7ec] hover:border-[#2b6b61] bg-slate-50/50 hover:bg-[#edf5f4]/40 rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="size-11 rounded-full bg-white shadow-2xs border border-[#e4e7ec] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <UploadCloud className="size-6 text-[#2b6b61]" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold text-[#101828]">
                  Glissez-déposez vos images ici
                </p>
                <p className="text-xs text-[#2b6b61] font-semibold mt-0.5 group-hover:underline">
                  {uploadingImage ? "Téléversement en cours..." : "ou cliquez pour sélectionner des fichiers"}
                </p>
                <p className="text-[11px] text-[#667085] mt-2">
                  PNG, JPG, WEBP • Max 10 Mo par image
                </p>
              </div>

              {/* Gallery Previews */}
              <div className="lg:col-span-7 flex items-center gap-3 overflow-x-auto py-1 custom-scrollbar">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative size-28 shrink-0 rounded-lg overflow-hidden group transition-all ${
                      img.isMain
                        ? "border-2 border-[#2b6b61] shadow-2xs"
                        : "border border-[#e4e7ec] hover:border-slate-400"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.name || "Visuel produit"}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Delete hover button */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
                        }}
                        className="size-6 rounded-md bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Supprimer l'image"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* 3 dots icon */}
                    <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/40 text-white flex items-center justify-center group-hover:hidden">
                      <MoreHorizontal className="size-3" />
                    </div>

                    {/* Main image badge / Set main button */}
                    {img.isMain ? (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-[#2b6b61] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap z-10">
                        Principale
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        className="absolute inset-x-1 bottom-1 bg-black/75 hover:bg-[#2b6b61] text-white text-[10px] font-medium py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all text-center cursor-pointer z-10"
                      >
                        Définir principale
                      </button>
                    )}
                  </div>
                ))}

                {/* Add more button tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-28 shrink-0 rounded-lg border-2 border-dashed border-[#e4e7ec] hover:border-[#2b6b61] bg-slate-50/50 hover:bg-[#edf5f4]/40 flex flex-col items-center justify-center text-[#667085] hover:text-[#2b6b61] transition-all cursor-pointer p-2"
                >
                  <Plus className="size-5 mb-1" />
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    Ajouter d'autres images
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Variantes et stock */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center">
                  <Package className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#101828]">Variantes et stock</h2>
                  <p className="text-xs text-[#667085]">
                    Ajoutez des tailles, couleurs, pointures, dimensions ou options personnalisées.
                  </p>
                </div>
              </div>

              {hasVariants && (
                <button
                  type="button"
                  onClick={handleGenerateVariants}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e7ec] bg-white hover:bg-slate-50 text-[#101828] text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <Settings className="size-3.5 text-[#667085]" />
                  <span>Générer les variantes</span>
                </button>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <Switch checked={hasVariants} onChange={setHasVariants} />
              <div>
                <span className="text-xs font-bold text-[#101828] block">
                  Ce produit possède des variantes
                </span>
                <span className="text-[11px] text-[#667085]">
                  Activez cette option si votre produit a des tailles, pointures, couleurs, dimensions, etc.
                </span>
              </div>
            </div>

            {/* CASE 1: Simple Product (Toggle OFF) */}
            {!hasVariants && (
              <div className="p-4 rounded-lg bg-slate-50 border border-[#e4e7ec] space-y-3">
                <span className="text-xs font-bold text-[#101828] block">
                  Gestion du produit simple (sans variantes)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101828] mb-1">
                      Stock disponible
                    </label>
                    <input
                      type="number"
                      value={simpleStock}
                      onChange={(e) => setSimpleStock(e.target.value)}
                      placeholder="15"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#101828] mb-1">
                      SKU Produit
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 2: Product With Variants (Toggle ON) */}
            {hasVariants && (
              <div className="space-y-4 pt-2">
                {/* Options List */}
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3.5 rounded-lg border border-[#e4e7ec] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Option Type Tag */}
                      <span className="px-2.5 py-1 rounded-md bg-white border border-[#e4e7ec] text-xs font-bold text-[#101828] shadow-2xs">
                        {opt.type === "Personnalisée" ? (opt.customName || "Option") : opt.type}
                      </span>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {opt.values.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#e4e7ec] text-xs font-medium text-[#101828] shadow-2xs"
                          >
                            {/* Color Swatch Dot if color */}
                            {opt.type === "Couleur" && COLOR_SWATCHES[val] && (
                              <span
                                className="size-2.5 rounded-full border border-slate-300"
                                style={{ backgroundColor: COLOR_SWATCHES[val] }}
                              />
                            )}
                            <span>{val}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionValue(opt.id, val)}
                              className="text-[#667085] hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}

                        {/* Inline Tag Input */}
                        {activeAddOptionId === opt.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Nouvelle valeur..."
                              value={newValueInput}
                              onChange={(e) => setNewValueInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddOptionValue(opt.id);
                                }
                              }}
                              className="w-28 h-7 px-2 text-xs rounded-md border border-[#2b6b61] focus:outline-none bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddOptionValue(opt.id)}
                              className="size-7 rounded-md bg-[#2b6b61] text-white flex items-center justify-center text-xs cursor-pointer"
                            >
                              <Check className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveAddOptionId(null)}
                              className="size-7 rounded-md bg-slate-200 text-[#667085] flex items-center justify-center text-xs cursor-pointer"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddOptionId(opt.id);
                              setNewValueInput("");
                            }}
                            className="size-7 rounded-md border border-dashed border-[#e4e7ec] hover:border-[#667085] bg-white text-[#667085] flex items-center justify-center text-xs cursor-pointer"
                            title={`Ajouter une valeur pour ${opt.type}`}
                          >
                            <Plus className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete Option Row */}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-[#667085] hover:text-rose-600 self-end sm:self-auto transition-colors p-1 cursor-pointer"
                      title="Supprimer cette option"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                {/* Add Option Dropdown Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-[#101828]">Ajouter une option :</span>
                  {(["Taille", "Pointure", "Couleur", "Dimension", "Matière", "Personnalisée"] as OptionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddOption(type)}
                      className="px-2.5 py-1 rounded-md border border-[#e4e7ec] bg-white hover:bg-slate-50 text-xs font-medium text-[#101828] shadow-2xs transition-colors cursor-pointer"
                    >
                      + {type}
                    </button>
                  ))}
                </div>

                {/* Generated Variants Table */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#101828]">
                      {variantsList.length} variantes générées
                    </span>
                    <span className="text-[11px] text-[#667085]">
                      Stock combiné : <strong className="text-[#101828]">{totalStockCount} pièces</strong>
                    </span>
                  </div>

                  <div className="border border-[#e4e7ec] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-[#e4e7ec] text-[#667085] font-bold uppercase tracking-wider text-[10.5px]">
                            <th className="py-2.5 px-3 w-8">
                              <input
                                type="checkbox"
                                checked={variantsList.length > 0 && variantsList.every((v) => v.selected)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setVariantsList((prev) =>
                                    prev.map((v) => ({ ...v, selected: checked }))
                                  );
                                }}
                                className="rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61] cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Variante</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3 w-32">Prix TTC</th>
                            <th className="py-2.5 px-3 w-28">Stock</th>
                            <th className="py-2.5 px-3 text-right w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {variantsList.map((v, index) => (
                            <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={v.selected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setVariantsList((prev) =>
                                      prev.map((item, idx) =>
                                        idx === index ? { ...item, selected: checked } : item
                                      )
                                    );
                                  }}
                                  className="rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61] cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  {v.colorHex && (
                                    <span
                                      className="size-3 rounded-full border border-slate-300 shrink-0"
                                      style={{ backgroundColor: v.colorHex }}
                                    />
                                  )}
                                  <span className="font-semibold text-[#101828]">{v.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-[#667085] text-[11px]">{v.sku}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085] font-semibold text-xs">
                                    €
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={v.price}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setVariantsList((prev) =>
                                        prev.map((item, idx) =>
                                          idx === index ? { ...item, price: val } : item
                                        )
                                      );
                                    }}
                                    className="w-full h-8 pl-6 pr-2 text-xs font-semibold text-[#101828] rounded-md border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] bg-white"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setVariantsList((prev) =>
                                      prev.map((item, idx) =>
                                        idx === index ? { ...item, stock: val } : item
                                      )
                                    );
                                  }}
                                  className="w-full h-8 px-2.5 text-xs font-bold text-[#101828] rounded-md border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] bg-white"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVariantsList((prev) => prev.filter((_, idx) => idx !== index));
                                  }}
                                  className="size-7 rounded-md hover:bg-slate-100 text-[#667085] hover:text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                                  title="Supprimer cette variante"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (30% width / 4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Publication */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center">
                <Settings className="size-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#101828]">Publication</h2>
                <p className="text-xs text-[#667085]">Définissez le statut et la visibilité de votre produit.</p>
              </div>
            </div>

            {/* Statut Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Statut
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3.5 pr-8 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] appearance-none transition-all cursor-pointer font-medium text-[#101828]"
                >
                  <option value="DRAFT">• Brouillon</option>
                  <option value="ACTIVE">• Publié (Actif)</option>
                </select>
                <ChevronDown className="size-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Visibilité Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Visibilité
              </label>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] appearance-none transition-all cursor-pointer font-medium text-[#101828]"
                >
                  <option value="VISIBLE">Visible sur la boutique</option>
                  <option value="HIDDEN">Masqué</option>
                </select>
                <Eye className="size-4 text-[#2b6b61] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="size-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-3 rounded-lg bg-[#edf5f4] border border-[#75aca2]/30 flex items-start gap-2.5">
              <Info className="size-4 text-[#2b6b61] shrink-0 mt-0.5" />
              <p className="text-xs text-[#2b6b61] font-medium leading-relaxed">
                Le produit sera visible sur votre boutique une fois publié.
              </p>
            </div>

            {/* Total Stock Box */}
            <div className="p-3.5 rounded-lg border border-[#e4e7ec] bg-slate-50 space-y-1">
              <span className="text-xs font-bold text-[#101828] block">
                Stock total
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <Database className="size-4 text-[#667085]" />
                <span className="text-base font-extrabold text-[#101828]">
                  {totalStockCount} pièces
                </span>
              </div>
              <p className="text-[11px] text-[#667085]">
                {hasVariants ? "Calculé automatiquement à partir des variantes." : "Stock défini pour l'article unique."}
              </p>
            </div>

            {/* Toggle: Produit mis en avant */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#101828] block">
                  Produit mis en avant
                </span>
                <span className="text-[11px] text-[#667085]">
                  Affiche ce produit dans les espaces de mise en avant
                </span>
              </div>
              <Switch checked={isFeatured} onChange={setIsFeatured} />
            </div>

            {/* Toggle: Autoriser les avis clients */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#101828] block">
                  Autoriser les avis clients
                </span>
                <span className="text-[11px] text-[#667085]">
                  Les clients pourront laisser un avis
                </span>
              </div>
              <Switch checked={allowReviews} onChange={setAllowReviews} />
            </div>
          </div>

          {/* Card 2: Options avancées */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center shrink-0">
                  <Sliders className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#101828]">Options avancées</h2>
                  <p className="text-xs text-[#667085]">SKU, poids, dimensions, SEO, etc.</p>
                </div>
              </div>
              {advancedOpen ? (
                <ChevronUp className="size-4 text-[#667085]" />
              ) : (
                <ChevronDown className="size-4 text-[#667085]" />
              )}
            </button>

            {advancedOpen && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1">
                    Poids estimé (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.45"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1">
                    Dimensions emballage (L x l x H cm)
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="35 x 25 x 4"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1">
                    Code-barres EAN-13
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="3760123456789"
                    className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#101828] block mb-2">
                    Référencement naturel (SEO)
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#667085] mb-1">
                        Balise Titre (Title Tag)
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder={name || "Robe longue satinée | DivinExpress"}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#667085] mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Découvrez notre somptueuse création confectionnée dans nos ateliers..."
                        className="w-full p-2 text-xs rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
