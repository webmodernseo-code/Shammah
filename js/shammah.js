// SHAMMAH - E-commerce SPA Responsive Logic

// 1. PRODUCT DATABASE (16 Premium Items: 6 Femme, 6 Homme, 4 Enfant)
const PRODUCTS = [
  // --- FEMME (6 Items) ---
  {
    id: "velora-dress",
    title: "Robe Minimale Velora",
    categories: ["femme", "casual"],
    price: 52.00,
    oldPrice: 62.00,
    desc: "Coupe minimaliste et de haute précision alliant confort absolu et esthétique moderne. Fabriquée dans un atelier d'exception avec un souci obsessionnel du détail et des finitions durables.",
    image: "images/product_grey.png",
    variants: [
      { img: "images/product_grey.png", color: "#2b2b2a", name: "Gris Herringbone" },
      { img: "images/product_brown.png", color: "#d1b89d", name: "Camel Classique" },
      { img: "images/product_orange.png", color: "#df8a60", name: "Orange Rouille" },
      { img: "images/product_dark.png", color: "#3b4d4b", name: "Anthracite" }
    ],
    sizes: ["S", "M", "L"]
  },
  {
    id: "classic-trench",
    title: "Trench Coat Intemporel",
    categories: ["femme", "casual"],
    price: 110.00,
    oldPrice: 135.00,
    desc: "Trench coat croisé classique en coton imperméable. Doté d'une ceinture ajustable et de pattes d'épaules traditionnelles. La pièce parfaite de mi-saison.",
    image: "images/trench_beige.png",
    variants: [
      { img: "images/trench_beige.png", color: "#d2b48c", name: "Beige Mastic" },
      { img: "images/trench_black.png", color: "#1c1c1c", name: "Noir Onyx" }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "linen-set",
    title: "Ensemble d'Été en Lin",
    categories: ["femme", "casual"],
    price: 85.00,
    oldPrice: 98.00,
    desc: "Blouse légère et pantalon large assorti 100% lin lavé. Frais, respirant et d'une élégance naturelle et décontractée pour les journées chaudes.",
    image: "images/linen_sable.png",
    variants: [
      { img: "images/linen_sable.png", color: "#eedcb2", name: "Sable Fin" },
      { img: "images/linen_slate.png", color: "#708090", name: "Gris Ardoise" }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "silk-dress",
    title: "Robe Portefeuille en Soie",
    categories: ["femme", "casual"],
    price: 145.00,
    oldPrice: 175.00,
    desc: "Créée en soie de mûrier fluide avec une coupe portefeuille flatteuse et un ourlet asymétrique subtil. Idéale pour les grandes occasions.",
    image: "images/silk_emerald.png",
    variants: [
      { img: "images/silk_emerald.png", color: "#004930", name: "Vert Émeraude" },
      { img: "images/silk_ruby.png", color: "#a22b3e", name: "Rouge Rubis" }
    ],
    sizes: ["S", "M", "L"]
  },
  {
    id: "cargo-joggers",
    title: "Pantalon Cargo Urbain",
    categories: ["femme", "streetwear"],
    price: 65.00,
    oldPrice: 78.00,
    desc: "Pantalon de jogging style cargo en coton croisé robuste. Taille haute élastique, chevilles ajustées et multiples poches fonctionnelles pour un look urbain affirmé.",
    image: "images/cargo_kaki.png",
    variants: [
      { img: "images/cargo_kaki.png", color: "#556b2f", name: "Vert Kaki" },
      { img: "images/cargo_soot.png", color: "#252525", name: "Noir Suie" }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "cable-knit",
    title: "Pull en Torsades Court",
    categories: ["femme", "streetwear"],
    price: 55.00,
    oldPrice: 65.00,
    desc: "Pull court à col roulé et torsades tricoté dans un mélange de laine ultra-doux. Volume moderne et design contemporain.",
    image: "images/cable_cream.png",
    variants: [
      { img: "images/cable_cream.png", color: "#f9f6f0", name: "Blanc Crème" },
      { img: "images/cable_pink.png", color: "#d8b2d1", name: "Vieux Rose" }
    ],
    sizes: ["S", "M", "L"]
  },

  // --- HOMME (6 Items) ---
  {
    id: "signature-knit",
    title: "Pull Signature Shammah",
    categories: ["homme", "streetwear"],
    price: 75.00,
    oldPrice: 90.00,
    desc: "Pull en tricot épais de coton premium d'inspiration urbaine. Coupe décontractée oversize, épaules tombantes et maille respirante pour un style signature intemporel et moderne.",
    image: "images/product_male.png",
    variants: [
      { img: "images/product_male.png", color: "#f5f3ef", name: "Crème Surdimensionné" }
    ],
    sizes: ["M", "L", "XL"]
  },
  {
    id: "leather-jacket",
    title: "Blouson Bombardier Cuir",
    categories: ["homme", "streetwear"],
    price: 199.00,
    oldPrice: 245.00,
    desc: "Veste en cuir d'agneau pleine fleur au fini texturé. Coupe pilote avec col en peau lainée amovible et doublure satinée.",
    image: "images/leather_black.png",
    variants: [
      { img: "images/leather_black.png", color: "#1a1a1a", name: "Noir Profond" },
      { img: "images/leather_chocolate.png", color: "#4b2f1d", name: "Chocolat" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "oversized-hoodie",
    title: "Hoodie Molleton Oversize",
    categories: ["homme", "streetwear"],
    price: 60.00,
    oldPrice: 75.00,
    desc: "Sweatshirt à capuche confectionné en molleton lourd gratté. Poche kangourou et broderie minimaliste Shammah ton sur ton sur la poitrine.",
    image: "images/hoodie_pebble.png",
    variants: [
      { img: "images/hoodie_pebble.png", color: "#e3dfd5", name: "Galet" },
      { img: "images/hoodie_sage.png", color: "#5a6358", name: "Sauge" }
    ],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "tailored-chino",
    title: "Pantalon Chino Ajusté",
    categories: ["homme", "casual"],
    price: 70.00,
    oldPrice: 85.00,
    desc: "Pantalon en gabardine de coton stretch doux. Coupe ajustée contemporaine et poches passepoilées élégantes pour un look habillé ou décontracté.",
    image: "images/chino_sand.png",
    variants: [
      { img: "images/chino_sand.png", color: "#c5b398", name: "Sable Doré" },
      { img: "images/chino_navy.png", color: "#192231", name: "Bleu Marine" }
    ],
    sizes: ["30", "32", "34", "36"]
  },
  {
    id: "denim-jacket",
    title: "Veste Denim Brut",
    categories: ["homme", "casual"],
    price: 95.00,
    oldPrice: 115.00,
    desc: "Veste en jean classique en coton brut épais. Coutures contrastantes cuivrées et boutons métalliques gravés.",
    image: "images/denim_raw.png",
    variants: [
      { img: "images/denim_raw.png", color: "#22354c", name: "Indigo Brut" },
      { img: "images/denim_grey.png", color: "#1c1c1c", name: "Gris Brut" }
    ],
    sizes: ["M", "L", "XL"]
  },
  {
    id: "wool-blazer",
    title: "Blazer en Laine Structuré",
    categories: ["homme", "casual"],
    price: 160.00,
    oldPrice: 195.00,
    desc: "Veste tailleur structurée en fine laine mélangée. Col à revers crantés, fermeture à deux boutons et fente d'aisance au dos.",
    image: "images/blazer_anthracite.png",
    variants: [
      { img: "images/blazer_anthracite.png", color: "#2d2d30", name: "Anthracite" },
      { img: "images/blazer_camel.png", color: "#c19a6b", name: "Camel" }
    ],
    sizes: ["S", "M", "L", "XL"]
  },

  // --- ENFANT (4 Items) ---
  {
    id: "teddy-fleece",
    title: "Ensemble Polaire Teddy",
    categories: ["enfant", "casual"],
    price: 45.00,
    oldPrice: 55.00,
    desc: "Sweat-shirt et jogging assortis en polaire teddy ultra-moelleuse. Chauffe instantanément pour un maximum de confort au parc ou à la maison.",
    image: "images/teddy_brown.png",
    variants: [
      { img: "images/teddy_brown.png", color: "#8b5a2b", name: "Brun Nounours" },
      { img: "images/teddy_celadon.png", color: "#acbaa1", name: "Céladon" }
    ],
    sizes: ["2 ans", "4 ans", "6 ans"]
  },
  {
    id: "kids-dungarees",
    title: "Salopette en Denim Souple",
    categories: ["enfant", "casual"],
    price: 38.00,
    oldPrice: 48.00,
    desc: "Salopette classique pour enfant en denim de coton souple lavé. Bretelles ajustables et boutons pressions pour un habillage simple.",
    image: "images/dungarees_blue.png",
    variants: [
      { img: "images/dungarees_blue.png", color: "#3a6073", name: "Bleu Denim" },
      { img: "images/dungarees_pink.png", color: "#e8a7b5", name: "Rose Pâle" }
    ],
    sizes: ["2 ans", "3 ans", "4 ans", "5 ans"]
  },
  {
    id: "kids-striped-jumper",
    title: "Pull en Maille Rayé",
    categories: ["enfant", "casual"],
    price: 34.00,
    oldPrice: 42.00,
    desc: "Pull à col rond en maille de coton douillette avec motif rayé classique. Parfait pour les journées d'école fraîches.",
    image: "images/kids_jumper.png",
    variants: [
      { img: "images/kids_jumper.png", color: "#df7356", name: "Rayures Multi" }
    ],
    sizes: ["4 ans", "6 ans", "8 ans"]
  },
  {
    id: "linen-romper",
    title: "Barboteuse en Lin Bébé",
    categories: ["enfant", "casual"],
    price: 29.00,
    oldPrice: 35.00,
    desc: "Barboteuse d'été légère sans manches boutonnée à l'avant, fabriquée en lin et coton biologique respirant.",
    image: "images/product_orange.png",
    variants: [
      { img: "images/product_orange.png", color: "#dca738", name: "Moutarde" },
      { img: "images/product_grey.png", color: "#e2dacf", name: "Écru" }
    ],
    sizes: ["12 mois", "18 mois", "2 ans"]
  }
];

// 2. STATE MANAGEMENT
let cart = [];
let activeProduct = PRODUCTS[0];
let activeVariantIndex = 0;
let activeSize = "M";
let currentCategory = "femme"; // Default to femme
let searchQuery = "";
let currentSort = "default"; // Sorting state: default, low-high, high-low
let favorites = new Set(); // Product IDs the user has favorited (shared between grid & detail view)

// DOM Elements
const shopScreen = document.getElementById("shop-screen");
const productListContainer = document.getElementById("product-list-container");

// Cart Elements
const cartBackdrop = document.getElementById("cart-backdrop");
const cartPanel = document.getElementById("cart-panel");
const openCartBtn = document.getElementById("open-cart-btn");
const desktopCartBtn = document.getElementById("desktop-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalValue = document.getElementById("cart-total-value");
const cartBadgeMobile = document.getElementById("cart-counter-badge");
const cartBadgeDesktop = document.getElementById("desktop-cart-badge");

// Detail Overlay Elements
const detailBackdropOverlay = document.getElementById("detail-backdrop-overlay");
const detailScreen = document.getElementById("detail-screen");
const detailBackBtn = document.getElementById("detail-back-btn");
const desktopCloseDetailBtn = document.getElementById("desktop-close-detail");
const detailCartBtnMobile = document.querySelector(".detail-cart-btn-mobile");
const detailFavBtn = document.querySelector(".detail-fav-btn");

// Search Inputs
const mobileSearchInput = document.getElementById("mobile-search");
const desktopSearchInput = document.getElementById("desktop-search");

// Kids-only custom age input (static element, bound once below to avoid stacking listeners)
const customAgeInput = document.getElementById("custom-child-age");

// 3. RESPONSIVE INITIALIZATION & VIEWPORT setup
function isDesktop() {
  return window.innerWidth > 768;
}

function handleViewportSetup() {
  if (shopScreen) shopScreen.classList.add("active");
  
  if (isDesktop()) {
    if (detailBackdropOverlay && detailBackdropOverlay.classList.contains("active")) {
      detailBackdropOverlay.style.display = "flex";
    }
  } else {
    if (detailBackdropOverlay && detailBackdropOverlay.classList.contains("active")) {
      detailBackdropOverlay.style.display = "block";
    }
  }
  renderProducts();
}

// 4. RENDERING PRODUCTS & FILTERING
function renderProducts() {
  if (!productListContainer) return;
  productListContainer.innerHTML = "";
  
  // Filter products by category ("favoris" is a pseudo-category showing only favorited items)
  let filtered = currentCategory === "favoris"
    ? PRODUCTS.filter(p => favorites.has(p.id))
    : PRODUCTS.filter(p => p.categories.includes(currentCategory));

  // Sort by price if requested
  if (currentSort === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Search filter
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.desc.toLowerCase().includes(query)
    );
  }

  if (filtered.length === 0) {
    productListContainer.innerHTML = `
      <div class="cart-empty-state" style="grid-column: 1 / -1; padding: 60px 0; text-align: center;">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 48px; height: 48px; margin: 0 auto 16px auto; display: block; stroke: var(--text-secondary);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${currentCategory === "favoris" ? "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"}" />
        </svg>
        <p>${currentCategory === "favoris" ? "Vous n'avez pas encore ajouté de favoris." : "Aucun produit ne correspond à votre recherche ou catégorie."}</p>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.title}">
        <span class="badge-tag">${capitalizeFirst(product.categories[0])}</span>
        <button class="fav-btn${favorites.has(product.id) ? ' active' : ''}" data-id="${product.id}">
          <svg fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        <!-- Overlay summary -->
        <div class="product-card-overlay">
          <div class="product-info-texts">
            <h3>${product.title}</h3>
            <div class="product-prices">
              <span class="current-price">$${product.price.toFixed(2)}</span>
              <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
            </div>
          </div>
          <button class="add-cart-fast-btn" data-id="${product.id}">
            <svg fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    `;

    // Opens details on card click
    card.addEventListener("click", (e) => {
      if (e.target.closest(".fav-btn") || e.target.closest(".add-cart-fast-btn")) {
        return;
      }
      openProductDetails(product);
    });

    // Directly adds to cart from catalog card
    card.querySelector(".add-cart-fast-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product, product.variants[0], product.sizes[0] || "M");
    });

    // Favorite toggle button
    card.querySelector(".fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      const isActive = !favorites.has(product.id);
      if (isActive) {
        favorites.add(product.id);
      } else {
        favorites.delete(product.id);
      }

      // In the "Favoris" view, unfavoriting should drop the card from the list immediately
      if (currentCategory === "favoris" && !isActive) {
        renderProducts();
      } else {
        btn.classList.toggle("active", isActive);
      }

      // Keep the detail view's heart icon in sync if this same product is open there
      if (detailFavBtn && activeProduct && activeProduct.id === product.id) {
        detailFavBtn.classList.toggle("active", isActive);
      }

      showToast(isActive ? "Ajouté aux favoris !" : "Retiré des favoris");
    });

    productListContainer.appendChild(card);
  });
}

// Category Tabs Selection Handlers
document.querySelectorAll(".category-tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    const category = e.target.getAttribute("data-category");
    
    // Sync category active classes across all groups (mobile tab, desktop tab)
    document.querySelectorAll(".category-tab").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-category") === category);
    });

    // Sync desktop header links
    document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-category") === category);
    });

    currentCategory = category;
    setActiveBottomNavItem("nav-home-btn");
    renderProducts();

    if (isDesktop() && e.target.closest(".desktop-header")) {
      const catSec = document.getElementById("catalog-section");
      if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Sync desktop header links
document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    const category = e.target.getAttribute("data-category");
    if (!category) return;
    
    e.preventDefault();
    
    document.querySelectorAll(".desktop-nav .nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    document.querySelectorAll(".category-tab").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-category") === category);
    });

    currentCategory = category;
    setActiveBottomNavItem("nav-home-btn");
    renderProducts();

    const catSec = document.getElementById("catalog-section");
    if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
  });
});

