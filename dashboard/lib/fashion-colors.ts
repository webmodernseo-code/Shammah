export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  isCustom?: boolean;
  imageUrl?: string | null;
}

export interface ProductVariantItem {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
}

export const PRESET_FASHION_COLORS: ColorVariant[] = [
  { id: "noir", name: "Noir Intense", hex: "#111827" },
  { id: "blanc", name: "Blanc Pur", hex: "#FFFFFF" },
  { id: "marine", name: "Bleu Marine", hex: "#1E3A8A" },
  { id: "bleu-ciel", name: "Bleu Ciel", hex: "#38BDF8" },
  { id: "beige", name: "Beige Sable", hex: "#D4C4A8" },
  { id: "camel", name: "Camel Chaud", hex: "#C5832B" },
  { id: "bordeaux", name: "Bordeaux Royal", hex: "#7F1D1D" },
  { id: "rouge-rubis", name: "Rouge Rubis", hex: "#DC2626" },
  { id: "vert-sauge", name: "Vert Sauge", hex: "#4D7C5D" },
  { id: "vert-emeraude", name: "Vert Forêt", hex: "#065F46" },
  { id: "kaki", name: "Kaki Chic", hex: "#57534E" },
  { id: "gris-anthracite", name: "Gris Anthracite", hex: "#4B5563" },
  { id: "gris-perle", name: "Gris Perle", hex: "#E5E7EB" },
  { id: "rose-poudre", name: "Rose Poudré", hex: "#F472B6" },
  { id: "terracotta", name: "Terracotta", hex: "#C2410C" },
  { id: "chocolat", name: "Marron Chocolat", hex: "#451A03" },
  { id: "ecru", name: "Écru Naturel", hex: "#F5F5F0" },
  { id: "dore", name: "Doré Champagne", hex: "#D4AF37" },
  { id: "argent", name: "Argent Métallisé", hex: "#94A3B8" },
];
