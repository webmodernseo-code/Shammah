"use client";

import React, { useState, useEffect, useRef } from "react";
import "../app/divinexpress.css";

// Interface definitions
interface Image {
  id: string;
  url: string;
  sortOrder: number;
}

interface Stock {
  id: string;
  size: string;
  quantity: number;
}

interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  images: Image[];
  stock: Stock[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  baseCurrency: string;
  categoryId: string;
  subcategoryId: string | null;
  category: Category;
  subcategory: Subcategory | null;
  variants: ProductVariant[];
}

interface CartItem {
  id: string; // unique cart item key
  productId: string;
  productTitle: string;
  price: number;
  variantId: string;
  colorName: string;
  colorHex: string;
  size: string;
  age: string;
  image: string;
  quantity: number;
}

interface StorefrontShellProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
}

export default function StorefrontShell({
  initialProducts,
  initialCategories,
  initialSubcategories,
}: StorefrontShellProps) {
  // State management
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [subcategories] = useState<Subcategory[]>(initialSubcategories);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentSubcategory, setCurrentSubcategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentSort, setCurrentSort] = useState<string>("default");

  // Selection states (Detail view)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0);
  const [activeSize, setActiveSize] = useState<string>("M");
  const [customAge, setCustomAge] = useState<string>("");

  // Drawers / overlays open states
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [trackingOpen, setTrackingOpen] = useState<boolean>(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);

  // Checkout Stepper states
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [shippingName, setShippingName] = useState<string>("");
  const [shippingEmail, setShippingEmail] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [shippingPhone, setShippingPhone] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<"free" | "express">("free");
  const [paymentType, setPaymentType] = useState<"momo" | "card">("momo");
  const [momoOperator, setMomoOperator] = useState<"Orange" | "MTN" | "Wave">("Orange");
  const [momoPhone, setMomoPhone] = useState<string>("");

  // Credit Card states
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardFlipped, setCardFlipped] = useState<boolean>(false);

  // Order submission states
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [processingTimer, setProcessingTimer] = useState<number>(5);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number } | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");

  // Tracking states
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Timer Countdown state (Seasonal promo banner)
  const [timerText, setTimerText] = useState<string>("02:00:00");

  // Toast notification state
  const [toastText, setToastText] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Refs for tracking search overlay typing
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial localstorage loading
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("divinexpress_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedFavs = localStorage.getItem("divinexpress_favorites");
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));
    } catch (e) {
      console.error("Local storage load failed:", e);
    }
  }, []);

  // 2. Localstorage persistence
  useEffect(() => {
    try {
      localStorage.setItem("divinexpress_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Local storage save failed:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("divinexpress_favorites", JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.error("Local storage save failed:", e);
    }
  }, [favorites]);

  // 3. Countdown timer execution
  useEffect(() => {
    let targetTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from mount
    const interval = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        targetTime = Date.now() + 2 * 60 * 60 * 1000; // Reset
        return;
      }
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimerText(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Focus mobile search input when overlay is triggered
  useEffect(() => {
    if (searchOverlayOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOverlayOpen]);

  // Helper: Format price formatting logic
  const formatPrice = (val: any) => {
    const num = typeof val === "number" ? val : Number(val);
    if (isNaN(num)) return "$0.00";
    if (num >= 1000) {
      return num.toLocaleString("fr-FR") + " FCFA";
    } else {
      return "$" + num.toFixed(2);
    }
  };

  // Helper: Display toast notification popup
  const showToast = (text: string) => {
    setToastText(text);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // State Mutators: Cart & Favorites
  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast("Retiré des favoris.");
      } else {
        next.add(productId);
        showToast("Ajouté aux favoris !");
      }
      return next;
    });
  };

  const handleAddToCart = (product: Product, variantIndex: number, size: string, age: string, directQuantity = 1) => {
    const variant = product.variants[variantIndex];
    if (!variant) return;

    const imgUrl = variant.images[0]?.url || "/images/placeholder.png";
    const cartItemId = `${product.id}-${variant.id}-${size}-${age || "none"}`;

    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.id === cartItemId);
      if (idx > -1) {
        const nextCart = [...prevCart];
        nextCart[idx].quantity += directQuantity;
        return nextCart;
      } else {
        return [
          ...prevCart,
          {
            id: cartItemId,
            productId: product.id,
            productTitle: product.title,
            price: product.basePrice,
            variantId: variant.id,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            size,
            age,
            image: imgUrl,
            quantity: directQuantity,
          },
        ];
      }
    });

    showToast("Produit ajouté au panier !");
  };

  const updateCartItemQuantity = (itemId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }
      return prev.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item));
    });
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (!appliedPromo) return subtotal;

    if (appliedPromo.type === "percent" || appliedPromo.type === "percentage") {
      return subtotal * (1 - appliedPromo.value / 100);
    }
    return Math.max(0, subtotal - appliedPromo.value);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    try {
      const res = await fetch("/api/public/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedPromo({
          code: data.code,
          type: data.discountType,
          value: Number(data.discountValue),
        });
        showToast("Code promo appliqué !");
      } else {
        showToast(data.error || "Code promo invalide");
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la validation");
    }
  };

  // State Mutators: Checkout order creation
  const handleCheckoutSubmit = async () => {
    if (!shippingName || !shippingEmail || !shippingAddress || !shippingPhone) {
      showToast("Veuillez remplir les informations de livraison.");
      return;
    }

    if (paymentType === "momo" && !momoPhone) {
      showToast("Veuillez saisir votre numéro Mobile Money.");
      return;
    }

    if (paymentType === "card" && (!cardNumber || !cardHolder || !cardExpiry || !cardCvv)) {
      showToast("Veuillez remplir les informations de votre carte.");
      return;
    }

    setIsProcessingPayment(true);
    setProcessingTimer(5);

    // Simulate OTP / SMS validation delay
    const countdown = setInterval(() => {
      setProcessingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // Prepare checkout payload matching our schema
      const payload = {
        clientName: shippingName,
        email: shippingEmail,
        address: shippingAddress,
        phone: shippingPhone,
        total: getCartTotal() + (shippingMethod === "express" ? 9 : 0),
        paymentMethod: paymentType === "card" ? "Carte Bancaire" : `${momoOperator} Money`,
        items: cart.map((item) => ({
          title: item.productTitle,
          price: item.price,
          variantName: item.colorName,
          size: item.size + (item.age ? ` (${item.age})` : ""),
          quantity: item.quantity,
          variantId: item.variantId,
        })),
      };

      // Call public checkout API
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        // Wait until spinner timer ends
        setTimeout(() => {
          setIsProcessingPayment(false);
          setOrderNumber(data.orderNumber);
          setCart([]); // Clear cart
          setAppliedPromo(null);
          setCheckoutStep(3); // Go to Success Screen
        }, 5000);
      } else {
        setTimeout(() => {
          setIsProcessingPayment(false);
          showToast(data.error || "Erreur lors de la création de la commande.");
        }, 5000);
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        setIsProcessingPayment(false);
        showToast("Erreur serveur de transaction.");
      }, 5000);
    }
  };

  // State Mutators: Live order tracking
  const handleTrackingSubmit = async () => {
    if (!trackingInput.trim()) return;
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      const res = await fetch(`/api/public/tracking?orderNumber=${trackingInput.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedOrder(data);
      } else {
        setTrackingError(data.error || "Commande introuvable");
      }
    } catch (e) {
      console.error(e);
      setTrackingError("Erreur lors de la recherche");
    }
  };

  // Autofill checkout details for easy demo
  const handleAutofillDemo = () => {
    setShippingName("Dorcas Koffi");
    setShippingEmail("dorcas@example.com");
    setShippingAddress("Cocody Boulevard Mermoz, Abidjan, Côte d'Ivoire");
    setShippingPhone("+225 07 48 89 22 11");
    setMomoPhone("07 48 89 22 11");
    setCardNumber("4000 1234 5678 9010");
    setCardHolder("Dorcas Koffi");
    setCardExpiry("12/28");
    setCardCvv("492");
    showToast("Formulaire de démo rempli !");
  };

  // Sorting and Filtering products array
  const getFilteredProducts = () => {
    let filtered = products.filter((p) => {
      const matchesCategory = !currentCategory
        ? true
        : currentCategory === "favoris"
        ? favorites.has(p.id)
        : p.category.slug === currentCategory;

      if (!matchesCategory) return false;

      if (currentSubcategory) {
        return p.subcategory?.slug === currentSubcategory;
      }
      return true;
    });

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    if (currentSort === "low-high") {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (currentSort === "high-low") {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    }

    return filtered;
  };

  const activeProductCategorySlug = activeProduct?.category.slug || "";
  const isKidsCategory = activeProductCategorySlug === "enfant" || activeProductCategorySlug === "kids";

  const cartTotalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="main-wrapper" id="main-container">
      {/* ==================== DESKTOP HEADER ==================== */}
      <header className="desktop-header">
        <div className="header-container">
          <a
            href="#"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              setCurrentCategory("");
              setCurrentSubcategory("");
              setCheckoutOpen(false);
            }}
          >
            DivinExpress
          </a>
          <nav className="desktop-nav">
            <a
              href="#"
              className={`nav-link ${currentCategory === "femme" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentCategory("femme");
                setCurrentSubcategory("");
                setCheckoutOpen(false);
              }}
            >
              Femme
            </a>
            <a
              href="#"
              className={`nav-link ${currentCategory === "homme" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentCategory("homme");
                setCurrentSubcategory("");
                setCheckoutOpen(false);
              }}
            >
              Homme
            </a>
            <a
              href="#"
              className={`nav-link ${currentCategory === "enfant" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentCategory("enfant");
                setCurrentSubcategory("");
                setCheckoutOpen(false);
              }}
            >
              Enfant
            </a>
          </nav>
          <div className="header-actions">
            <div className="search-box-desktop">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Rechercher des vêtements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="action-icon-btn" onClick={() => setTrackingOpen(true)} title="Suivi de colis">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </button>
            <button
              className="action-icon-btn"
              onClick={() => {
                setCurrentCategory("favoris");
                setCurrentSubcategory("");
                setCheckoutOpen(false);
              }}
              title="Favoris"
            >
              <svg
                fill={currentCategory === "favoris" ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="action-icon-btn" onClick={() => setCheckoutOpen(true)} title="Panier">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="cart-badge-dot">{cartTotalItemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== DESKTOP HERO SECTION ==================== */}
      {!checkoutOpen && (
        <section id="desktop-hero" className="desktop-hero">
          <div className="hero-container">
            <div className="hero-text-block">
              <span className="hero-subtitle">DIVINEXPRESS / Collection '26</span>
              <h1 className="hero-title">
                Discover Your
                <br />
                Unique Style
              </h1>
              <p className="hero-desc">
                Des silhouettes épurées conçues avec une exigence artisanale absolue. Une expression de confort et de
                minimalisme moderne pour votre garde-robe quotidienne.
              </p>
              <a
                href="#catalog-section"
                className="hero-cta-btn"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Découvrir la Collection
              </a>
            </div>
            <div className="hero-image-block">
              <img src="/images/onboarding.png" alt="Modèle DivinExpress Beige" />
            </div>
          </div>
        </section>
      )}

      {/* ==================== NAV DRAWER (SIDEBAR) ==================== */}
      <div className={`nav-drawer-overlay ${navDrawerOpen ? "active" : ""}`} onClick={() => setNavDrawerOpen(false)}>
        <div className={`nav-drawer ${navDrawerOpen ? "active" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3>Menu</h3>
            <button className="drawer-close-btn" onClick={() => setNavDrawerOpen(false)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="drawer-content">
            <a href="#" className="nav-drawer-link" onClick={(e) => { e.preventDefault(); setCurrentCategory(""); setNavDrawerOpen(false); }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>
              Accueil
            </a>
            
            <div className="drawer-menu-accordion" style={{ marginTop: 20 }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: 1, paddingBottom: 8, borderBottom: "1px solid var(--accent-light)", marginBottom: 12 }}>
                Catégories
              </div>
              {categories.map((cat) => (
                <div key={cat.id} className="accordion-item" style={{ borderBottom: "1.5px solid var(--accent-light)", paddingBottom: 6 }}>
                  <button 
                    className="accordion-header" 
                    onClick={() => {
                      setCurrentCategory(cat.slug);
                      setCurrentSubcategory("");
                      setNavDrawerOpen(false);
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 0", background: "transparent", border: "none", fontWeight: 700, fontFamily: "var(--font-inter)", fontSize: "0.95rem", color: "var(--text-primary)", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={cat.slug === "homme" ? "/images/category_man.png" : cat.slug === "femme" ? "/images/category_woman.png" : "/images/category_kid.png"} alt={cat.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      <span>{cat.name}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", borderTop: "1px solid var(--accent-light)", paddingTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <a href="#" className="nav-drawer-link" onClick={(e) => { e.preventDefault(); setTrackingOpen(true); setNavDrawerOpen(false); }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4v-4h-8v8z" /></svg>
                Suivi de commande
              </a>
              <a href="#" className="nav-drawer-link" onClick={(e) => { e.preventDefault(); setCurrentCategory("favoris"); setNavDrawerOpen(false); }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Mes Favoris
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MAIN VITRINE CATALOGUE ==================== */}
      {!checkoutOpen ? (
        <section id="shop-screen" className="screen active" style={{ width: "100%", display: "block" }}>
          {/* Mobile top bar */}
          <div className="mobile-top-bar mobile-only">
            <div className="promo-banner">
              <span className="banner-arrow">←</span>
              <span className="banner-text">Une question ? Visitez notre support</span>
              <span className="banner-arrow">→</span>
            </div>
            <header className="mobile-classic-header">
              <button className="mobile-menu-btn" onClick={() => setNavDrawerOpen(true)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <a
                href="#"
                className="mobile-logo"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentCategory("");
                  setCurrentSubcategory("");
                }}
              >
                DIVINEXPRESS
              </a>
              <div className="mobile-header-actions">
                <button className="mobile-action-btn" onClick={() => setTrackingOpen(true)}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4v-4h-8v8z"
                    />
                  </svg>
                </button>
                <button className="mobile-action-btn" onClick={() => setCartOpen(true)} style={{ position: "relative" }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="cart-badge-dot">{cartTotalItemCount}</span>
                </button>
              </div>
            </header>
          </div>

          {/* Catalog Title */}
          <div className="catalog-header-desktop desktop-only" id="catalog-section">
            <h2>Notre Collection</h2>
            <p>Des designs exclusifs et minimalistes pour tous vos besoins.</p>
          </div>

          {/* Dynamic category tabs */}
          <div className="categories-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", margin: "24px 0", padding: "0 16px", boxSizing: "border-box" }}>
            <div className="categories-scroll" id="dynamic-category-tabs" style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", width: "100%", maxWidth: 600 }}>
              <button
                className={`category-tab ${currentCategory === "" ? "active" : ""}`}
                onClick={() => {
                  setCurrentCategory("");
                  setCurrentSubcategory("");
                }}
              >
                <div className="category-circle-img">
                  <img src="/images/onboarding.png" alt="Tous" />
                </div>
                <span>Tous</span>
              </button>
              {categories
                .filter(cat => ["homme", "femme", "enfant"].includes(cat.slug))
                .map((cat) => (
                <button
                  key={cat.id}
                  className={`category-tab ${currentCategory === cat.slug ? "active" : ""}`}
                  onClick={() => {
                    setCurrentCategory(cat.slug);
                    setCurrentSubcategory("");
                  }}
                >
                  <div className="category-circle-img">
                    <img
                      src={
                        cat.slug === "homme"
                          ? "/images/category_man.png"
                          : cat.slug === "femme"
                          ? "/images/category_woman.png"
                          : "/images/category_kid.png"
                      }
                      alt={cat.name}
                    />
                  </div>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory sub-menu if category is selected */}
          {currentCategory && currentCategory !== "favoris" && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "-8px 0 24px 0", flexWrap: "wrap" }}>
              <button
                className={`size-pill ${currentSubcategory === "" ? "active" : ""}`}
                onClick={() => setCurrentSubcategory("")}
                style={{ width: "auto", height: 32, padding: "0 16px" }}
              >
                Tous
              </button>
              {subcategories
                .filter((sub) => {
                  const matchCat = categories.find((c) => c.slug === currentCategory);
                  return sub.categoryId === matchCat?.id;
                })
                .map((sub) => (
                  <button
                    key={sub.id}
                    className={`size-pill ${currentSubcategory === sub.slug ? "active" : ""}`}
                    onClick={() => setCurrentSubcategory(sub.slug)}
                    style={{ width: "auto", height: 32, padding: "0 16px" }}
                  >
                    {sub.name}
                  </button>
                ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="screen-content">
            <div className="products-wrapper">
              <div className="product-grid" id="product-list-container">
                {getFilteredProducts().map((product) => {
                  const firstVariant = product.variants[0];
                  const price = product.basePrice;
                  const originalPrice = price + 10; // Showcase discount
                  const imgUrl = firstVariant?.images[0]?.url || "/images/placeholder.png";

                  return (
                    <div
                      key={product.id}
                      className="product-card"
                      onClick={() => {
                        setActiveProduct(product);
                        setActiveVariantIndex(0);
                        setActiveSize("M");
                        setCustomAge("");
                      }}
                    >
                      <div className="product-image-container">
                        <img src={imgUrl} alt={product.title} />
                        <span className="badge-tag" style={{ textTransform: "capitalize" }}>{product.category.name}</span>
                        {product.promoCode && (
                          <span className="badge-tag" style={{ backgroundColor: "var(--accent-red)", color: "white", left: 16, top: 46, fontWeight: 700, textTransform: "uppercase" }}>
                            Code: {product.promoCode}
                          </span>
                        )}
                        <button
                          className={`fav-btn ${favorites.has(product.id) ? "active" : ""}`}
                          onClick={(e) => toggleFavorite(product.id, e)}
                        >
                          <svg fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        
                        {/* Overlay summary like original JS */}
                        <div className="product-card-overlay">
                          <div className="product-info-texts">
                            <h3>{product.title}</h3>
                            <div className="product-prices">
                              <span className="current-price">{formatPrice(price)}</span>
                              <span className="old-price">{formatPrice(originalPrice)}</span>
                            </div>
                          </div>
                          <button 
                            className="add-cart-fast-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, firstVariant, "M");
                              showToast("Ajouté au panier !");
                            }}
                          >
                            <svg fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {getFilteredProducts().length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
                  Aucun produit trouvé dans cette sélection.
                </div>
              )}
              {/* "Voir plus" button container */}
              {getFilteredProducts().length > 0 && (
                <div id="load-more-container" style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                  <button id="load-more-btn" style={{ padding: "12px 36px", borderRadius: 24, border: "1.5px solid var(--text-primary)", background: "transparent", color: "var(--text-primary)", fontFamily: "var(--font-inter)", fontSize: "0.95rem", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s ease" }}>Voir plus</button>
                </div>
              )}
            </div>

            {/* Promo banner countdown */}
            <section
              className="desktop-only"
              style={{
                background: "#111111",
                color: "#ffffff",
                padding: "60px 40px",
                marginTop: 80,
                borderRadius: 24,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                boxSizing: "border-box",
                maxWidth: 1200,
                width: "90%",
                marginLeft: "auto",
                marginRight: "auto",
                border: "1px solid #222222",
                position: "relative",
                overflow: "hidden",
                backgroundImage: "radial-gradient(circle at 80% 20%, #1e1b4b 0%, #111111 60%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  background: "#EF4444",
                  color: "#ffffff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 12,
                  letterSpacing: "0.5px",
                }}
              >
                Offre Limitée
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                  OFFRE DE SAISON DIVINEXPRESS
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "#a1a1aa", margin: 0 }}>
                  Profitez de 15% de réduction immédiate sur toute la collection artisanale.
                </p>
              </div>

              <div
                style={{
                  background: "#18181b",
                  border: "1px dashed #3f3f46",
                  borderRadius: 16,
                  padding: "14px 28px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", textTransform: "uppercase", color: "#71717a", fontWeight: 700, letterSpacing: 1 }}>
                  Votre Code :
                </span>
                <strong style={{ fontFamily: "var(--font-sans)", fontSize: "1.2rem", color: "#ffffff", letterSpacing: 2, fontWeight: 800 }}>
                  SHAMMAH15
                </strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "#71717a", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Temps restant :
                </span>
                <div style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", letterSpacing: 1 }}>
                  {timerText}
                </div>
              </div>
            </section>

            {/* FAQ section */}
            <section className="desktop-only" style={{ maxWidth: 800, width: "90%", margin: "80px auto 40px auto", padding: "0 24px", boxSizing: "border-box" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.4rem", fontWeight: 800, textAlign: "center", marginBottom: 30, letterSpacing: "-0.5px", textTransform: "uppercase", color: "var(--color-text-heading)" }}>
                Questions Fréquentes (FAQ)
              </h3>

              <div className="faq-container">
                <div className="faq-item">
                  <div className="faq-question">
                    <h4>Comment fonctionne la livraison ?</h4>
                  </div>
                  <div className="faq-answer" style={{ display: "block" }}>
                    <p>
                      Vos commandes sont expédiées sous 48 à 72 heures. Vous recevez un numéro de suivi par e-mail ou
                      SMS dès l'expédition pour suivre l'acheminement de votre colis en temps réel.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div className="faq-question">
                    <h4>Quels sont les moyens de paiement acceptés ?</h4>
                  </div>
                  <div className="faq-answer" style={{ display: "block" }}>
                    <p>
                      Nous acceptons les paiements mobiles les plus courants (Orange Money, MTN MoMo, Wave) ainsi que
                      les cartes bancaires internationales (Visa, Mastercard) pour des transactions 100% sécurisées.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div className="faq-question">
                    <h4>Puis-je retourner un produit ?</h4>
                  </div>
                  <div className="faq-answer" style={{ display: "block" }}>
                    <p>
                      Oui, absolument. Vous disposez d'un délai légal de 14 jours après réception de votre colis pour
                      nous renvoyer l'article dans son état neuf et d'origine pour obtenir un échange ou un
                      remboursement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="desktop-footer" style={{ background: "#111111", color: "#ffffff", padding: "60px 24px", marginTop: "auto", borderTop: "1px solid #222222", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              {/* Brand Header */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <a href="#" style={{ fontSize: "1.15rem", letterSpacing: 4, fontWeight: 800, color: "#ffffff", textDecoration: "none" }}>DIVINEXPRESS</a>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: 2, color: "#71717a" }}>Minimalisme & Raffinement</span>
              </div>
              {/* Divider */}
              <div style={{ width: 40, height: 1, backgroundColor: "#27272a" }}></div>
              {/* Political & Legal Links */}
              <div style={{ display: "flex", gap: 28, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <a href="#" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1, color: "#a1a1aa", textDecoration: "none", fontWeight: 600 }}>Politique de Confidentialité</a>
                <a href="#" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1, color: "#a1a1aa", textDecoration: "none", fontWeight: 600 }}>Conditions Générales de Vente</a>
                <a href="#" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1, color: "#a1a1aa", textDecoration: "none", fontWeight: 600 }}>Mentions Légales</a>
              </div>
              {/* Social Icons (TikTok, Instagram, Facebook) */}
              <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "center" }}>
                <a href="#" style={{ color: "#ffffff", opacity: 0.7, display: "inline-flex" }}>
                  <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.15-.15-.24-.22v6.52c-.03 2.32-.87 4.67-2.61 6.2-1.92 1.76-4.76 2.34-7.22 1.62-2.88-.8-5.08-3.41-5.32-6.42-.31-3.62 2.12-7.14 5.71-7.79.92-.17 1.87-.14 2.79.08V12.2c-.89-.25-1.89-.13-2.67.38-.97.62-1.5 1.76-1.4 2.89.09 1.48 1.25 2.74 2.73 2.84 1.5.11 2.94-1.01 3.07-2.51.04-1.42.02-2.85.03-4.28V0h.01z"/>
                  </svg>
                </a>
                <a href="#" style={{ color: "#ffffff", opacity: 0.7, display: "inline-flex" }}>
                  <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" style={{ color: "#ffffff", opacity: 0.7, display: "inline-flex" }}>
                  <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
              {/* Payment Methods & Secure Label */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  <span className="payment-method-pill" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", color: "#d4d4d8", border: "1px solid #27272a", background: "#18181b", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>Orange Money</span>
                  <span className="payment-method-pill" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", color: "#d4d4d8", border: "1px solid #27272a", background: "#18181b", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>MTN MoMo</span>
                  <span className="payment-method-pill" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", color: "#d4d4d8", border: "1px solid #27272a", background: "#18181b", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>Wave</span>
                  <span className="payment-method-pill" style={{ fontFamily: "var(--font-inter)", fontSize: "0.68rem", color: "#d4d4d8", border: "1px solid #27272a", background: "#18181b", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>Visa / Mastercard</span>
                </div>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.62rem", color: "#52525b", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Paiement Sécurisé</span>
              </div>
              {/* Copyright */}
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.65rem", color: "#52525b", margin: 0, letterSpacing: 0.5 }}>&copy; 2026 DIVINEXPRESS. Tous droits réservés.</p>
            </footer>
          </div>

          {/* Floating Mobile Bottom Navigation */}
          <nav className="bottom-nav-bar mobile-only" id="bottom-nav-bar" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", justifyItems: "center", alignItems: "center" }}>
            <button className="nav-item active" onClick={() => { setCurrentCategory(""); setCurrentSubcategory(""); }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
              </svg>
              <span className="nav-label">Home</span>
            </button>
            <button className="nav-item" onClick={() => setSearchOverlayOpen(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="nav-label">Recherche</span>
            </button>
            <button className="nav-item" onClick={() => { setCurrentCategory("favoris"); setCurrentSubcategory(""); }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="nav-label">Favoris</span>
            </button>
          </nav>
        </section>
      ) : (
        /* ==================== 8. CHECKOUT SCREEN ==================== */
        <section id="checkout-screen" className="checkout-screen-container" style={{ display: "block" }}>
          <div className="checkout-wrapper">
            <span className="checkout-logo">DIVINEXPRESS</span>
            <div className="checkout-back-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <button className="btn-back-boutique" onClick={() => setCheckoutOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Retour à la boutique
              </button>

              {checkoutStep < 3 && (
                <button className="btn-demo-autofill" onClick={handleAutofillDemo}>
                  ⚡ Remplir démo
                </button>
              )}
            </div>

            <div className="checkout-columns">
              {/* Left Column: Shipping & Payment Steps */}
              <div className="checkout-left-col">
                {/* Stepper Node Indicator */}
                <div className="checkout-breadcrumbs" id="checkout-stepper">
                  <div className={`step-node ${checkoutStep >= 1 ? "active" : ""}`} id="step-node-1">
                    <span className="step-circle">
                      {checkoutStep > 1 ? (
                        <svg className="step-check" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <span className="step-number">1</span>
                      )}
                    </span>
                    <span className="step-label">Livraison</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step-node ${checkoutStep >= 2 ? "active" : ""}`} id="step-node-2">
                    <span className="step-circle">
                      {checkoutStep > 2 ? (
                        <svg className="step-check" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <span className="step-number">2</span>
                      )}
                    </span>
                    <span className="step-label">Paiement</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step-node ${checkoutStep >= 3 ? "active" : ""}`} id="step-node-3">
                    <span className="step-circle">
                      <span className="step-number">3</span>
                    </span>
                    <span className="step-label">Terminé</span>
                  </div>
                </div>

                {/* STEP 1: SHIPPING INFORMATION */}
                {checkoutStep === 1 && (
                  <div className="checkout-step-content" id="checkout-step-1-content">
                    <div className="checkout-card">
                      <h3>Adresse de livraison</h3>
                      <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setCheckoutStep(2); }}>
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label htmlFor="shipping-fullname">Nom et Prénom*</label>
                          <input
                            type="text"
                            placeholder="Ex: Koffi Mensah"
                            value={shippingName}
                            onChange={(e) => setShippingName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label htmlFor="shipping-email">E-mail*</label>
                          <input
                            type="email"
                            placeholder="koffi.mensah@outlook.com"
                            value={shippingEmail}
                            onChange={(e) => setShippingEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label htmlFor="shipping-phone">Numéro de Téléphone*</label>
                          <input
                            type="text"
                            placeholder="+225 07 00 00 00"
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="shipping-address">Adresse complète (Rue, Ville, Pays)*</label>
                          <input
                            type="text"
                            placeholder="Ex: Rue de la Paix, Abidjan, Côte d'Ivoire"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            required
                          />
                        </div>
                      </form>
                    </div>

                    <div className="checkout-card">
                      <h3>Méthode de livraison</h3>
                      <div className="shipping-options-grid">
                        <label className={`shipping-option-card ${shippingMethod === "free" ? "active" : ""}`}>
                          <input
                            type="radio"
                            name="shipping_method"
                            value="free"
                            checked={shippingMethod === "free"}
                            onChange={() => setShippingMethod("free")}
                          />
                          <div className="option-details">
                            <span className="option-title">Livraison Standard</span>
                            <span className="option-time">7-14 jours</span>
                          </div>
                          <span className="option-price">Gratuit</span>
                        </label>
                        <label className={`shipping-option-card ${shippingMethod === "express" ? "active" : ""}`}>
                          <input
                            type="radio"
                            name="shipping_method"
                            value="express"
                            checked={shippingMethod === "express"}
                            onChange={() => setShippingMethod("express")}
                          />
                          <div className="option-details">
                            <span className="option-title">Livraison Express</span>
                            <span className="option-time">1-3 jours</span>
                          </div>
                          <span className="option-price">$9.00</span>
                        </label>
                      </div>
                    </div>

                    <button className="btn-checkout-submit" onClick={() => setCheckoutStep(2)}>
                      Continuer vers le paiement
                    </button>
                  </div>
                )}

                {/* STEP 2: PAYMENT METHOD */}
                {checkoutStep === 2 && !isProcessingPayment && (
                  <div className="checkout-step-content" id="checkout-step-2-content">
                    <div className="address-recap-card" style={{ background: "#ffffff", borderRadius: 22, padding: 20, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1.5px solid var(--accent-light)" }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-primary)" }}>
                        <strong style={{ display: "block", fontSize: "0.9rem", marginBottom: 4 }}>Livraison à :</strong>
                        <span style={{ fontWeight: 600 }}>{shippingName}</span> ({shippingEmail})<br />
                        <span style={{ color: "var(--text-secondary)" }}>{shippingAddress}</span>
                      </div>
                      <button onClick={() => setCheckoutStep(1)} style={{ background: "var(--accent-light)", border: "none", fontSize: "0.75rem", fontWeight: 700, padding: "8px 14px", borderRadius: 12, cursor: "pointer" }}>Modifier</button>
                    </div>

                    <div className="checkout-card" id="payment-card">
                      <h3>Méthode de paiement</h3>
                      <div className="payment-method-selector">
                        <button className={`payment-method-card ${paymentType === "momo" ? "active" : ""}`} onClick={() => setPaymentType("momo")}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2" /></svg>
                          <span>Mobile Money</span>
                        </button>
                        <button className={`payment-method-card ${paymentType === "card" ? "active" : ""}`} onClick={() => setPaymentType("card")}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 10h20" /></svg>
                          <span>Carte Bancaire</span>
                        </button>
                      </div>

                      {/* Mobile Money Operator Select */}
                      {paymentType === "momo" && (
                        <div className="payment-form-panel">
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>Sélectionnez votre opérateur Mobile Money local.</p>
                          <div className="momo-operators-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                            <label className={`momo-op-card ${momoOperator === "Orange" ? "active" : ""}`} onClick={() => setMomoOperator("Orange")}>
                              <svg viewBox="0 0 40 40" width="36" height="36" style={{ borderRadius: 8, marginBottom: 4 }}>
                                <rect width="40" height="40" rx="8" fill="#FF7900" />
                                <path d="M12 28h16V12H12v16zm2-14h12v12H14V14z" fill="#ffffff" />
                              </svg>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Orange</span>
                            </label>
                            <label className={`momo-op-card ${momoOperator === "MTN" ? "active" : ""}`} onClick={() => setMomoOperator("MTN")}>
                              <svg viewBox="0 0 40 40" width="36" height="36" style={{ borderRadius: 8, marginBottom: 4 }}>
                                <rect width="40" height="40" rx="8" fill="#FFCC00" />
                                <ellipse cx="20" cy="20" rx="14" ry="10" fill="#003399" />
                                <text x="20" y="23" dominantBaseline="middle" textAnchor="middle" fill="#FFCC00" fontFamily="sans-serif" fontWeight="900" fontSize="8">MTN</text>
                              </svg>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>MTN</span>
                            </label>
                            <label className={`momo-op-card ${momoOperator === "Wave" ? "active" : ""}`} onClick={() => setMomoOperator("Wave")}>
                              <svg viewBox="0 0 40 40" width="36" height="36" style={{ borderRadius: 8, marginBottom: 4 }}>
                                <rect width="40" height="40" rx="8" fill="#1B4ECF" />
                                <path d="M10 24c4-6 6-6 10 0s6 6 10 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
                              </svg>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Wave</span>
                            </label>
                          </div>

                          <div className="form-group">
                            <label htmlFor="momo-phone-number">Numéro associé à votre compte*</label>
                            <input
                              type="tel"
                              placeholder="07 00 00 00"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              style={{ marginTop: 6 }}
                            />
                          </div>

                          <button className="btn-checkout-submit" onClick={handleCheckoutSubmit} style={{ marginTop: 24 }}>
                            Valider le paiement {momoOperator} Money
                          </button>
                        </div>
                      )}

                      {/* Credit Card inputs */}
                      {paymentType === "card" && (
                        <div className="payment-form-panel">
                          {/* Credit Card Graphic mockup */}
                          <div className="credit-card-container" style={{ perspective: 1000, width: "100%", display: "flex", justifyContent: "center", marginBottom: 24 }}>
                            <div className="virtual-credit-card" style={{ transform: cardFlipped ? "rotateY(180deg)" : "none", width: "100%", maxWidth: 320, height: 190, borderRadius: 16, position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s", color: "#ffffff", fontFamily: "monospace", background: "linear-gradient(135deg, #1f1f1f 0%, #3d3d3d 100%)" }}>
                              
                              {/* Front */}
                              <div className="virtual-card-side card-front" style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div className="card-chip" style={{ width: 44, height: 32, background: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)", borderRadius: 6 }}></div>
                                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>DIVINEXPRESS</span>
                                </div>
                                <div style={{ fontSize: "1.15rem", letterSpacing: 2 }}>{cardNumber || "•••• •••• •••• ••••"}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                  <div>
                                    <span style={{ fontSize: "0.5rem", textTransform: "uppercase", display: "block" }}>Titulaire</span>
                                    <span style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>{cardHolder || "NOM COMPLET"}</span>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: "0.5rem", textTransform: "uppercase", display: "block" }}>Expire</span>
                                    <span>{cardExpiry || "MM/AA"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Back */}
                              <div className="virtual-card-side card-back" style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", transform: "rotateY(180deg)", padding: "20px 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div style={{ width: "100%", height: 40, background: "#000000", marginTop: 10 }}></div>
                                <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                  <span style={{ fontSize: "0.5rem" }}>CVV</span>
                                  <div style={{ background: "#ffffff", color: "#000000", padding: "4px 10px", borderRadius: 4, fontWeight: "bold" }}>{cardCvv || "•••"}</div>
                                </div>
                                <div style={{ padding: "0 24px", fontSize: "0.45rem", opacity: 0.5 }}>Simulation de transaction sécurisée.</div>
                              </div>
                            </div>
                          </div>

                          <div className="card-inputs-grid">
                            <div className="form-group">
                              <label>Numéro de carte*</label>
                              <input
                                type="text"
                                placeholder="4000 1234 5678 9010"
                                value={cardNumber}
                                onFocus={() => setCardFlipped(false)}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                            </div>
                            <div className="form-group" style={{ marginTop: 12 }}>
                              <label>Nom complet du titulaire*</label>
                              <input
                                type="text"
                                placeholder="Ex: Koffi Mensah"
                                value={cardHolder}
                                onFocus={() => setCardFlipped(false)}
                                onChange={(e) => setCardHolder(e.target.value)}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                              <div className="form-group" style={{ flex: 1 }}>
                                <label>Expiration*</label>
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  value={cardExpiry}
                                  onFocus={() => setCardFlipped(false)}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                />
                              </div>
                              <div className="form-group" style={{ flex: 1 }}>
                                <label>CVV*</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  value={cardCvv}
                                  onFocus={() => setCardFlipped(true)}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          <button className="btn-checkout-submit" onClick={handleCheckoutSubmit} style={{ marginTop: 24 }}>
                            Valider le paiement par Carte
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* INLINE PAYMENT PROCESSING STATE */}
                {isProcessingPayment && (
                  <div className="checkout-card" style={{ display: "flex", textAlign: "center", padding: "48px 32px", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, minHeight: 380 }}>
                    <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                      <div style={{ position: "absolute", width: "100%", height: "100%", border: "4px solid var(--accent-light)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 1s infinite linear" }}></div>
                      <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>{processingTimer}s</span>
                    </div>
                    <h4>Traitement de votre paiement...</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Veuillez valider la notification mobile reçue sur votre téléphone.</p>
                  </div>
                )}

                {/* STEP 3: ORDER CONFIRMATION */}
                {checkoutStep === 3 && (
                  <div className="checkout-step-content">
                    <div className="checkout-card checkout-success-card" style={{ textAlign: "center" }}>
                      <div className="checkout-success-icon" style={{ background: "#4caf50", color: "#ffffff", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 36, height: 36 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3>Commande confirmée !</h3>
                      <p style={{ fontSize: "1.1rem", margin: "8px 0" }}>Commande : <strong>{orderNumber}</strong></p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 24 }}>
                        Merci pour votre achat chez DivinExpress ! Vous pouvez suivre le statut de votre colis à tout moment avec ce numéro de commande.
                      </p>
                      <button className="btn-checkout-submit" onClick={() => setCheckoutOpen(false)}>
                        Continuer mes achats
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Cart summary */}
              <div className="checkout-right-col">
                <div className="checkout-card summary-card">
                  <h3>Votre Panier</h3>
                  <div className="checkout-cart-items">
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: "flex", gap: 12, borderBottom: "1px solid #f3f4f6", padding: "10px 0" }}>
                        <img src={item.image} alt={item.productTitle} style={{ width: 44, height: 58, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.productTitle}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            Color: {item.colorName} | Taille: {item.size} {item.age && `(${item.age})`}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                            {item.quantity} x {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {checkoutStep < 3 && (
                    <div className="promo-code-box" style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <input
                        type="text"
                        placeholder="Code promo"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        style={{ flex: 1, border: "1px solid var(--accent-light)", padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem" }}
                      />
                      <button onClick={handleApplyPromoCode} style={{ background: "var(--accent-dark)", color: "#ffffff", border: "none", padding: "0 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
                        Appliquer
                      </button>
                    </div>
                  )}

                  {appliedPromo && (
                    <div style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: "bold", marginTop: 8 }}>
                      ✓ Code {appliedPromo.code} appliqué (-
                      {appliedPromo.type === "percent" || appliedPromo.type === "percentage"
                        ? `${appliedPromo.value}%`
                        : formatPrice(appliedPromo.value)}
                      )
                    </div>
                  )}

                  <div className="summary-breakdown" style={{ marginTop: 20 }}>
                    <div className="breakdown-row">
                      <span>Sous-total</span>
                      <span>{formatPrice(cart.reduce((acc, item) => acc + item.price * item.quantity, 0))}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Livraison</span>
                      <span>{shippingMethod === "express" ? "$9.00" : "Gratuit"}</span>
                    </div>
                    {appliedPromo && (
                      <div className="breakdown-row" style={{ color: "#22c55e" }}>
                        <span>Remise</span>
                        <span>
                          -
                          {appliedPromo.type === "percent" || appliedPromo.type === "percentage"
                            ? `${(cart.reduce((acc, item) => acc + item.price * item.quantity, 0) * (appliedPromo.value / 100)).toFixed(2)} $`
                            : `${appliedPromo.value} $`}
                        </span>
                      </div>
                    )}
                    <div className="divider"></div>
                    <div className="breakdown-row total-row">
                      <span>Total</span>
                      <span className="grand-total">{formatPrice(getCartTotal() + (shippingMethod === "express" ? 9 : 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 3. PRODUCT DETAIL OVERLAY ==================== */}
      {activeProduct && (
        <div className="detail-backdrop active" id="detail-backdrop-overlay" style={{ display: "flex" }}>
          <section id="detail-screen" className="detail-container">
            {/* Close buttons */}
            <button className="desktop-close-detail-btn desktop-only" onClick={() => setActiveProduct(null)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="detail-header mobile-only">
              <button className="header-round-btn" onClick={() => setActiveProduct(null)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="detail-right-actions">
                <button className="header-round-btn detail-fav-btn" onClick={() => toggleFavorite(activeProduct.id)}>
                  <svg fill={favorites.has(activeProduct.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" style={{ color: favorites.has(activeProduct.id) ? "#ef4444" : "inherit" }}>
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Gallery / Image Display */}
            <div className="detail-image-gallery">
              <img src={activeProduct.variants[activeVariantIndex]?.images[0]?.url || "/images/placeholder.png"} alt={activeProduct.title} />
              
              {/* Carousel of alternative thumbnails */}
              <div className="detail-variants-carousel">
                {activeProduct.variants.map((v, i) => (
                  <img
                    key={v.id}
                    src={v.images[0]?.url || "/images/placeholder.png"}
                    alt={v.colorName}
                    className={`variant-thumb ${i === activeVariantIndex ? "active" : ""}`}
                    onClick={() => {
                      setActiveVariantIndex(i);
                      setActiveSize("M");
                      setCustomAge("");
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Spec Sheet pane */}
            <div className="detail-spec-sheet">
              <div>
                <div className="detail-spec-header">
                  <div className="detail-title-block">
                    <h2>{activeProduct.title}</h2>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="badge-tag">{activeProduct.category.name}</div>
                  </div>
                </div>

                <div className="detail-price-block" style={{ textAlign: "left", marginBottom: 16 }}>
                  <div className="product-prices">
                    <span className="current-price">{formatPrice(activeProduct.basePrice)}</span>
                    <span className="old-price">{formatPrice(activeProduct.basePrice + 10)}</span>
                  </div>
                </div>

                <p className="detail-description">{activeProduct.description}</p>

                {/* Option Pickers */}
                <div className="options-selectors" style={{ marginTop: 24 }}>
                  <div className="option-group">
                    <h5 className="option-title">Taille</h5>
                    <div className="option-pills">
                      {["S", "M", "L"].map((sz) => (
                        <button
                          key={sz}
                          className={`size-pill ${activeSize === sz ? "active" : ""}`}
                          onClick={() => setActiveSize(sz)}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    {/* Custom Child Age Input (Child categories only) */}
                    {isKidsCategory && (
                      <div className="custom-age-input-group" style={{ display: "block", width: "100%", marginTop: 12 }}>
                        <input
                          type="text"
                          placeholder="Ou saisir un âge exact (Ex: 6 ans, 18 mois)"
                          value={customAge}
                          onChange={(e) => setCustomAge(e.target.value)}
                          style={{
                            width: "100%",
                            height: 38,
                            borderRadius: 19,
                            border: "1.5px solid var(--accent-light)",
                            padding: "0 16px",
                            outline: "none",
                            fontSize: "0.8rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="option-group" style={{ marginTop: 16 }}>
                    <h5 className="option-title">Couleur</h5>
                    <div className="option-pills" style={{ display: "flex", gap: 8, alignItems: "center", height: 38 }}>
                      {activeProduct.variants.map((v, i) => (
                        <span
                          key={v.id}
                          className={`color-dot ${i === activeVariantIndex ? "active" : ""}`}
                          style={{ backgroundColor: v.colorHex, border: "1px solid #d1d5db", width: 24, height: 24, display: "inline-block", borderRadius: "50%", cursor: "pointer" }}
                          onClick={() => setActiveVariantIndex(i)}
                          title={v.colorName}
                        ></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout actions */}
              <div className="detail-actions-footer" style={{ marginTop: 32 }}>
                <button
                  className="btn-add-cart"
                  onClick={() => {
                    handleAddToCart(activeProduct, activeVariantIndex, activeSize, customAge);
                    setActiveProduct(null);
                  }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Ajouter au panier
                </button>
                <button
                  className="btn-buy-now"
                  onClick={() => {
                    handleAddToCart(activeProduct, activeVariantIndex, activeSize, customAge);
                    setActiveProduct(null);
                    setCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                >
                  Acheter maintenant
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ==================== 4. CART DRAWER ==================== */}
      {cartOpen && (
        <>
          <div className="cart-drawer-backdrop" onClick={() => setCartOpen(false)} style={{ display: "block" }}></div>
          <div className="cart-drawer" style={{ display: "flex", flexDirection: "column" }}>
            <div className="cart-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h3>Mon Panier</h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} style={{ background: "transparent", border: "none", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline" }}>
                    Vider
                  </button>
                )}
              </div>
              <button className="close-btn" onClick={() => setCartOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart list content */}
            <div className="cart-items-list" style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {cart.map((item) => (
                <div key={item.id} className="cart-item" style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <img src={item.image} alt={item.productTitle} style={{ width: 50, height: 66, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.productTitle}</span>
                      <button onClick={() => updateCartItemQuantity(item.id, 0)} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}>Supprimer</button>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Couleur: {item.colorName} | Taille: {item.size} {item.age && `(${item.age})`}
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Votre panier est vide.
                </div>
              )}
            </div>

            {/* Cart Drawer footer summary */}
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span className="total-label">Total</span>
                <span className="total-value">{formatPrice(getCartTotal())}</span>
              </div>
              <button
                className="checkout-btn"
                disabled={cart.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                  setCheckoutStep(1);
                }}
              >
                Passer la commande
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ==================== 5. TRACKING DRAWER ==================== */}
      {trackingOpen && (
        <>
          <div className="cart-drawer-backdrop" onClick={() => setTrackingOpen(false)} style={{ display: "block" }}></div>
          <div className="cart-drawer" style={{ display: "flex", flexDirection: "column" }}>
            <div className="cart-drawer-header">
              <h3>Suivi de Colis</h3>
              <button className="close-btn" onClick={() => setTrackingOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="tracking-content" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, flex: 1, overflowY: "auto" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Entrez votre numéro de commande DivinExpress pour suivre son statut en temps réel (Ex: SH-09312).
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Ex: SH-09312"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 23,
                    border: "1px solid var(--accent-light)",
                    padding: "0 20px",
                    outline: "none",
                    fontWeight: 600,
                  }}
                />
                <button
                  onClick={handleTrackingSubmit}
                  style={{
                    height: 46,
                    borderRadius: 23,
                    padding: "0 20px",
                    background: "var(--accent-dark)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Suivre
                </button>
              </div>

              {trackingError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: "bold" }}>
                  ⚠ {trackingError}
                </div>
              )}

              {trackedOrder && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ background: "#f3f4f6", padding: 16, borderRadius: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Client :</div>
                    <div style={{ fontWeight: "bold" }}>{trackedOrder.clientName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 8 }}>Statut :</div>
                    <div style={{ fontWeight: "bold", color: trackedOrder.status === "PAYEE" ? "#22c55e" : "#ef4444" }}>
                      {trackedOrder.status === "PAYEE" ? "Payée & En préparation" : trackedOrder.status}
                    </div>
                  </div>

                  {/* Dynamic tracking visual stepper */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#4caf50", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.75rem", fontWeight: "bold" }}>
                        ✓
                      </div>
                      <div>
                        <h5 style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>Commande Validée</h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Enregistrée en base Neon</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: trackedOrder.status === "PAYEE" || trackedOrder.status === "EXPEDIEE" ? "#4caf50" : "#d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {trackedOrder.status === "PAYEE" || trackedOrder.status === "EXPEDIEE" ? "✓" : "2"}
                      </div>
                      <div>
                        <h5 style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>Préparation en Atelier</h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Découpe et couture à la main</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: trackedOrder.status === "EXPEDIEE" ? "#4caf50" : "#d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {trackedOrder.status === "EXPEDIEE" ? "✓" : "3"}
                      </div>
                      <div>
                        <h5 style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>Expédition en Cours</h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Pris en charge par notre service logistique</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ==================== 6. FILTER DRAWER ==================== */}
      {filterOpen && (
        <>
          <div className="cart-drawer-backdrop" onClick={() => setFilterOpen(false)} style={{ display: "block" }}></div>
          <div className="cart-drawer" style={{ display: "flex", flexDirection: "column" }}>
            <div className="cart-drawer-header">
              <h3>Trier la collection</h3>
              <button className="close-btn" onClick={() => setFilterOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="filter-content" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
              <div>
                <h5 className="option-title" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>
                  Trier par prix
                </h5>
                <div className="option-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className={`size-pill ${currentSort === "default" ? "active" : ""}`}
                    onClick={() => setCurrentSort("default")}
                    style={{ width: "auto", height: 38, padding: "0 16px" }}
                  >
                    Par défaut
                  </button>
                  <button
                    className={`size-pill ${currentSort === "low-high" ? "active" : ""}`}
                    onClick={() => setCurrentSort("low-high")}
                    style={{ width: "auto", height: 38, padding: "0 16px" }}
                  >
                    Prix croissant
                  </button>
                  <button
                    className={`size-pill ${currentSort === "high-low" ? "active" : ""}`}
                    onClick={() => setCurrentSort("high-low")}
                    style={{ width: "auto", height: 38, padding: "0 16px" }}
                  >
                    Prix décroissant
                  </button>
                </div>
              </div>

              <button onClick={() => setFilterOpen(false)} style={{ height: 52, borderRadius: 26, background: "var(--accent-dark)", color: "#ffffff", border: "none", fontWeight: 600, cursor: "pointer", marginTop: "auto", width: "100%" }}>
                Appliquer les filtres
              </button>
            </div>
          </div>
        </>
      )}

      {/* ==================== MOBILE NAVIGATION DRAWER ==================== */}
      {navDrawerOpen && (
        <>
          <div className="nav-drawer-backdrop" onClick={() => setNavDrawerOpen(false)} style={{ display: "block" }}></div>
          <div className="nav-drawer" style={{ display: "block" }}>
            <div className="nav-drawer-header">
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span className="logo" style={{ letterSpacing: 2 }}>DIVINEXPRESS</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "bold" }}>Minimalisme & Raffinement</span>
              </div>
              <button className="close-btn" onClick={() => setNavDrawerOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="nav-drawer-content" style={{ padding: "0 16px 24px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "calc(100% - 80px)" }}>
              <div style={{ overflowY: "auto", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCategory("");
                      setCurrentSubcategory("");
                      setNavDrawerOpen(false);
                    }}
                    style={{ fontSize: "1.05rem", fontWeight: "bold", textDecoration: "none", color: "var(--text-primary)" }}
                  >
                    Boutique Officielle
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCategory("femme");
                      setCurrentSubcategory("");
                      setNavDrawerOpen(false);
                    }}
                    style={{ fontSize: "1.05rem", fontWeight: "bold", textDecoration: "none", color: "var(--text-primary)" }}
                  >
                    Femme
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCategory("homme");
                      setCurrentSubcategory("");
                      setNavDrawerOpen(false);
                    }}
                    style={{ fontSize: "1.05rem", fontWeight: "bold", textDecoration: "none", color: "var(--text-primary)" }}
                  >
                    Homme
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCategory("enfant");
                      setCurrentSubcategory("");
                      setNavDrawerOpen(false);
                    }}
                    style={{ fontSize: "1.05rem", fontWeight: "bold", textDecoration: "none", color: "var(--text-primary)" }}
                  >
                    Enfant
                  </a>
                </div>

                <div className="nav-drawer-divider" style={{ margin: "20px 0" }}></div>

                <a href="#" onClick={(e) => { e.preventDefault(); setNavDrawerOpen(false); setTrackingOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text-primary)", fontWeight: 600 }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Suivi de colis</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== MOBILE SEARCH OVERLAY ==================== */}
      {searchOverlayOpen && (
        <div id="search-overlay" className="search-overlay" style={{ display: "flex" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button onClick={() => setSearchOverlayOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 28, height: 28, strokeWidth: 2 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid var(--text-primary)", padding: "8px 0", marginTop: 40 }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24, color: "var(--text-secondary)", marginRight: 12, strokeWidth: 2.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher un vêtement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchOverlayOpen(false);
                }
              }}
              style={{ border: "none", background: "transparent", fontSize: "1.3rem", fontWeight: 600, width: "100%", outline: "none", color: "var(--text-primary)" }}
            />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 12 }}>Appuyez sur Entrée pour rechercher dans la boutique.</p>
        </div>
      )}

      {/* Toast Notification popup */}
      <div className={`toast-msg ${toastVisible ? "show" : ""}`} id="toast-notification" style={{ display: toastVisible ? "block" : "none" }}>
        {toastText}
      </div>
    </div>
  );
}