// Search syncing
if (mobileSearchInput) {
  mobileSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (desktopSearchInput) desktopSearchInput.value = searchQuery;
    renderProducts();
  });
}

if (desktopSearchInput) {
  desktopSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (mobileSearchInput) mobileSearchInput.value = searchQuery;
    renderProducts();
  });
}

// Footer links filter category bindings
document.querySelectorAll(".category-filter-link").forEach(link => {
  link.addEventListener("click", (e) => {
    const category = e.target.getAttribute("data-category");
    if (category) {
      currentCategory = category;
      setActiveBottomNavItem("nav-home-btn");
      // Sync tabs
      document.querySelectorAll(".category-tab").forEach(t => {
        t.classList.toggle("active", t.getAttribute("data-category") === category);
      });
      document.querySelectorAll(".desktop-nav .nav-link").forEach(l => {
        l.classList.toggle("active", l.getAttribute("data-category") === category);
      });
      renderProducts();
    }
  });
});

// Helper capitalize
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 5. PRODUCT DETAILS INTERACTION
function openProductDetails(product) {
  activeProduct = product;
  activeVariantIndex = 0;
  activeSize = product.sizes[1] || product.sizes[0] || "M";

  // Specs bindings
  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-category").textContent = capitalizeFirst(product.categories[0]);
  document.getElementById("detail-current-price").textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("detail-old-price").textContent = `$${product.oldPrice.toFixed(2)}`;
  document.getElementById("detail-desc").textContent = product.desc;
  
  // Set Main gallery image
  document.getElementById("detail-main-img").src = product.image;

  // Sync the detail view's own heart icon with this product's favorited state
  if (detailFavBtn) detailFavBtn.classList.toggle("active", favorites.has(product.id));

  // Custom child age option display
  const sizeTitle = document.getElementById("detail-size-title");
  const customAgeGroup = document.getElementById("custom-age-group");

  if (product.categories.includes("enfant")) {
    if (sizeTitle) sizeTitle.textContent = "Âge de l'enfant";
    if (customAgeGroup) customAgeGroup.style.display = "block";
    if (customAgeInput) customAgeInput.value = "";
  } else {
    if (sizeTitle) sizeTitle.textContent = "Taille";
    if (customAgeGroup) customAgeGroup.style.display = "none";
  }

  // Render variant thumbnails circles
  const thumbsContainer = document.getElementById("detail-thumbnails-container");
  thumbsContainer.innerHTML = "";
  product.variants.forEach((v, index) => {
    const th = document.createElement("div");
    th.className = `variant-thumb ${index === 0 ? 'active' : ''}`;
    th.innerHTML = `<img src="${v.img}" alt="${v.name}">`;
    th.addEventListener("click", () => selectVariant(index));
    thumbsContainer.appendChild(th);
  });

  // Render size selectors
  const sizesContainer = document.getElementById("detail-sizes-container");
  sizesContainer.innerHTML = "";
  product.sizes.forEach(sz => {
    const btn = document.createElement("button");
    btn.className = `size-pill ${sz === activeSize ? 'active' : ''}`;
    btn.textContent = sz;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSize = sz;
      if (customAgeInput) {
        customAgeInput.value = ""; // Clear custom input if pill is clicked
      }
    });
    sizesContainer.appendChild(btn);
  });

  // Render color indicators
  const colorsContainer = document.getElementById("detail-colors-container");
  colorsContainer.innerHTML = "";
  product.variants.forEach((v, index) => {
    const dot = document.createElement("span");
    dot.className = `color-dot ${index === 0 ? 'active' : ''}`;
    dot.style.backgroundColor = v.color;
    dot.addEventListener("click", () => selectVariant(index));
    colorsContainer.appendChild(dot);
  });

  // Toggle detail backdrop overlay
  detailBackdropOverlay.classList.add("active");
  detailBackdropOverlay.style.display = isDesktop() ? "flex" : "block";
}

