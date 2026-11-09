"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
} from "lucide-react";
import Switch from "@/components/ui/switch";

export type OptionType =
  | "Taille"
  | "Pointure"
  | "Couleur"
  | "Dimension"
  | "Matière"
  | "Personnalisée";

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

const PRESET_OPTIONS: Record<OptionType, string[]> = {
  Taille: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Pointure: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  Couleur: [
    "Noir",
    "Blanc",
    "Beige",
    "Vert Forêt",
    "Marine",
    "Bordeaux",
    "Gris Chiné",
    "Marron",
    "Terracotta",
  ],
  Dimension: ["Taille Unique", "33 cl (Mug)", "38 × 42 cm (Tote Bag)", "50 × 70 cm"],
  Matière: ["Coton Biologique", "Molleton Brossé", "Céramique", "Coton Sergé Brodé"],
  Personnalisée: [],
};

const COLOR_SWATCHES: Record<string, string> = {
  Noir: "#111827",
  Blanc: "#ffffff",
  Beige: "#d4b996",
  "Vert Forêt": "#14532d",
  Vert: "#15803d",
  Marine: "#1e3a8a",
  Bleu: "#2563eb",
  Bordeaux: "#7f1d1d",
  Rouge: "#dc2626",
  "Gris Chiné": "#64748b",
  Gris: "#6b7280",
  Marron: "#78350f",
  Terracotta: "#c2410c",
  Doré: "#d97706",
  Argenté: "#94a3b8",
  Kaki: "#4d5d53",
  Rose: "#ec4899",
};

const DEFAULT_CATEGORIES = [
  "T-shirts",
  "Sweats à capuche",
  "Casquettes",
  "Accessoires",
];

/**
 * Compress a File in browser into a lightweight WebP data URI fallback (~40-80 KB)
 */
