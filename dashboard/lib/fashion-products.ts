export interface FashionProduct {
  id: string;
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  origin: string;
  basePrice: number;
  baseOldPrice: number | null;
  ratingScore: number;
  ratingCount: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageRecto: string;
  imageVerso: string | null;
  category: { id: string; name: string; slug: string };
  formats: {
    id: string;
    label: string;
    weightGrams: number;
    multiplier: number;
    price: number;
    oldPrice: number | null;
    inStock: boolean;
  }[];
  createdAt: string;
}

export const MOCK_FASHION_PRODUCTS: FashionProduct[] = [
  {
    id: "DIV-H-101",
    code: "DIV-H-101",
    slug: "costume-homme-sur-mesure-noir",
    title: "Costume Homme Sur-Mesure Noir Impérial",
    subtitle: "Laine italienne 120s & finitions main",
    description: "Coupe ajustée contemporaine, veston 2 boutons et pantalon assorti.",
    origin: "Atelier Haute Couture Paris",
    basePrice: 249.99,
    baseOldPrice: 299.99,
    ratingScore: 4.9,
    ratingCount: 42,
    stockQuantity: 18,
    isAvailable: true,
    imageRecto: "/image/image projet/hommes/men_suit_black.png",
    imageVerso: "/image/image projet/hommes/men_suit_charcoal.png",
    category: { id: "cat-homme", name: "Homme", slug: "hommes" },
    formats: [
      { id: "f-48", label: "Taille 48 (S)", weightGrams: 900, multiplier: 1, price: 249.99, oldPrice: 299.99, inStock: true },
      { id: "f-50", label: "Taille 50 (M)", weightGrams: 950, multiplier: 1, price: 249.99, oldPrice: 299.99, inStock: true },
      { id: "f-52", label: "Taille 52 (L)", weightGrams: 1000, multiplier: 1, price: 249.99, oldPrice: 299.99, inStock: true },
      { id: "f-54", label: "Taille 54 (XL)", weightGrams: 1050, multiplier: 1, price: 249.99, oldPrice: 299.99, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "DIV-F-201",
    code: "DIV-F-201",
    slug: "robe-de-soiree-soie-rouge",
    title: "Robe de Soirée Soie Rouge Rubis",
    subtitle: "Soie fluide & découpe drapée élégante",
    description: "Robe longue élégante pour réceptions, galas et cérémonies d'exception.",
    origin: "Atelier Création Lyon",
    basePrice: 189.0,
    baseOldPrice: 220.0,
    ratingScore: 4.95,
    ratingCount: 38,
    stockQuantity: 14,
    isAvailable: true,
    imageRecto: "/image/image projet/femmes/women_dress_red.png",
    imageVerso: "/image/image projet/femmes/women_dress_black.png",
    category: { id: "cat-femme", name: "Femme", slug: "femmes" },
    formats: [
      { id: "f-36", label: "Taille 36 (S)", weightGrams: 400, multiplier: 1, price: 189.0, oldPrice: 220.0, inStock: true },
      { id: "f-38", label: "Taille 38 (M)", weightGrams: 420, multiplier: 1, price: 189.0, oldPrice: 220.0, inStock: true },
      { id: "f-40", label: "Taille 40 (L)", weightGrams: 440, multiplier: 1, price: 189.0, oldPrice: 220.0, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "DIV-E-301",
    code: "DIV-E-301",
    slug: "ensemble-manteau-enfant-marine",
    title: "Manteau Hiver Enfant Bleu Marine",
    subtitle: "Doublure polaire chaude & traitement déperlant",
    description: "Protection optimale contre le froid avec capuche amovible et poches zippées.",
    origin: "Atelier Kids Confort",
    basePrice: 79.99,
    baseOldPrice: 95.0,
    ratingScore: 4.85,
    ratingCount: 29,
    stockQuantity: 25,
    isAvailable: true,
    imageRecto: "/image/image projet/enfants/kids_coat_navy.png",
    imageVerso: "/image/image projet/enfants/kids_coat_yellow.png",
    category: { id: "cat-enfant", name: "Enfant", slug: "enfants" },
    formats: [
      { id: "f-4a", label: "4-6 ans", weightGrams: 500, multiplier: 1, price: 79.99, oldPrice: 95.0, inStock: true },
      { id: "f-8a", label: "8-10 ans", weightGrams: 550, multiplier: 1, price: 79.99, oldPrice: 95.0, inStock: true },
      { id: "f-12a", label: "12-14 ans", weightGrams: 600, multiplier: 1, price: 84.99, oldPrice: 99.0, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "DIV-G-401",
    code: "DIV-G-401",
    slug: "montre-connectee-luxe-smartwatch",
    title: "Montre Connectée Smartwatch Édition Rose Gold",
    subtitle: "Écran AMOLED haute définition & suivi santé complet",
    description: "Boîtier en acier inoxydable poli, bracelet en cuir interchangeable et autonomie 7 jours.",
    origin: "Division Tech & Accessoires",
    basePrice: 129.0,
    baseOldPrice: 159.0,
    ratingScore: 4.92,
    ratingCount: 56,
    stockQuantity: 32,
    isAvailable: true,
    imageRecto: "/image/image projet/gadgets/gadget_watch_rosegold.png",
    imageVerso: "/image/image projet/gadgets/gadget_watch_black.png",
    category: { id: "cat-gadgets", name: "Accessoires & Gadgets", slug: "gadgets" },
    formats: [
      { id: "f-40mm", label: "Boîtier 40mm", weightGrams: 150, multiplier: 1, price: 129.0, oldPrice: 159.0, inStock: true },
      { id: "f-44mm", label: "Boîtier 44mm", weightGrams: 170, multiplier: 1, price: 139.0, oldPrice: 169.0, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "DIV-H-102",
    code: "DIV-H-102",
    slug: "hoodie-premium-yahweh-noir",
    title: "Sweat à Capuche Premium Yahweh Noir",
    subtitle: "Coton biologique brossé 450 GSM",
    description: "Sweat ultra-confortable à coupe décontractée avec broderie discrète ton sur ton.",
    origin: "Atelier Streetwear Studio",
    basePrice: 69.0,
    baseOldPrice: 85.0,
    ratingScore: 4.9,
    ratingCount: 64,
    stockQuantity: 40,
    isAvailable: true,
    imageRecto: "/image/image projet/hommes/yahweh_hoodie_black.jpg",
    imageVerso: "/image/image projet/hommes/yahweh_hoodie_burgundy.jpg",
    category: { id: "cat-homme", name: "Homme", slug: "hommes" },
    formats: [
      { id: "f-s", label: "Taille S", weightGrams: 600, multiplier: 1, price: 69.0, oldPrice: 85.0, inStock: true },
      { id: "f-m", label: "Taille M", weightGrams: 650, multiplier: 1, price: 69.0, oldPrice: 85.0, inStock: true },
      { id: "f-l", label: "Taille L", weightGrams: 700, multiplier: 1, price: 69.0, oldPrice: 85.0, inStock: true },
      { id: "f-xl", label: "Taille XL", weightGrams: 750, multiplier: 1, price: 69.0, oldPrice: 85.0, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "DIV-F-202",
    code: "DIV-F-202",
    slug: "veste-blazer-femme-beige",
    title: "Blazer Tailleur Femme Beige Saharien",
    subtitle: "Coupe structurée moderne & boutons nacre",
    description: "Veste blazer indispensable pour une allure professionnelle et chic au quotidien.",
    origin: "Atelier Création Lyon",
    basePrice: 119.0,
    baseOldPrice: 140.0,
    ratingScore: 4.88,
    ratingCount: 27,
    stockQuantity: 20,
    isAvailable: true,
    imageRecto: "/image/image projet/femmes/women_jacket_beige.png",
    imageVerso: "/image/image projet/femmes/women_jacket_black.png",
    category: { id: "cat-femme", name: "Femme", slug: "femmes" },
    formats: [
      { id: "f-36b", label: "Taille 36 (S)", weightGrams: 500, multiplier: 1, price: 119.0, oldPrice: 140.0, inStock: true },
      { id: "f-38b", label: "Taille 38 (M)", weightGrams: 530, multiplier: 1, price: 119.0, oldPrice: 140.0, inStock: true },
      { id: "f-40b", label: "Taille 40 (L)", weightGrams: 560, multiplier: 1, price: 119.0, oldPrice: 140.0, inStock: true },
    ],
    createdAt: new Date().toISOString(),
  },
];