function selectVariant(index) {
  activeVariantIndex = index;
  const variant = activeProduct.variants[index];
  
  // Swap main image
  document.getElementById("detail-main-img").src = variant.img;
  
  // Swap thumbs active border
  document.querySelectorAll(".variant-thumb").forEach((th, idx) => {
    th.classList.toggle("active", idx === index);
  });

  // Swap color dots active border
  document.querySelectorAll(".color-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx === index);
  });

  showToast(`Couleur : ${variant.name}`);
}

function closeProductDetails() {
  detailBackdropOverlay.classList.remove("active");
  detailBackdropOverlay.style.display = "none";
}

// Bind back buttons
if (detailBackBtn) detailBackBtn.addEventListener("click", closeProductDetails);
if (desktopCloseDetailBtn) desktopCloseDetailBtn.addEventListener("click", closeProductDetails);

// Close modal when clicking outer backdrop area on PC
detailBackdropOverlay.addEventListener("click", (e) => {
  if (isDesktop() && e.target === detailBackdropOverlay) {
    closeProductDetails();
  }
});

// Custom child age input: bound once here (not inside openProductDetails) so a fresh
// listener isn't stacked on this static element every time a product detail is opened
if (customAgeInput) {
  customAgeInput.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val !== "") {
      document.querySelectorAll(".size-pill").forEach(b => b.classList.remove("active"));
      activeSize = val;
    } else {
      // Reset to default size from active pill
      const activePill = document.querySelector(".size-pill.active");
      if (activePill) {
        activeSize = activePill.textContent;
      } else {
        const firstPill = document.querySelector(".size-pill");
        if (firstPill) {
          firstPill.classList.add("active");
          activeSize = firstPill.textContent;
        }
      }
    }
  });
}

