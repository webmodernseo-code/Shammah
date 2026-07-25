# Dashboard & Dynamic Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a premium admin dashboard in Vanilla HTML/CSS/JS to manage orders, stock levels, coupon codes, and dynamically add categories/subcategories/products with image galleries, while updating the vitrine storefront to load all items dynamically from database.

**Architecture:** Use a shared client-side database module (LocalStorage adapter initially, pre-configured for Supabase connection) to store products, categories, subcategories, and orders. Dynamically render category tabs and products on the storefront based on the database.

**Tech Stack:** Vanilla HTML5, CSS3, ES6 JavaScript, and local/Supabase mock storage APIs.

## Global Constraints
- Primary Font must be 'Inter', sans-serif.
- Clean Light Mode theme with fine #e2e8f0 borders and functional colors (#10b981 for success, #3b82f6 for info, #f59e0b for warning, #ef4444 for danger).
- Code changes must pass all existings tests in `C:\tmp\shammah-checkout-tests\test-final.js`.

---

### Task 1: Database Adapter & Mock Data Setup (Gadgets)
Establish the data layer that holds products (including the new category "gadget" with its 3 mock items), dynamic categories, and subcategories.

**Files:**
- Create: `js/db.js`
- Modify: `js/shammah.js`

- [ ] **Step 1: Create the database adapter module**
  Create `js/db.js` implementing a unified client database:
  ```javascript
  const DEFAULT_CATEGORIES = [
    { slug: "femme", name: "Femme", image_url: "images/category_woman.png" },
    { slug: "homme", name: "Homme", image_url: "images/category_man.png" },
    { slug: "enfant", name: "Enfant", image_url: "images/category_kid.png" },
    { slug: "gadget", name: "Gadget", image_url: "images/category_kid.png" } // placeholder or custom image
  ];

  const DEFAULT_SUBCATEGORIES = [
    { category_slug: "femme", name: "Casual", slug: "casual" },
    { category_slug: "femme", name: "Robe", slug: "robe" },
    { category_slug: "femme", name: "Pull", slug: "pull" },
    { category_slug: "homme", name: "Casual", slug: "casual" },
    { category_slug: "homme", name: "Pantalon", slug: "pantalon" },
    { category_slug: "homme", name: "Polo", slug: "polo" },
    { category_slug: "enfant", name: "Casual", slug: "casual" },
    { category_slug: "enfant", name: "Pull", slug: "pull" },
    { category_slug: "gadget", name: "Maroquinerie", slug: "maroquinerie" },
    { category_slug: "gadget", name: "Accessoire", slug: "accessoire" }
  ];

  // Merge the 16 existing products from shammah.js and append the 3 new Gadget products:
  // 1. Portefeuille Cuir Minimaliste (18 500, variants: Chocolat / Noir, stock: 15)
  // 2. Porte-Clés Laiton Massif (8 000, variants: Or Laiton, stock: 30)
  // 3. Étui Cartes Premium (12 000, variants: Cognac / Noir, stock: 20)
  // Stored in localStorage.getItem("shammah_db_products") / "categories" / "subcategories".
  ```
- [ ] **Step 2: Connect the database adapter to storefront**
  Update `js/shammah.js` to import/read categories, subcategories, and products from `js/db.js` instead of using the hardcoded `PRODUCTS` array.
- [ ] **Step 3: Run existing storefront tests to verify zero regressions**
  Run: `node C:\tmp\shammah-checkout-tests\test-final.js`
  Expected: PASS

---

### Task 2: Storefront Dynamic Categories & Filtering
Modify the storefront to render category tabs and drawer sub-filters dynamically from the database.

**Files:**
- Modify: `index.html`
- Modify: `js/shammah.js`

- [ ] **Step 1: Replace hardcoded category tabs in HTML**
  Replace the static `.category-tabs` container with a dynamic target: `<div class="category-tabs" id="dynamic-category-tabs"></div>`
- [ ] **Step 2: Implement dynamic category tabs rendering**
  Update `js/shammah.js` to render categories dynamically on initialization:
  ```javascript
  function renderCategoryTabs() {
    const container = document.getElementById("dynamic-category-tabs");
    if (!container) return;
    container.innerHTML = "";
    // Render "Tous" first, then loop through db.getCategories() and append tabs
  }
  ```
- [ ] **Step 3: Render drawer subcategories dynamically**
  Update subcategory filters in the sidebar drawer to pull list from `db.getSubcategoriesForCategory(currentCategory)` instead of hardcoded objects.
- [ ] **Step 4: Verify category filters manually in browser**
  Check that clicking the dynamic "Gadget" tab shows the 3 mock gadgets.

---

### Task 3: Admin Dashboard Structure & Style (Premium SaaS)
Create the layout and design of the admin dashboard using Vanilla HTML/CSS.

**Files:**
- Create: `admin/index.html`
- Create: `admin/admin.css`

- [ ] **Step 1: Write dashboard HTML structure**
  Implement `admin/index.html` featuring:
  - Sidebar Navigation (Vue d'ensemble, Commandes, Produits, Codes & Vente Flash, Paramètres).
  - Main panel showing Vue d'ensemble (Dashboard charts, KPI cards, and Activity logs) by default.
  - SVG icons for all links.
- [ ] **Step 2: Design admin styling in admin.css**
  Implement standard light mode premium SaaS theme in `admin/admin.css`. Set font family to `Inter` and define transitions for hover and `:active` scale (transform: scale(0.97)).

---

### Task 4: Dashboard Product & Stock Management Page
Implement the Products page layout inside the dashboard to manage current inventory and add new products with color variants and up to 3 photos each.

**Files:**
- Modify: `admin/index.html`
- Create: `admin/admin.js`

- [ ] **Step 1: Build product listing table**
  Create table showing all current products, their categories, and active stock levels.
- [ ] **Step 2: Add Product creation form**
  Implement fields: Name, Price, Description, Category (Fixed selector), Subcategory (Variable text input).
- [ ] **Step 3: Implement variant color & photos upload (Max 3)**
  Build dynamic fields to add color variants. For each color, provide 3 image drop zones (file inputs) mapping to `image_url_1`, `image_url_2`, `image_url_3`.
- [ ] **Step 4: Implement product save logic**
  Write form submission handler in `admin/admin.js` to save the new product with its images/variants to `db.js`.
- [ ] **Step 5: Verify product additions**
  Add a dummy product in the dashboard and verify it appears instantly on the storefront `index.html`.

---

### Task 5: Dashboard Settings (Category & Subcategory Creation)
Build the Settings section to create new categories with images and new subcategories.

**Files:**
- Modify: `admin/index.html`
- Modify: `admin/admin.js`

- [ ] **Step 1: Create Category & Subcategory Form in Settings**
  Build form fields: Category name, cover image drop-zone, and Subcategory name (with parent category select).
- [ ] **Step 2: Implement creation handlers**
  Save newly created categories and subcategories to the database.
- [ ] **Step 3: Verify dynamic updates**
  Create a new category "Bijoux" with a cover photo and verify that "Bijoux" immediately appears as a circular tab on `index.html`.
- [ ] **Step 4: Commit changes**
  Add and commit all dashboard files.