async function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        try {
          const maxDim = 1000;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.82);
          resolve(dataUrl);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const names = json.data.map((c: any) => c.name);
          setCategoriesList(Array.from(new Set([...DEFAULT_CATEGORIES, ...names])));
        }
      } catch {
        // Keep default Shammah categories
      }
    }
    loadCategories();
  }, []);

  // 1. General Information State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("T-shirts");
  const [brand, setBrand] = useState("Shammah");
  const [sku, setSku] = useState("SHM-1001");
  const [price, setPrice] = useState("29.00");
  const [comparePrice, setComparePrice] = useState("");
  const [vatRate, setVatRate] = useState("20%");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setSku(`SHM-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  // Simple product stock (when hasVariants is false)
  const [simpleStock, setSimpleStock] = useState("25");

  // Rich Text State
  const [textFormat, setTextFormat] = useState("Paragraphe");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // 2. Images State (starts clean so uploaded image becomes Main automatically)
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // 3. Variants State
  const [hasVariants, setHasVariants] = useState(true);

  const [options, setOptions] = useState<ProductOption[]>([
    { id: "opt-1", type: "Taille", values: ["S", "M", "L", "XL", "XXL"] },
    { id: "opt-2", type: "Couleur", values: ["Noir", "Blanc"] },
  ]);

  const [activeAddOptionId, setActiveAddOptionId] = useState<string | null>(null);
  const [newValueInput, setNewValueInput] = useState("");

  const [variantsList, setVariantsList] = useState<GeneratedVariant[]>([]);

  // 4. Publication State
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("ACTIVE");
  const [visibility, setVisibility] = useState<"VISIBLE" | "HIDDEN">("VISIBLE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowReviews, setAllowReviews] = useState(true);

  // 5. Options Avancées State
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [weight, setWeight] = useState("0.30");
  const [dimensions, setDimensions] = useState("30 x 22 x 3");
  const [barcode, setBarcode] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Build combinations accurately from options
  const buildVariantsFromOptions = useCallback(
    (
      currentOptions: ProductOption[],
      currentSku: string,
      currentPrice: string,
      prevVariants: GeneratedVariant[]
    ): GeneratedVariant[] => {
      const validOptions = currentOptions.filter((o) => o.values.length > 0);
      if (validOptions.length === 0) return [];

      const cleanBaseSku = (currentSku || "SHM-PROD").trim().toUpperCase();
      const basePrice = currentPrice || "29.00";

      const prevByKey = new Map<string, GeneratedVariant>();
      prevVariants.forEach((pv) => {
        prevByKey.set(`${pv.size.toLowerCase()}:::${pv.color.toLowerCase()}`, pv);
      });

      type TaggedValue = { optType: OptionType; val: string };
      const taggedArrays: TaggedValue[][] = validOptions.map((opt) =>
        opt.values.map((v) => ({ optType: opt.type, val: v }))
      );

      function cartesian(arr: TaggedValue[][]): TaggedValue[][] {
        return arr.reduce(
          (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
          [[]] as TaggedValue[][]
        );
      }

      const combinations = cartesian(taggedArrays);

      return combinations.map((combo, idx) => {
        const comboName = combo.map((c) => c.val).join(" · ");
        const skuSuffix = combo
          .map((c) => c.val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase())
          .join("-");

        const colorEntry = combo.find((c) => c.optType === "Couleur");
        const sizeEntries = combo.filter((c) => c.optType !== "Couleur");

        const colorVal = colorEntry ? colorEntry.val : "Noir";
        const sizeVal =
          sizeEntries.length > 0
            ? sizeEntries.map((s) => s.val).join(" / ")
            : "Taille Unique";

        const colorHex = COLOR_SWATCHES[colorVal] || "#111827";
        const lookupKey = `${sizeVal.toLowerCase()}:::${colorVal.toLowerCase()}`;
        const existing = prevByKey.get(lookupKey);

        return {
          id: existing?.id || `var-gen-${idx}-${Date.now()}`,
          name: comboName,
          size: sizeVal,
          color: colorVal,
          colorHex,
          sku: `${cleanBaseSku}-${skuSuffix}`,
          price: existing?.price || basePrice,
          stock: existing?.stock || "15",
          selected: existing ? existing.selected : true,
        };
      });
    },
    []
  );

  // Automatically keep variants matrix synchronized when options change
  useEffect(() => {
    setVariantsList((prev) => buildVariantsFromOptions(options, sku, price, prev));
  }, [options, sku, buildVariantsFromOptions]);

  // Also update variant prices when base price changes
  const handlePriceChange = (newPrice: string) => {
    setPrice(newPrice);
    if (newPrice && Number.isFinite(parseFloat(newPrice))) {
      setVariantsList((prev) =>
        prev.map((v) => ({
          ...v,
          price: newPrice,
        }))
      );
    }
  };

  // Total calculated stock
  const totalStockCount = useMemo(() => {
    if (!hasVariants) {
      return parseInt(simpleStock, 10) || 0;
    }
    return variantsList
      .filter((v) => v.selected)
      .reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  }, [hasVariants, simpleStock, variantsList]);

  // Add Option to Product
  const handleAddOption = (type: OptionType) => {
    const existing = options.find((o) => o.type === type && type !== "Personnalisée");
    if (existing) {
      toast.info(`L'option « ${type} » est déjà présente.`);
      return;
    }

    const newOption: ProductOption = {
      id: `opt-${Date.now()}`,
      type,
      customName: type === "Personnalisée" ? "Finition" : undefined,
      values: PRESET_OPTIONS[type]?.length
        ? [...PRESET_OPTIONS[type].slice(0, 3)]
        : ["Standard"],
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

  // Manual Regenerate button handler
  const handleGenerateVariants = () => {
    const validOptions = options.filter((o) => o.values.length > 0);
    if (validOptions.length === 0) {
      toast.error("Veuillez renseigner au moins une valeur dans vos options.");
      return;
    }
    const generated = buildVariantsFromOptions(options, sku, price, []);
    setVariantsList(generated);
    toast.success(`${generated.length} déclinaison(s) générée(s) avec succès.`);
  };

  // Process uploaded files (via click or drag-and-drop)
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedList: ProductImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.set("file", file);

      try {
        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (res.ok && json.data?.url) {
          uploadedList.push({
            id: `img-${Date.now()}-${i}`,
            url: json.data.url,
            isMain: false,
            name: file.name,
          });
        } else {
          const dataUrl = await fileToCompressedDataUrl(file);
          uploadedList.push({
            id: `img-${Date.now()}-${i}`,
            url: dataUrl,
            isMain: false,
            name: file.name,
          });
        }
      } catch {
        const dataUrl = await fileToCompressedDataUrl(file);
        uploadedList.push({
          id: `img-${Date.now()}-${i}`,
          url: dataUrl,
          isMain: false,
          name: file.name,
        });
      }
    }

    setImages((prev) => {
      const combined = [...prev, ...uploadedList];
      if (combined.length > 0 && !combined.some((img) => img.isMain)) {
        combined[0].isMain = true;
      }
      return combined;
    });

    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(`${uploadedList.length} photo(s) ajoutée(s) avec succès.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const handleDropFiles = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleAddCustomImageUrl = () => {
    const cleanUrl = customImageUrl.trim();
    if (!cleanUrl) return;
    setImages((prev) => {
      const next = [
        ...prev,
        {
          id: `img-url-${Date.now()}`,
          url: cleanUrl,
          isMain: prev.length === 0,
          name: "Visuel externe",
        },
      ];
      return next;
    });
    setCustomImageUrl("");
    toast.success("Image ajoutée à la galerie.");
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
      toast.error("Veuillez renseigner le nom de l'article.");
      return;
    }

    const numPrice = parseFloat(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      toast.error("Veuillez indiquer un prix de vente valide supérieur à 0 €.");
      return;
    }

    setSaving(true);
    try {
      const defaultCategoryThumb =
        category === "Sweats à capuche"
          ? "/images/cls-categories/pod/sweat-vert-jesus.jpg"
          : category === "Casquettes"
          ? "/images/cls-categories/pod/bonnets-casquettes.jpg"
          : category === "Accessoires"
          ? "/images/cls-categories/pod/accessories-mug.jpg"
          : "/images/cls-categories/pod/t-shirts-jesus.jpg";

      const mainImg =
        images.find((i) => i.isMain)?.url ||
        images[0]?.url ||
        defaultCategoryThumb;
      const secondaryImg = images.find((i) => !i.isMain)?.url || null;

      const activeVariants = hasVariants
        ? variantsList.filter((v) => v.selected)
        : [];

      const payloadVariants =
        hasVariants && activeVariants.length > 0
          ? activeVariants.map((v) => ({
              size: v.size || "Unique",
              color: v.color || "Noir",
              colorHex: v.colorHex || "#111827",
              price: parseFloat(v.price) || numPrice,
              stock: parseInt(v.stock, 10) || 10,
            }))
          : [
              {
                size: "Taille Unique",
                color: "Noir",
                colorHex: "#111827",
                price: numPrice,
                stock: parseInt(simpleStock, 10) || 25,
              },
            ];

      const isPublished =
        submitStatus === "ACTIVE" && visibility === "VISIBLE";

      const payload = {
        name: name.trim(),
        title: name.trim(),
        category: category || "T-shirts",
        brand: brand.trim() || "Shammah",
        sku: sku.trim() || `SHM-${Date.now().toString().slice(-4)}`,
        code: sku.trim() || `SHM-${Date.now().toString().slice(-4)}`,
        price: numPrice,
        basePrice: numPrice,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        baseOldPrice: comparePrice ? parseFloat(comparePrice) : null,
        description: description.trim() || name.trim(),
        stock: totalStockCount || 25,
        stockQuantity: totalStockCount || 25,
        isPublished,
        isFeatured,
        image: mainImg,
        imageRecto: mainImg,
        imageVerso: secondaryImg,
        variants: payloadVariants,
        weight: parseFloat(weight) || 0.3,
        barcode: barcode.trim(),
        seoTitle: seoTitle.trim() || name.trim(),
        seoDescription: seoDescription.trim() || description.trim(),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Erreur lors de l'enregistrement de l'article.");
      }

      toast.success(
        isPublished
          ? "Article publié avec succès sur le catalogue et la boutique !"
          : "Brouillon enregistré avec succès !"
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
        <div className="flex items-center gap-2 text-xs text-[#667085] font-medium">
          <Link href="/products" className="hover:text-[#101828] transition-colors">
            Produits
          </Link>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Nouveau produit</span>
        </div>

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
                Nouveau produit Shammah
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Ajoutez une création à votre catalogue (T-shirts, Sweats à capuche, Casquettes ou Accessoires) et publiez-la directement sur la boutique.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={saving || uploadingImage}
              onClick={() => handleSave("DRAFT")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e4e7ec] bg-white hover:bg-slate-50 text-[#101828] text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="size-4 text-[#667085]" strokeWidth={2} />
              <span>Enregistrer brouillon</span>
            </button>

            <button
              type="button"
              disabled={saving || uploadingImage}
              onClick={() => handleSave("ACTIVE")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="size-4 text-white" strokeWidth={2} />
              <span>{saving ? "Publication en cours..." : "Publier le produit"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-Column Grid Layout (70% Left / 30% Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Informations Générales */}
          <div className="bg-white rounded-xl border border-[#e4e7ec] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="size-7 rounded-lg bg-[#edf5f4] text-[#2b6b61] flex items-center justify-center">
                <FileText className="size-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#101828]">Informations générales</h2>
                <p className="text-xs text-[#667085]">Renseignez les informations principales de votre article.</p>
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
                  placeholder="Ex : T-shirt Jésus Sauve Coton Bio"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all bg-white text-[#101828]"
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
                  Marque / Collection
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex : Shammah"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all bg-white text-[#101828]"
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
                  placeholder="Ex : SHM-1001"
                  className="w-full h-10 px-3.5 text-xs sm:text-sm font-mono rounded-lg border border-[#e4e7ec] bg-slate-50/70 focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all text-[#101828]"
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
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="29.00"
                    className="w-full h-10 pl-8 pr-3.5 text-xs sm:text-sm font-semibold text-[#101828] rounded-lg border border-[#e4e7ec] focus:outline-none focus:border-[#2b6b61] focus:ring-1 focus:ring-[#2b6b61] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Prix avant réduction (optionnel)
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
                    placeholder="39.00"
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

            {/* Row 4: Description */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Description de l&apos;article
              </label>

              <div className="border border-[#e4e7ec] rounded-lg overflow-hidden focus-within:border-[#2b6b61] focus-within:ring-1 focus-within:ring-[#2b6b61] transition-all">
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
                  placeholder="Décrivez votre création : message inspirant, matière (coton bio, molleton...), coupe, conseils d'entretien..."
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
                    Téléversez vos photos depuis votre appareil. La première photo est définie automatiquement comme image principale.
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
                onDrop={handleDropFiles}
                onDragOver={(e) => e.preventDefault()}
                className="lg:col-span-5 border-2 border-dashed border-[#e4e7ec] hover:border-[#2b6b61] bg-slate-50/50 hover:bg-[#edf5f4]/40 rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
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
                  {uploadingImage
                    ? "Téléversement et optimisation en cours..."
                    : "ou cliquez pour parcourir vos fichiers"}
                </p>
                <p className="text-[11px] text-[#667085] mt-2">
                  PNG, JPG, WEBP, AVIF • Jusqu&apos;à 10 Mo par image
                </p>
              </div>

              {/* Gallery Previews */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3 overflow-x-auto py-1 custom-scrollbar min-h-[116px]">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative size-28 shrink-0 rounded-lg overflow-hidden group transition-all bg-slate-50 ${
                        img.isMain
                          ? "border-2 border-[#2b6b61] shadow-2xs"
                          : "border border-[#e4e7ec] hover:border-slate-400"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.name || "Visuel produit"}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />

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

                      <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/40 text-white flex items-center justify-center group-hover:hidden">
                        <MoreHorizontal className="size-3" />
                      </div>

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

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-28 shrink-0 rounded-lg border-2 border-dashed border-[#e4e7ec] hover:border-[#2b6b61] bg-slate-50/50 hover:bg-[#edf5f4]/40 flex flex-col items-center justify-center text-[#667085] hover:text-[#2b6b61] transition-all cursor-pointer p-2"
                  >
                    <Plus className="size-5 mb-1" />
                    <span className="text-[11px] font-semibold text-center leading-tight">
                      Ajouter une photo
                    </span>
                  </button>
                </div>

                {/* Optional Image URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Ou coller l'URL directe d'une image (https://... ou /images/...)"
                    className="flex-1 h-9 px-3 text-xs rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] text-[#101828]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="h-9 px-3 rounded-lg border border-[#e4e7ec] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#101828] transition-colors cursor-pointer shrink-0"
                  >
                    Ajouter l&apos;URL
                  </button>
                </div>
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
                    Gérez les tailles, couleurs et quantités en stock. Les déclinaisons se mettent à jour automatiquement.
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
                  <span>Réinitialiser les variantes</span>
                </button>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <Switch checked={hasVariants} onChange={setHasVariants} />
              <div>
                <span className="text-xs font-bold text-[#101828] block">
                  Ce produit possède plusieurs tailles ou couleurs
                </span>
                <span className="text-[11px] text-[#667085]">
                  Désactivez pour un article à taille unique (ex : mug, bible, accessoire simple).
                </span>
              </div>
            </div>

            {/* CASE 1: Simple Product (Toggle OFF) */}
            {!hasVariants && (
              <div className="p-4 rounded-lg bg-slate-50 border border-[#e4e7ec] space-y-3">
                <span className="text-xs font-bold text-[#101828] block">
                  Gestion du produit simple (Taille Unique)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101828] mb-1">
                      Stock disponible
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={simpleStock}
                      onChange={(e) => setSimpleStock(e.target.value)}
                      placeholder="25"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] text-[#101828]"
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
                      className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#e4e7ec] bg-white focus:outline-none focus:border-[#2b6b61] text-[#101828]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 2: Product With Variants (Toggle ON) */}
            {hasVariants && (
              <div className="space-y-4 pt-2">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3.5 rounded-lg border border-[#e4e7ec] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-white border border-[#e4e7ec] text-xs font-bold text-[#101828] shadow-2xs">
                        {opt.type === "Personnalisée" ? opt.customName || "Option" : opt.type}
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {opt.values.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#e4e7ec] text-xs font-medium text-[#101828] shadow-2xs"
                          >
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
                              className="w-28 h-7 px-2 text-xs rounded-md border border-[#2b6b61] focus:outline-none bg-white text-[#101828]"
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

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-[#101828]">Ajouter une option :</span>
                  {(["Taille", "Couleur", "Dimension", "Matière", "Pointure", "Personnalisée"] as OptionType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAddOption(type)}
                        className="px-2.5 py-1 rounded-md border border-[#e4e7ec] bg-white hover:bg-slate-50 text-xs font-medium text-[#101828] shadow-2xs transition-colors cursor-pointer"
                      >
                        + {type}
                      </button>
                    )
                  )}
                </div>

                {/* Generated Variants Table */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#101828]">
                      {variantsList.filter((v) => v.selected).length} déclinaison(s) active(s)
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
                                  min="0"
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

        {/* ── RIGHT COLUMN (4 cols) ── */}
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
                  <option value="ACTIVE">• Publié (Actif)</option>
                  <option value="DRAFT">• Brouillon</option>
                </select>
                <ChevronDown className="size-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

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

            <div className="p-3 rounded-lg bg-[#edf5f4] border border-[#75aca2]/30 flex items-start gap-2.5">
              <Info className="size-4 text-[#2b6b61] shrink-0 mt-0.5" />
              <p className="text-xs text-[#2b6b61] font-medium leading-relaxed">
                L&apos;article sera immédiatement visible sur la boutique officielle Shammah dès sa publication.
              </p>
            </div>

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

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#101828] block">
                  Produit mis en avant
                </span>
                <span className="text-[11px] text-[#667085]">
                  Affiche ce produit en tête des sélections
                </span>
              </div>
              <Switch checked={isFeatured} onChange={setIsFeatured} />
            </div>

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
                  <p className="text-xs text-[#667085]">Poids, dimensions, SEO, etc.</p>
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
                    placeholder="0.30"
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
                    placeholder="30 x 22 x 3"
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
                    placeholder="Optionnel"
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
                        placeholder={name || "Création chrétienne | Shammah"}
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
                        placeholder="Découvrez cette création chrétienne Shammah imprimée en France..."
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