// Product detail favorite toggle (mobile header heart icon)
if (detailFavBtn) {
  detailFavBtn.addEventListener("click", () => {
    const isActive = !favorites.has(activeProduct.id);
    if (isActive) {
      favorites.add(activeProduct.id);
    } else {
      favorites.delete(activeProduct.id);
    }
    detailFavBtn.classList.toggle("active", isActive);

    // Keep the matching catalog card heart in sync if it's currently rendered
    const gridFavBtn = document.querySelector(`.fav-btn[data-id="${activeProduct.id}"]`);
    if (gridFavBtn) gridFavBtn.classList.toggle("active", isActive);

    showToast(isActive ? "Ajouté aux favoris !" : "Retiré des favoris");
  });
}

// 6. CART DRAWER OPERATIONS
function toggleCartDrawer(open) {
  if (open) {
    cartBackdrop.classList.add("active");
    cartPanel.classList.add("active");
    renderCart();
  } else {
    cartBackdrop.classList.remove("active");
    cartPanel.classList.remove("active");
  }
}

// Bind cart toggles
if (openCartBtn) openCartBtn.addEventListener("click", () => toggleCartDrawer(true));
if (desktopCartBtn) desktopCartBtn.addEventListener("click", () => toggleCartDrawer(true));
if (closeCartBtn) closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
if (cartBackdrop) cartBackdrop.addEventListener("click", () => toggleCartDrawer(false));

if (detailCartBtnMobile) {
  detailCartBtnMobile.addEventListener("click", () => {
    closeProductDetails();
    toggleCartDrawer(true);
  });
}

function addToCart(product, variant, size) {
  const existing = cart.find(item => 
    item.id === product.id && 
    item.variant.color === variant.color && 
    item.size === size
  );

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      variant: variant,
      size: size,
      qty: 1
    });
  }

  updateCartBadges();
  showToast(`${product.title} (${size}) ajouté au panier !`);
}

function updateCartBadges() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  
  const mobileCartBadgeDot = document.getElementById("mobile-cart-badge-dot");
  if (mobileCartBadgeDot) {
    mobileCartBadgeDot.textContent = totalQty;
    mobileCartBadgeDot.style.display = totalQty > 0 ? "flex" : "none";
  }

  if (cartBadgeMobile) {
    cartBadgeMobile.textContent = totalQty;
    cartBadgeMobile.style.display = totalQty > 0 ? "flex" : "none";
  }

  if (cartBadgeDesktop) {
    cartBadgeDesktop.textContent = totalQty;
    cartBadgeDesktop.style.display = totalQty > 0 ? "flex" : "none";
  }
}

