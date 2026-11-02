import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const possiblePaths = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
  ];
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...vals] = trimmed.split("=");
        const value = vals.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && value && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

// Catalogue initial Haute Couture & Prêt-à-Porter DivinExpress
const initialProducts = [
  {
    code: "DIV-H-101",
    slug: "costume-sur-mesure-laine-vierge",
    title: "Costume Sur-Mesure Laine Vierge",
    subtitle: "Coupe ajustée & finitions artisanales",
    description: "Confectionné à partir d'une laine vierge Super 130s italienne d'exception, ce costume deux pièces allie confort absolu et tombé impeccable.",
    gender: "Homme",
    material: "100% Laine Vierge Super 130s",
    origin: "Atelier Haute Couture Paris",
    basePrice: 590.00,
    baseOldPrice: 750.00,
    ratingScore: 4.9,
    ratingCount: 128,
    imageRecto: "/images/products/fashion/product-1.jpg",
    imageVerso: "/images/products/fashion/product-2.jpg",
    isFeatured: true,
    isAvailable: true,
    stockQuantity: 45,
    categorySlug: "hommes",
    variants: [
      { size: "S", color: "Noir Intense", colorHex: "#111827", price: 590.00, stock: 10 },
      { size: "M", color: "Noir Intense", colorHex: "#111827", price: 590.00, stock: 15 },
      { size: "L", color: "Noir Intense", colorHex: "#111827", price: 590.00, stock: 12 },
      { size: "XL", color: "Noir Intense", colorHex: "#111827", price: 590.00, stock: 8 },
      { size: "M", color: "Bleu Marine Profond", colorHex: "#1e3a8a", price: 590.00, stock: 12 },
      { size: "L", color: "Bleu Marine Profond", colorHex: "#1e3a8a", price: 590.00, stock: 10 },
    ]
  },
  {
    code: "DIV-F-201",
    slug: "robe-de-soiree-soie-naturelle",
    title: "Robe Longue en Soie Naturelle",
    subtitle: "Drapé fluide et dos nu raffiné",
    description: "Pièce maîtresse de notre collection atelier, cette robe en crêpe de soie pure sublime la silhouette avec élégance et distinction.",
    gender: "Femme",
    material: "100% Crêpe de Soie Naturelle",
    origin: "Atelier Haute Couture Paris",
    basePrice: 480.00,
    baseOldPrice: 620.00,
    ratingScore: 5.0,
    ratingCount: 94,
    imageRecto: "/images/products/fashion/product-3.jpg",
    imageVerso: "/images/products/fashion/product-4.jpg",
    isFeatured: true,
    isAvailable: true,
    stockQuantity: 30,
    categorySlug: "femmes",
    variants: [
      { size: "XS", color: "Noir Intense", colorHex: "#111827", price: 480.00, stock: 6 },
      { size: "S", color: "Noir Intense", colorHex: "#111827", price: 480.00, stock: 10 },
      { size: "M", color: "Noir Intense", colorHex: "#111827", price: 480.00, stock: 8 },
      { size: "S", color: "Terracotta Atelier", colorHex: "#c2410c", price: 480.00, stock: 6 },
    ]
  },
  {
    code: "DIV-H-102",
    slug: "chemise-oxford-coton-egyptien",
    title: "Chemise Oxford en Coton Égyptien",
    subtitle: "Col français & boutons nacre naturelle",
    description: "Tissée dans les fibres les plus nobles de coton d'Égypte à fibres longues, cette chemise offre douceur soyeuse et tenue infroissable.",
    gender: "Homme",
    material: "100% Coton d'Égypte Giza",
    origin: "Atelier Haute Couture Paris",
    basePrice: 145.00,
    baseOldPrice: 180.00,
    ratingScore: 4.8,
    ratingCount: 215,
    imageRecto: "/images/products/fashion/product-5.jpg",
    imageVerso: "/images/products/fashion/product-6.jpg",
    isFeatured: false,
    isAvailable: true,
    stockQuantity: 80,
    categorySlug: "hommes",
    variants: [
      { size: "S", color: "Blanc Céleste", colorHex: "#ffffff", price: 145.00, stock: 20 },
      { size: "M", color: "Blanc Céleste", colorHex: "#ffffff", price: 145.00, stock: 30 },
      { size: "L", color: "Blanc Céleste", colorHex: "#ffffff", price: 145.00, stock: 20 },
      { size: "XL", color: "Blanc Céleste", colorHex: "#ffffff", price: 145.00, stock: 10 },
      { size: "M", color: "Bleu Ciel", colorHex: "#93c5fd", price: 145.00, stock: 15 },
    ]
  },
  {
    code: "DIV-A-301",
    slug: "ceinture-cuir-pleine-fleur",
    title: "Ceinture Cuir Pleine Fleur & Boucle Palladium",
    subtitle: "Tannage végétal artisanal",
    description: "Maroquinerie de luxe confectionnée dans un cuir français pleine fleur tanné aux écorces de chêne.",
    gender: "Unisexe",
    material: "Cuir Pleine Fleur & Palladium",
    origin: "Maroquinerie Parisienne",
    basePrice: 120.00,
    baseOldPrice: 150.00,
    ratingScore: 4.9,
    ratingCount: 76,
    imageRecto: "/images/products/fashion/product-7.jpg",
    imageVerso: "/images/products/fashion/product-8.jpg",
    isFeatured: false,
    isAvailable: true,
    stockQuantity: 50,
    categorySlug: "accessoires",
    variants: [
      { size: "85", color: "Noir Intense", colorHex: "#111827", price: 120.00, stock: 15 },
      { size: "90", color: "Noir Intense", colorHex: "#111827", price: 120.00, stock: 20 },
      { size: "95", color: "Noir Intense", colorHex: "#111827", price: 120.00, stock: 15 },
    ]
  }
];

async function main() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    console.error("❌ ERREUR : La variable DATABASE_URL n'est pas définie dans .env.local ou .env.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    console.log("⏳ Importation du catalogue officiel DivinExpress dans Prisma...");

    for (const item of initialProducts) {
      const { variants, categorySlug, ...prodData } = item;

      // Récupération catégorie
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      const product = await prisma.product.upsert({
        where: { code: prodData.code },
        update: {
          ...prodData,
          categoryId: category ? category.id : null,
        },
        create: {
          ...prodData,
          categoryId: category ? category.id : null,
        },
      });

      console.log(`   📦 Produit importé : [${product.code}] ${product.title}`);

      // Importation des variantes
      for (const v of variants) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: {
            productId: product.id,
            size: v.size,
            color: v.color,
          },
        });

        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              price: v.price,
              stock: v.stock,
              colorHex: v.colorHex,
              inStock: v.stock > 0,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              price: v.price,
              stock: v.stock,
              inStock: v.stock > 0,
            },
          });
        }
      }
    }

    console.log("\n✅ SUCCÈS : Catalogue synchronisé avec succès dans la base de données !\n");
  } catch (err) {
    console.error("❌ Erreur lors du seed du catalogue :", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