function renderCart() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>Votre panier est vide</p>
      </div>
    `;
    cartTotalValue.textContent = "$0.00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    
    const subtotal = item.price * item.qty;
    total += subtotal;

    itemEl.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.variant.img}" alt="${item.title}">
      </div>
      <div class="cart-item-details">
        <div>
          <h4 class="cart-item-name">${item.title}</h4>
          <p class="cart-item-meta">Taille: ${item.size} | ${item.variant.name}</p>
        </div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-item-remove" data-index="${index}">
          <svg fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div class="quantity-control">
          <button class="quantity-btn dec" data-index="${index}">-</button>
          <span class="quantity-value">${item.qty}</span>
          <button class="quantity-btn inc" data-index="${index}">+</button>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(itemEl);
  });

  cartTotalValue.textContent = `$${total.toFixed(2)}`;

  // Bind Adjust Quantity Buttons
  document.querySelectorAll(".quantity-btn.dec").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      if (cart[idx].qty > 1) {
        cart[idx].qty--;
      } else {
        cart.splice(idx, 1);
      }
      updateCartBadges();
      renderCart();
    });
  });

  document.querySelectorAll(".quantity-btn.inc").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      cart[idx].qty++;
      updateCartBadges();
      renderCart();
    });
  });

  document.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-index"));
      cart.splice(idx, 1);
      updateCartBadges();
      renderCart();
      showToast("Article supprimé");
    });
  });
}

// Bind detail specs actions
document.getElementById("detail-add-cart-action").addEventListener("click", () => {
  addToCart(activeProduct, activeProduct.variants[activeVariantIndex], activeSize);
});

document.getElementById("detail-buy-now-action").addEventListener("click", () => {
  addToCart(activeProduct, activeProduct.variants[activeVariantIndex], activeSize);
  closeProductDetails();
  goToCheckout();
});

// 7. TOAST NOTIFICATION UTILITY
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// 9. PACKAGE TRACKING DRAWER OPERATIONS
const trackingTabBtn = document.getElementById("tracking-tab-btn");
const trackingBackdrop = document.getElementById("tracking-backdrop");
const trackingPanel = document.getElementById("tracking-panel");
const closeTrackingBtn = document.getElementById("close-tracking-btn");
const trackingSubmitBtn = document.getElementById("tracking-submit-btn");
const trackingInput = document.getElementById("tracking-input");
const trackingStepsContainer = document.getElementById("tracking-steps-container");

function toggleTrackingDrawer(open) {
  if (open) {
    if (trackingBackdrop) trackingBackdrop.classList.add("active");
    if (trackingPanel) trackingPanel.classList.add("active");
    if (trackingInput) trackingInput.value = "";
    if (trackingStepsContainer) trackingStepsContainer.style.display = "none";
  } else {
    if (trackingBackdrop) trackingBackdrop.classList.remove("active");
    if (trackingPanel) trackingPanel.classList.remove("active");
  }
}

if (trackingTabBtn) trackingTabBtn.addEventListener("click", () => toggleTrackingDrawer(true));
if (closeTrackingBtn) closeTrackingBtn.addEventListener("click", () => toggleTrackingDrawer(false));
if (trackingBackdrop) trackingBackdrop.addEventListener("click", () => toggleTrackingDrawer(false));

if (trackingSubmitBtn && trackingInput && trackingStepsContainer) {
  trackingSubmitBtn.addEventListener("click", () => {
    const val = trackingInput.value.trim();
    if (val === "") {
      showToast("Veuillez entrer un numéro de commande.");
      return;
    }
    showToast("Recherche de votre colis Shammah...");
    setTimeout(() => {
      trackingStepsContainer.style.display = "flex";
      showToast("Statut de votre commande récupéré !");
    }, 850);
  });
}

let promoDiscount = 0; // Global discount amount

function setCheckoutStep(stepNumber) {
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (!node) continue;
    node.classList.remove("active", "completed");
    if (i < stepNumber) node.classList.add("completed");
    else if (i === stepNumber) node.classList.add("active");
  }
  document.querySelectorAll(".step-connector").forEach((connector, idx) => {
    connector.classList.toggle("completed", idx < stepNumber - 1);
  });

  const step1Content = document.getElementById("checkout-step-1-content");
  const step2Content = document.getElementById("checkout-step-2-content");
  const step3Content = document.getElementById("checkout-step-3-content");
  if (step1Content) step1Content.style.display = stepNumber === 1 ? "block" : "none";
  if (step2Content) step2Content.style.display = stepNumber === 2 ? "block" : "none";
  if (step3Content) step3Content.style.display = stepNumber === 3 ? "block" : "none";
}

// Shared navigation used by both the cart drawer's checkout button and the
// product detail "Buy now" button, so both paths land on the same checkout state.
function goToCheckout() {
  if (cart.length === 0) {
    showToast("Votre panier est vide.");
    return;
  }
  // Transition to Checkout Screen
  toggleCartDrawer(false);

  const shopScreen = document.getElementById("shop-screen");
  const desktopHero = document.getElementById("desktop-hero");
  const checkoutScreen = document.getElementById("checkout-screen");

  if (shopScreen) shopScreen.style.display = "none";
  if (desktopHero) desktopHero.style.display = "none";
  if (checkoutScreen) checkoutScreen.style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Initialize step display
  setCheckoutStep(1);

  updateEstimatedDeliveryDate();
  renderCheckoutSummary();
}

document.getElementById("checkout-action-btn").addEventListener("click", goToCheckout);

// Function to calculate estimated delivery date
function updateEstimatedDeliveryDate() {
  const dateEl = document.getElementById("estimated-delivery-date");
  if (!dateEl) return;
  
  const expressChecked = document.getElementById("ship-method-express") && document.getElementById("ship-method-express").checked;
  const today = new Date();
  
  if (expressChecked) {
    // 1-3 days
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 3);
    
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    dateEl.textContent = `Livraison : ${minDate.toLocaleDateString('fr-FR', options)} - ${maxDate.toLocaleDateString('fr-FR', options)}`;
  } else {
    // 7-20 days
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 15);
    
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    dateEl.textContent = `Livraison : ${minDate.toLocaleDateString('fr-FR', options)} - ${maxDate.toLocaleDateString('fr-FR', options)}`;
  }
}

// Back Button from Checkout
const checkoutBackBtn = document.getElementById("checkout-back-btn");
if (checkoutBackBtn) {
  checkoutBackBtn.addEventListener("click", () => {
    const shopScreen = document.getElementById("shop-screen");
    const desktopHero = document.getElementById("desktop-hero");
    const checkoutScreen = document.getElementById("checkout-screen");
    
    if (shopScreen) shopScreen.style.display = "block";
    if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
    if (checkoutScreen) checkoutScreen.style.display = "none";
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Shipping method change handlers
const shipMethodFree = document.getElementById("ship-method-free");
const shipMethodExpress = document.getElementById("ship-method-express");
const shipFreeLabel = document.getElementById("ship-free-label");
const shipExpressLabel = document.getElementById("ship-express-label");

function updateShippingMethodSelection() {
  const isExpress = shipMethodExpress && shipMethodExpress.checked;
  if (shipFreeLabel) shipFreeLabel.classList.toggle("active", !isExpress);
  if (shipExpressLabel) shipExpressLabel.classList.toggle("active", isExpress);
  
  updateEstimatedDeliveryDate();
  renderCheckoutSummary();
}

if (shipMethodFree) shipMethodFree.addEventListener("change", updateShippingMethodSelection);
if (shipMethodExpress) shipMethodExpress.addEventListener("change", updateShippingMethodSelection);

// Promo code application
const promoCodeApplyBtn = document.getElementById("promo-code-apply-btn");
const promoCodeInput = document.getElementById("promo-code-input");
if (promoCodeApplyBtn && promoCodeInput) {
  promoCodeApplyBtn.addEventListener("click", () => {
    const code = promoCodeInput.value.trim().toUpperCase();
    if (code === "SHAMMAH10") {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      promoDiscount = subtotal * 0.1; // 10% off
      showToast("Code promo SHAMMAH10 appliqué ! (-10%)");
      renderCheckoutSummary();
    } else if (code === "") {
      showToast("Veuillez saisir un code promo.");
    } else {
      showToast("Code promo invalide.");
    }
  });
}

// --- Interactive 2-Step Checkout Event Handlers ---
const checkoutToPaymentBtn = document.getElementById("checkout-to-payment-btn");
const checkoutBackToStep1 = document.getElementById("checkout-back-to-step-1");
const checkoutShippingForm = document.getElementById("checkout-shipping-form");

if (checkoutToPaymentBtn) {
  checkoutToPaymentBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (checkoutShippingForm && !checkoutShippingForm.checkValidity()) {
      checkoutShippingForm.reportValidity();
      return;
    }
    
    // Read values
    const fname = document.getElementById("shipping-firstname").value;
    const lname = document.getElementById("shipping-lastname").value;
    const email = document.getElementById("shipping-email").value;
    const prefix = document.getElementById("phone-country-prefix").value;
    const phone = document.getElementById("shipping-phone").value;
    const city = document.getElementById("shipping-city").value;
    const state = document.getElementById("shipping-state").value;
    const zip = document.getElementById("shipping-zip").value;
    
    const fullnameEl = document.getElementById("recap-fullname");
    const emailEl = document.getElementById("recap-email");
    const addressTextEl = document.getElementById("recap-address-text");
    
    if (fullnameEl) fullnameEl.textContent = `${fname} ${lname}`;
    if (emailEl) emailEl.textContent = email;
    if (addressTextEl) addressTextEl.textContent = `${city}, ${state} ${zip} | Tél: ${prefix} ${phone}`;
    
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (checkoutBackToStep1) {
  checkoutBackToStep1.addEventListener("click", () => {
    setCheckoutStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Tab Switching (Mobile Money / Card)
const payTabBtns = document.querySelectorAll(".pay-tab-btn");
payTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    payTabBtns.forEach(b => {
      b.classList.remove("active");
      b.style.background = "transparent";
      b.style.color = "var(--text-secondary)";
    });
    btn.classList.add("active");
    btn.style.background = "#ffffff";
    btn.style.color = "var(--text-primary)";
    
    const type = btn.getAttribute("data-pay-type");
    const panelMomo = document.getElementById("payment-panel-momo");
    const panelCard = document.getElementById("payment-panel-card");
    
    if (type === "momo") {
      if (panelMomo) panelMomo.style.display = "block";
      if (panelCard) panelCard.style.display = "none";
    } else {
      if (panelMomo) panelMomo.style.display = "none";
      if (panelCard) panelCard.style.display = "block";
    }
  });
});

// Orange, MTN, Wave Operators cards selection
const momoOpCards = document.querySelectorAll(".momo-op-card");
momoOpCards.forEach(card => {
  card.addEventListener("click", () => {
    momoOpCards.forEach(c => {
      c.classList.remove("active");
      c.style.color = "var(--text-secondary)";
      c.style.borderColor = "var(--accent-light)";
    });
    card.classList.add("active");
    card.style.color = "var(--text-primary)";
    card.style.borderColor = "var(--text-primary)";
    
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// Credit Card dynamic input syncing
const cardInputNumber = document.getElementById("card-input-number");
const cardInputName = document.getElementById("card-input-name");
const cardInputExpiry = document.getElementById("card-input-expiry");
const cardInputCvv = document.getElementById("card-input-cvv");
const virtualCard = document.getElementById("virtual-card");

if (cardInputNumber) {
  cardInputNumber.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += value[i];
    }
    e.target.value = formatted;
    
    const disp = document.getElementById("card-num-display");
    if (disp) disp.textContent = formatted || "•••• •••• •••• ••••";
  });
}

if (cardInputName) {
  cardInputName.addEventListener("input", (e) => {
    const disp = document.getElementById("card-holder-display");
    if (disp) disp.textContent = e.target.value.toUpperCase() || "NOM COMPLET";
  });
}

if (cardInputExpiry) {
  cardInputExpiry.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
    
    const disp = document.getElementById("card-exp-display");
    if (disp) disp.textContent = value || "MM/AA";
  });
}

if (cardInputCvv) {
  cardInputCvv.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = value;
    
    const disp = document.getElementById("card-cvv-display");
    if (disp) disp.textContent = value || "•••";
  });
  
  cardInputCvv.addEventListener("focus", () => {
    if (virtualCard) virtualCard.style.transform = "rotateY(180deg)";
  });
  
  cardInputCvv.addEventListener("blur", () => {
    if (virtualCard) virtualCard.style.transform = "rotateY(0deg)";
  });
}

// MoMo simulated payment popup
const submitMomoBtn = document.getElementById("checkout-submit-momo-btn");
const momoPhoneInput = document.getElementById("momo-phone-number");
const momoSimModal = document.getElementById("momo-simulation-modal");

if (submitMomoBtn) {
  submitMomoBtn.addEventListener("click", () => {
    if (momoPhoneInput && momoPhoneInput.value.trim() === "") {
      showToast("Veuillez saisir votre numéro Mobile Money.");
      return;
    }
    
    const operator = document.querySelector('input[name="momo_operator"]:checked').value;
    const phone = momoPhoneInput.value;
    
    const simTitle = document.getElementById("momo-sim-title");
    const simText = document.getElementById("momo-sim-text");
    const simTimer = document.getElementById("momo-sim-timer");
    const simSpinner = document.getElementById("momo-sim-spinner");
    const simSuccess = document.getElementById("momo-sim-success-icon");
    
    if (simTitle) simTitle.textContent = "En attente de validation";
    if (simText) simText.textContent = `Veuillez accepter la transaction de débit sur votre mobile ${operator} (${phone}).`;
    if (simTimer) {
      simTimer.textContent = "15s";
      simTimer.style.display = "inline-block";
    }
    if (simSpinner) simSpinner.style.display = "block";
    if (simSuccess) simSuccess.style.display = "none";
    if (momoSimModal) momoSimModal.style.display = "flex";
    
    let secondsLeft = 15;
    const interval = setInterval(() => {
      secondsLeft--;
      if (simTimer) simTimer.textContent = `${secondsLeft}s`;
      
      // Auto-validate after 3 seconds
      if (secondsLeft === 12) {
        if (simSpinner) simSpinner.style.display = "none";
        if (simSuccess) simSuccess.style.display = "block";
        if (simTitle) simTitle.textContent = "Paiement validé !";
        if (simText) simText.textContent = "Votre transaction a été validée avec succès. Préparation de votre commande...";
        if (simTimer) simTimer.style.display = "none";
        
        // Reset Cart & Form state
        cart = [];
        promoDiscount = 0;
        if (promoCodeInput) promoCodeInput.value = "";
        if (checkoutShippingForm) checkoutShippingForm.reset();
        if (momoPhoneInput) momoPhoneInput.value = "";
        updateCartBadges();
      }
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (momoSimModal) momoSimModal.style.display = "none";
        
        // Back to Boutique
        const shopScreen = document.getElementById("shop-screen");
        const desktopHero = document.getElementById("desktop-hero");
        const checkoutScreen = document.getElementById("checkout-screen");
        
        if (shopScreen) shopScreen.style.display = "block";
        if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
        if (checkoutScreen) checkoutScreen.style.display = "none";
        
        showToast("Félicitations ! Votre commande Shammah a bien été enregistrée.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 1000);
  });
}

// Card payment submission
const submitCardBtn = document.getElementById("checkout-submit-card-btn");
if (submitCardBtn) {
  submitCardBtn.addEventListener("click", () => {
    const cardNum = document.getElementById("card-input-number").value;
    const cardName = document.getElementById("card-input-name").value;
    const cardExpiry = document.getElementById("card-input-expiry").value;
    const cardCvv = document.getElementById("card-input-cvv").value;
    
    if (cardNum.length < 15 || cardName.trim() === "" || cardExpiry.length < 5 || cardCvv.length < 3) {
      showToast("Veuillez remplir correctement tous les champs de votre carte.");
      return;
    }
    
    showToast("Traitement du paiement par carte bancaire...");
    submitCardBtn.disabled = true;
    submitCardBtn.textContent = "Traitement en cours...";
    
    setTimeout(() => {
      showToast("Paiement par carte validé !");
      submitCardBtn.disabled = false;
      submitCardBtn.textContent = "Confirmer le paiement par carte";
      
      // Reset State
      cart = [];
      promoDiscount = 0;
      if (promoCodeInput) promoCodeInput.value = "";
      if (checkoutShippingForm) checkoutShippingForm.reset();
      
      // Reset inputs card
      document.getElementById("card-input-number").value = "";
      document.getElementById("card-input-name").value = "";
      document.getElementById("card-input-expiry").value = "";
      document.getElementById("card-input-cvv").value = "";
      document.getElementById("card-num-display").textContent = "•••• •••• •••• ••••";
      document.getElementById("card-holder-display").textContent = "NOM COMPLET";
      document.getElementById("card-exp-display").textContent = "MM/AA";
      document.getElementById("card-cvv-display").textContent = "•••";
      
      updateCartBadges();
      
      const shopScreen = document.getElementById("shop-screen");
      const desktopHero = document.getElementById("desktop-hero");
      const checkoutScreen = document.getElementById("checkout-screen");
      
      if (shopScreen) shopScreen.style.display = "block";
      if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
      if (checkoutScreen) checkoutScreen.style.display = "none";
      
      showToast("Félicitations ! Votre commande Shammah a bien été enregistrée.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
  });
}

// Demo Autofill Trigger
const demoAutofillBtn = document.getElementById("demo-autofill-btn");
if (demoAutofillBtn) {
  demoAutofillBtn.addEventListener("click", () => {
    const addresses = [
      { fname: "Moussa", lname: "Diabaté", email: "moussa.dia@gmail.com", prefix: "+225", phone: "0758493021", city: "Abidjan", state: "Cocody", zip: "00225" },
      { fname: "Fatou", lname: "N'Diaye", email: "fatou.nd@yahoo.fr", prefix: "+221", phone: "776594830", city: "Dakar", state: "Plateau", zip: "00221" },
      { fname: "Koffi", lname: "Mensah", email: "koffi.mensah@outlook.com", prefix: "+229", phone: "95684730", city: "Cotonou", state: "Littoral", zip: "00229" }
    ];
    const addr = addresses[Math.floor(Math.random() * addresses.length)];
    
    document.getElementById("shipping-firstname").value = addr.fname;
    document.getElementById("shipping-lastname").value = addr.lname;
    document.getElementById("shipping-email").value = addr.email;
    document.getElementById("phone-country-prefix").value = addr.prefix;
    document.getElementById("shipping-phone").value = addr.phone;
    document.getElementById("shipping-city").value = addr.city;
    document.getElementById("shipping-state").value = addr.state;
    document.getElementById("shipping-zip").value = addr.zip;
    document.getElementById("shipping-desc").value = "Livrer à la réception, merci.";
    
    showToast("⚡ Formulaire pré-rempli avec des données de démonstration !");
  });
}

function renderCheckoutSummary() {
  const checkoutItemsList = document.getElementById("checkout-items-list");
  if (!checkoutItemsList) return;
  checkoutItemsList.innerHTML = "";

  let subtotal = 0;
  cart.forEach(item => {
    const itemSubtotal = item.price * item.qty;
    subtotal += itemSubtotal;

    const itemEl = document.createElement("div");
    itemEl.className = "checkout-cart-item";
    itemEl.innerHTML = `
      <div class="checkout-item-thumb-wrapper">
        <img src="${item.variant.img}" class="checkout-item-thumb" alt="${item.title}">
        <span class="checkout-item-qty-badge">${item.qty}</span>
      </div>
      <div class="checkout-item-info">
        <h4 class="checkout-item-title">${item.title}</h4>
        <p class="checkout-item-subtitle">${item.variant.name} | ${item.size}</p>
      </div>
      <span class="checkout-item-price">$${itemSubtotal.toFixed(2)}</span>
    `;
    checkoutItemsList.appendChild(itemEl);
  });

  // Shipping calculation
  let shippingCost = 0;
  if (shipMethodExpress && shipMethodExpress.checked) {
    shippingCost = 9.00;
  }

  // Taxes
  const estimatedTax = 5.00;

  // Total
  const total = subtotal + shippingCost + estimatedTax - promoDiscount;

  // Bind UI breakdown
  const subtotalValueEl = document.getElementById("checkout-subtotal-value");
  const shippingValueEl = document.getElementById("checkout-shipping-value");
  const taxValueEl = document.getElementById("checkout-tax-value");
  const totalValueEl = document.getElementById("checkout-total-value");

  if (subtotalValueEl) subtotalValueEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingValueEl) shippingValueEl.textContent = `$${shippingCost.toFixed(2)}`;
  if (taxValueEl) taxValueEl.textContent = `$${estimatedTax.toFixed(2)}`;
  
  if (totalValueEl) {
    if (promoDiscount > 0) {
      totalValueEl.innerHTML = `<span style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-secondary); margin-right: 6px;">$${(subtotal + shippingCost + estimatedTax).toFixed(2)}</span>$${total.toFixed(2)}`;
    } else {
      totalValueEl.textContent = `$${total.toFixed(2)}`;
    }
  }
}

document.getElementById("desktop-fav-btn").addEventListener("click", () => {
  const count = favorites.size;
  showToast(`Mes Favoris : ${count} article${count !== 1 ? "s" : ""} enregistré${count !== 1 ? "s" : ""}.`);
});

const desktopAboutLink = document.getElementById("desktop-about-link");
if (desktopAboutLink) {
  desktopAboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Shammah : Une marque née du minimalisme et du raffinement.");
  });
}

// Newsletter subscription
const newsletterSubmit = document.getElementById("newsletter-submit-btn");
const newsletterEmail = document.getElementById("newsletter-email");
if (newsletterSubmit && newsletterEmail) {
  newsletterSubmit.addEventListener("click", () => {
    const val = newsletterEmail.value;
    if (val.trim() === "" || !val.includes("@")) {
      showToast("Veuillez saisir un e-mail valide.");
      return;
    }
    showToast("Merci ! Vous êtes inscrit à la lettre Shammah.");
    newsletterEmail.value = "";
  });
}

// 10. MOBILE FILTER DRAWER OPERATIONS
const mobileFilterBtn = document.getElementById("mobile-filter-btn");
const filterBackdrop = document.getElementById("filter-backdrop");
const filterPanel = document.getElementById("filter-panel");
const closeFilterBtn = document.getElementById("close-filter-btn");
const applyFiltersBtn = document.getElementById("apply-filters-btn");
const sortOptions = document.querySelectorAll("#filter-sort-options .size-pill");

function toggleFilterDrawer(open) {
  if (open) {
    if (filterBackdrop) filterBackdrop.classList.add("active");
    if (filterPanel) filterPanel.classList.add("active");
  } else {
    if (filterBackdrop) filterBackdrop.classList.remove("active");
    if (filterPanel) filterPanel.classList.remove("active");
  }
}

if (mobileFilterBtn) mobileFilterBtn.addEventListener("click", () => toggleFilterDrawer(true));
if (closeFilterBtn) closeFilterBtn.addEventListener("click", () => toggleFilterDrawer(false));
if (filterBackdrop) filterBackdrop.addEventListener("click", () => toggleFilterDrawer(false));

// Sort pills toggling
sortOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    sortOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", () => {
    const activeSortPill = document.querySelector("#filter-sort-options .size-pill.active");
    if (activeSortPill) {
      currentSort = activeSortPill.getAttribute("data-sort");
    }
    renderProducts();
    toggleFilterDrawer(false);
    showToast("Filtres appliqués.");
  });
}

// 11. MOBILE NAVIGATION DRAWER OPERATIONS
const mobileHamburgerBtn = document.getElementById("mobile-hamburger-btn");
const navDrawer = document.getElementById("nav-drawer");
const navDrawerBackdrop = document.getElementById("nav-drawer-backdrop");
const closeNavDrawerBtn = document.getElementById("close-nav-drawer-btn");
const mobileCartToggleBtn = document.getElementById("mobile-cart-toggle-btn");
const mobileSearchToggleBtn = document.getElementById("mobile-search-toggle-btn");

function toggleNavDrawer(open) {
  if (open) {
    if (navDrawer) navDrawer.classList.add("active");
    if (navDrawerBackdrop) navDrawerBackdrop.classList.add("active");
  } else {
    if (navDrawer) navDrawer.classList.remove("active");
    if (navDrawerBackdrop) navDrawerBackdrop.classList.remove("active");
  }
}

if (mobileHamburgerBtn) {
  mobileHamburgerBtn.addEventListener("click", () => toggleNavDrawer(true));
}
if (closeNavDrawerBtn) {
  closeNavDrawerBtn.addEventListener("click", () => toggleNavDrawer(false));
}
if (navDrawerBackdrop) {
  navDrawerBackdrop.addEventListener("click", () => toggleNavDrawer(false));
}

// Mobile Classic Header actions
if (mobileCartToggleBtn) {
  mobileCartToggleBtn.addEventListener("click", () => toggleCartDrawer(true));
}

if (mobileSearchToggleBtn) {
  mobileSearchToggleBtn.addEventListener("click", () => {
    const searchInput = document.getElementById("mobile-search");
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// Drawer link click handlers
document.querySelectorAll(".nav-drawer-link").forEach(link => {
  link.addEventListener("click", (e) => {
    const category = e.target.getAttribute("data-category");
    if (category) {
      e.preventDefault();
      
      // Update active state in drawer links
      document.querySelectorAll(".nav-drawer-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      
      // Sync bottom category tabs
      document.querySelectorAll(".category-tab").forEach(t => {
        t.classList.toggle("active", t.getAttribute("data-category") === category);
      });
      
      // Sync desktop navigation links
      document.querySelectorAll(".desktop-nav .nav-link").forEach(l => {
        l.classList.toggle("active", l.getAttribute("data-category") === category);
      });

      currentCategory = category;
      setActiveBottomNavItem("nav-home-btn");
      renderProducts();
      toggleNavDrawer(false);

      // Scroll to catalog section
      const catSec = document.getElementById("catalog-section");
      if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
    }
  });
});

const mobileAboutLink = document.getElementById("mobile-about-link");
if (mobileAboutLink) {
  mobileAboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    toggleNavDrawer(false);
    showToast("Shammah : Une marque née du minimalisme et du raffinement.");
  });
}

const mobileTrackingLink = document.getElementById("mobile-tracking-link");
if (mobileTrackingLink) {
  mobileTrackingLink.addEventListener("click", (e) => {
    e.preventDefault();
    toggleNavDrawer(false);
    toggleTrackingDrawer(true);
  });
}

// 12. FLOATING BOTTOM NAV BAR (mobile)
function setActiveBottomNavItem(id) {
  document.querySelectorAll("#bottom-nav-bar .nav-item").forEach(btn => btn.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function scrollShopContentToTop() {
  const activeScreenContent = document.querySelector(".screen.active .screen-content");
  if (activeScreenContent) activeScreenContent.scrollTo({ top: 0, behavior: "smooth" });
}

// "Boutique" - leaves favorites view (if active) and scrolls back to the top of the shop
const navHomeBtn = document.getElementById("nav-home-btn");
if (navHomeBtn) {
  navHomeBtn.addEventListener("click", () => {
    if (currentCategory === "favoris") {
      currentCategory = "femme";
      document.querySelectorAll(".category-tab").forEach(t => t.classList.toggle("active", t.getAttribute("data-category") === "femme"));
      document.querySelectorAll(".desktop-nav .nav-link").forEach(l => l.classList.toggle("active", l.getAttribute("data-category") === "femme"));
      renderProducts();
    }
    setActiveBottomNavItem("nav-home-btn");
    scrollShopContentToTop();
  });
}

// "Favoris" - shows only the products the user has favorited, across all categories
const navFavoritesBtn = document.getElementById("nav-favorites-btn");
if (navFavoritesBtn) {
  navFavoritesBtn.addEventListener("click", () => {
    currentCategory = "favoris";
    document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".desktop-nav .nav-link").forEach(l => l.classList.remove("active"));
    setActiveBottomNavItem("nav-favorites-btn");
    renderProducts();
    scrollShopContentToTop();
  });
}

// "Suivi" - opens the existing order tracking drawer
const navTrackingBtn = document.getElementById("nav-tracking-btn");
if (navTrackingBtn) {
  navTrackingBtn.addEventListener("click", () => toggleTrackingDrawer(true));
}

// Window resize updates
window.addEventListener("resize", () => {
  handleViewportSetup();
});

// Initialize on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  handleViewportSetup();
  updateCartBadges();
});
