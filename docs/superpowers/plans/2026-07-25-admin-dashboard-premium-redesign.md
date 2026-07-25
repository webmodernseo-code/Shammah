# Refonte Premium & Audit du Dashboard Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les bugs audités dans `admin/`, refondre l'éditeur de produits à variantes en panneau latéral avec chips de taille et glisser-déposer, ajouter un vrai panneau "Commandes" branché sur les données réelles, et habiller le tout d'une coquille SaaS premium (thème sombre, sidebar rétractable, palette ⌘K, toasts).

**Architecture:** Vanilla HTML/CSS/JS sans bundler, adossé à `localStorage` via `js/db.js`. `admin/admin.js` (997 lignes, monolithique) est démantelé en modules `admin/js/*.js`, chacun encapsulé dans une IIFE et exposant une API explicite sur `window` (ex. `window.Toast`, `window.VariantEditor`, `window.ProductsPanel`). Chaque module s'auto-initialise sur `DOMContentLoaded` — aucun orchestrateur central requis pendant la migration incrémentale.

**Tech Stack:** HTML5, CSS3, ES6 vanilla, `localStorage`. Vérification via Playwright (`chromium`) contre un serveur statique local.

## Global Constraints

- Police unique : `Inter, sans-serif`.
- Couleurs fonctionnelles exactes : succès `#10b981`, info `#3b82f6`, alerte `#f59e0b`, danger `#ef4444`.
- Chaque fichier `admin/js/*.js` est une IIFE (`(function(){ ... })();`) ; seule une API documentée est posée sur `window`.
- Aucun `alert()`/`confirm()` natif dans le code neuf ou modifié — utiliser `window.Toast.show(...)` / `window.ConfirmModal.open(...)`.
- Aucune migration des formes de données existantes : `product.sizes: string[]`, `variant.sizesStock: {[taille]: number}`, `variant.images: string[]`, `order: {id, date, client, email, address, phone, total, method, status, items}` restent inchangées (spec §6.4).
- Un serveur statique doit tourner sur `http://127.0.0.1:8811` (racine du dépôt) pour toutes les vérifications Playwright : `npx --yes serve -l 8811 .` depuis la racine du projet, dans un terminal séparé, avant d'exécuter un script de test.
- Les scripts Playwright vivent dans `C:\tmp\shammah-checkout-tests\`, suivent le style déjà établi dans `test-admin-edit.js`/`test-final.js` (capture `console`/`pageerror`/404, log `PASS`/`FAIL`, `process.exit` selon le résultat global).

---

### Task 1: Couche de données — extensions de `js/db.js`

Corrige le bug d'audit #4 (aucune commande réelle n'est jamais lue) et le #5 (suppressions incohérentes), et pose les fondations dont tous les modules suivants dépendent.

**Files:**
- Modify: `js/db.js`
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task1-db.js`

**Interfaces:**
- Produces: `window.db.deleteProduct(id)`, `window.db.deleteCategory(slug)`, `window.db.deleteSubcategory(categorySlug, slug)`, `window.db.updateOrderStatus(orderId, status)` ; `window.db.getOrders()` retourne 4 commandes de démonstration quand `shammah_db_orders` est absent ou vide.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task1-db.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', err => { console.log('PAGEERROR: ' + err.message); ok = false; });

  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const orderCount = await page.evaluate(() => window.db.getOrders().length);
  log('4 commandes de démonstration au premier lancement', orderCount === 4);

  const productCountBefore = await page.evaluate(() => window.db.getProducts().length);
  await page.evaluate(() => window.db.deleteProduct('polo-signature'));
  const productCountAfter = await page.evaluate(() => window.db.getProducts().length);
  log('deleteProduct retire bien le produit', productCountAfter === productCountBefore - 1);

  const subcatCountBefore = await page.evaluate(() => window.db.getSubcategoriesForCategory('gadget').length);
  log('gadget a des sous-catégories avant suppression', subcatCountBefore > 0);
  await page.evaluate(() => window.db.deleteCategory('gadget'));
  const catRemoved = await page.evaluate(() => !window.db.getCategories().some(c => c.slug === 'gadget'));
  const subcatsRemoved = await page.evaluate(() => window.db.getSubcategoriesForCategory('gadget').length === 0);
  log('deleteCategory retire la catégorie', catRemoved);
  log('deleteCategory retire ses sous-catégories en cascade', subcatsRemoved);

  await page.evaluate(() => window.db.updateOrderStatus(window.db.getOrders()[0].id, 'Payée'));
  const statusUpdated = await page.evaluate(() => window.db.getOrders()[0].status === 'Payée');
  log('updateOrderStatus met à jour le statut', statusUpdated);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Démarrer le serveur (`npx --yes serve -l 8811 .` depuis la racine), puis :
Run: `node C:\tmp\shammah-checkout-tests\test-premium-task1-db.js`
Expected: FAIL — `window.db.deleteProduct is not a function` (ou équivalent), et seulement 0 commande par défaut au lieu de 4.

- [ ] **Step 3: Implémenter les extensions dans `js/db.js`**

Ajouter avant `class ShammahDB` :
```javascript
const DEFAULT_ORDERS = [
  { id: "SH-09312", date: "20/07/2026", client: "Aïssatou Diallo", email: "aissatou.d@example.com", address: "Cocody Angré, Abidjan", phone: "+225 07 00 00 00 00", total: 18500, method: "MTN MoMo", status: "Payée", items: [] },
  { id: "SH-09311", date: "19/07/2026", client: "Jean Kouassi", email: "jean.k@example.com", address: "Marcory, Abidjan", phone: "+225 05 00 00 00 00", total: 31200, method: "Orange Money", status: "En attente", items: [] },
  { id: "SH-09310", date: "18/07/2026", client: "Fatou Bamba", email: "fatou.b@example.com", address: "Yopougon, Abidjan", phone: "+225 01 00 00 00 00", total: 8000, method: "Wave", status: "Payée", items: [] },
  { id: "SH-09309", date: "17/07/2026", client: "Marc Dupont", email: "marc.d@example.com", address: "Plateau, Abidjan", phone: "+225 07 11 22 33 44", total: 66000, method: "Carte Bancaire", status: "Annulée", items: [] }
];
```

Remplacer le bloc `orders` dans `init()` :
```javascript
    const existingOrdersRaw = localStorage.getItem("shammah_db_orders");
    const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
    if (existingOrders.length === 0) {
      localStorage.setItem("shammah_db_orders", JSON.stringify(DEFAULT_ORDERS));
    }
```

Ajouter dans la classe `ShammahDB`, avant la fermeture `}` :
```javascript
  deleteProduct(id) {
    const list = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem("shammah_db_products", JSON.stringify(list));
  }

  deleteCategory(slug) {
    const categories = this.getCategories().filter(c => c.slug !== slug);
    localStorage.setItem("shammah_db_categories", JSON.stringify(categories));
    const subcategories = this.getSubcategories().filter(s => s.category_slug !== slug);
    localStorage.setItem("shammah_db_subcategories", JSON.stringify(subcategories));
  }

  deleteSubcategory(categorySlug, slug) {
    const list = this.getSubcategories().filter(s => !(s.category_slug === categorySlug && s.slug === slug));
    localStorage.setItem("shammah_db_subcategories", JSON.stringify(list));
  }

  updateOrderStatus(orderId, status) {
    const list = this.getOrders();
    const order = list.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem("shammah_db_orders", JSON.stringify(list));
    }
  }
```

- [ ] **Step 4: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task1-db.js`
Expected: 6 lignes `PASS`, code de sortie 0.

- [ ] **Step 5: Commit**

```bash
git add js/db.js
git commit -m "feat(db): add deleteProduct/deleteCategory/deleteSubcategory/updateOrderStatus and seed default orders"
```

---

### Task 2: UI Kit — Toast, Confirm Modal & utilitaire de prix partagé

Corrige une partie du bug #5 (remplace `alert()`/`confirm()`). Pose `window.formatPrice`, utilisé par tous les modules suivants.

**Files:**
- Create: `admin/js/ui-kit.js`
- Modify: `admin/admin.css`
- Modify: `admin/index.html` (ajout du script, retrait de l'ancien `formatPrice` d'`admin.js` pour éviter le conflit de nom global)
- Modify: `admin/admin.js` (suppression de `function formatPrice(val) {...}`, lignes 49-56 de la version actuelle)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task2-uikit.js`

**Interfaces:**
- Produces: `window.Toast.show(message, type)` (`type` ∈ `success`/`error`/`info`), `window.ConfirmModal.open({title, message, confirmLabel, danger}) → Promise<boolean>`, `window.formatPrice(val) → string`.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task2-uikit.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  await page.evaluate(() => window.Toast.show('Message de test', 'success'));
  log('le toast apparaît avec le bon texte', await page.locator('.toast').first().innerText().then(t => t.includes('Message de test')));
  log('le toast porte la classe de type success', await page.locator('.toast.toast-success').count() === 1);
  await page.waitForTimeout(4000);
  log('le toast disparaît après ~3.5s', await page.locator('.toast').count() === 0);

  const confirmPromise = page.evaluate(() => window.ConfirmModal.open({ title: 'Titre', message: 'Message', confirmLabel: 'Oui', danger: true }).then(r => { window.__confirmResult = r; }));
  await page.waitForSelector('.confirm-modal');
  await page.click('.confirm-modal-actions [data-action="confirm"]');
  await confirmPromise;
  log('ConfirmModal résout true au clic confirmer', await page.evaluate(() => window.__confirmResult === true));

  log('formatPrice formatte les FCFA', await page.evaluate(() => window.formatPrice(18500)) === '18 500 FCFA' || (await page.evaluate(() => window.formatPrice(18500))).includes('FCFA'));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task2-uikit.js`
Expected: FAIL — `window.Toast is not defined`.

- [ ] **Step 3: Créer `admin/js/ui-kit.js`**

```javascript
(function () {
  "use strict";

  // ---------- formatPrice ----------
  window.formatPrice = function formatPrice(val) {
    const num = parseFloat(val) || 0;
    if (num >= 1000) return num.toLocaleString('fr-FR') + " FCFA";
    return "$" + num.toFixed(2);
  };

  // ---------- Toast ----------
  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(message, type) {
    type = type || "info";
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast-visible"));

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-hiding");
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  window.Toast = { show: showToast };

  // ---------- Confirm Modal ----------
  function openConfirm(options) {
    options = options || {};
    const title = options.title || "Confirmer";
    const message = options.message || "";
    const confirmLabel = options.confirmLabel || "Confirmer";
    const danger = !!options.danger;

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      overlay.innerHTML =
        '<div class="confirm-modal">' +
          '<h3></h3><p></p>' +
          '<div class="confirm-modal-actions">' +
            '<button class="btn-secondary" data-action="cancel">Annuler</button>' +
            '<button class="' + (danger ? "btn-danger" : "btn-primary") + '" data-action="confirm"></button>' +
          '</div>' +
        '</div>';
      overlay.querySelector("h3").textContent = title;
      overlay.querySelector("p").textContent = message;
      overlay.querySelector('[data-action="confirm"]').textContent = confirmLabel;
      document.body.appendChild(overlay);

      function close(result) {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
        resolve(result);
      }
      function onKeydown(e) { if (e.key === "Escape") close(false); }

      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });
      overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => close(false));
      overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => close(true));
      document.addEventListener("keydown", onKeydown);
    });
  }

  window.ConfirmModal = { open: openConfirm };
})();
```

Note : le HTML du modal est construit via `textContent` (pas d'interpolation de `title`/`message` dans un template string HTML) pour éviter toute injection si un jour ces valeurs viennent d'une saisie utilisateur.

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
/* Toasts */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  background: var(--text-primary);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translateY(8px);
  transition: var(--transition-smooth);
  max-width: 320px;
}

.toast-visible { opacity: 1; transform: translateY(0); }
.toast-hiding { opacity: 0; }
.toast-success { background: #047857; }
.toast-error { background: #b91c1c; }
.toast-info { background: var(--text-primary); }

/* Confirm modal */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.confirm-modal {
  background: var(--bg-panel);
  border-radius: 14px;
  padding: 24px;
  width: 360px;
  box-shadow: var(--shadow-lg);
  text-align: left;
}

.confirm-modal h3 { margin: 0 0 8px 0; font-size: 1rem; font-weight: 800; }
.confirm-modal p { margin: 0 0 20px 0; font-size: 0.85rem; color: var(--text-secondary); }
.confirm-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

.btn-danger {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--accent-red); color: #fff; border: 1px solid var(--accent-red);
  border-radius: 8px; padding: 8px 16px; font-family: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer;
}
.btn-danger:hover { background: #dc2626; }
```

- [ ] **Step 5: Retirer l'ancien `formatPrice` d'`admin/admin.js`**

Supprimer dans `admin/admin.js` (lignes 49-56 actuelles) :
```javascript
// Helper to format currency
function formatPrice(val) {
  if (val >= 1000) {
    return val.toLocaleString('fr-FR') + " FCFA";
  } else {
    return "$" + val.toFixed(2);
  }
}
```
(sans remplacement — le reste du fichier appelle déjà `formatPrice(...)` en global, ce qui continuera de fonctionner via `window.formatPrice` une fois `ui-kit.js` chargé avant `admin.js`).

- [ ] **Step 6: Charger `ui-kit.js` dans `admin/index.html`**

Juste après `<script src="../js/db.js"></script>`, ajouter :
```html
  <script src="js/ui-kit.js"></script>
```
(avant `<script src="admin.js"></script>`, qui reste en place jusqu'à la Task 13).

- [ ] **Step 7: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task2-uikit.js`
Expected: PASS pour les 5 assertions.

- [ ] **Step 8: Commit**

```bash
git add admin/js/ui-kit.js admin/admin.css admin/index.html admin/admin.js
git commit -m "feat(admin): add Toast/ConfirmModal UI kit and shared formatPrice, retire native alert/confirm"
```

---

### Task 3: UI Kit — Thème sombre & sidebar rétractable

**Files:**
- Modify: `admin/js/ui-kit.js`
- Modify: `admin/admin.css`
- Modify: `admin/index.html` (bouton de bascule sidebar, bouton thème, restructuration des labels de nav en `<span class="nav-label">`)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task3-theme.js`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: attribut `data-theme` sur `<html>` persisté (`localStorage: shammah_admin_theme`), classe `.sidebar-collapsed` sur `.app-container` persistée (`localStorage: shammah_admin_sidebar_collapsed`).

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task3-theme.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);
  await page.evaluate(() => localStorage.removeItem('shammah_admin_theme'));

  await page.click('#theme-toggle-btn');
  log('le thème passe en sombre après clic', await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'));
  await page.reload();
  log('le thème sombre est persisté après rechargement', await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'));

  await page.click('#sidebar-toggle-btn');
  log('la sidebar se replie après clic', await page.evaluate(() => document.querySelector('.app-container').classList.contains('sidebar-collapsed')));
  await page.reload();
  log('le repli de la sidebar est persisté après rechargement', await page.evaluate(() => document.querySelector('.app-container').classList.contains('sidebar-collapsed')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task3-theme.js`
Expected: FAIL — `#theme-toggle-btn` introuvable (timeout de clic).

- [ ] **Step 3: Ajouter les boutons et restructurer les labels de nav dans `admin/index.html`**

Envelopper le texte de chaque `.nav-item` existant dans un `<span class="nav-label">` (les 4 items actuels : Vue d'ensemble, Gestion Articles, Codes Promo, Configuration), par exemple :
```html
          <div class="nav-item active" data-target="panel-dashboard">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span class="nav-label">Vue d'ensemble</span>
          </div>
```
(répéter pour les 3 autres `.nav-item` existants, en gardant leur `svg` intact et en enveloppant seulement le texte).

Ajouter un bouton de repli juste avant la fermeture de `.sidebar-top` (après `<nav class="nav-links">...</nav>`) :
```html
        <button type="button" id="sidebar-toggle-btn" class="sidebar-toggle-btn" title="Replier/déplier la sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
```

Ajouter un bouton de bascule de thème dans `.user-card`, juste après `.user-info` :
```html
        <button type="button" id="theme-toggle-btn" class="theme-toggle-btn" title="Basculer le thème">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
        </button>
```

- [ ] **Step 4: Ajouter la logique dans `admin/js/ui-kit.js`**

Ajouter à l'intérieur de la même IIFE (avant le `})();` final) :
```javascript
  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("shammah_admin_theme");
    const theme = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(theme);

    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem("shammah_admin_theme", next);
      });
    }
  }

  // ---------- Sidebar collapse ----------
  function initSidebarCollapse() {
    const appContainer = document.querySelector(".app-container");
    const btn = document.getElementById("sidebar-toggle-btn");
    if (!appContainer || !btn) return;

    if (localStorage.getItem("shammah_admin_sidebar_collapsed") === "true") {
      appContainer.classList.add("sidebar-collapsed");
    }

    btn.addEventListener("click", () => {
      appContainer.classList.toggle("sidebar-collapsed");
      localStorage.setItem("shammah_admin_sidebar_collapsed", appContainer.classList.contains("sidebar-collapsed"));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebarCollapse();
  });
```

- [ ] **Step 5: Ajouter les styles dans `admin/admin.css`**

```css
/* Dark theme */
:root[data-theme="dark"] {
  --bg-primary: #0b1220;
  --bg-panel: #111827;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-light: #1f2937;
  --border-medium: #334155;
}
:root[data-theme="dark"] .content-card-header,
:root[data-theme="dark"] th { background: #0f172a; }
:root[data-theme="dark"] .sidebar-logo-text { color: var(--text-primary); }

/* Sidebar collapse */
.app-container.sidebar-collapsed { grid-template-columns: 72px 1fr; }
.sidebar-collapsed .sidebar-logo-text,
.sidebar-collapsed .search-box,
.sidebar-collapsed .nav-label,
.sidebar-collapsed .user-info { display: none; }
.sidebar-collapsed .nav-item { justify-content: center; }
.sidebar-collapsed .sidebar-logo { justify-content: center; padding-left: 0; }

.sidebar-toggle-btn, .theme-toggle-btn {
  border: none; background: transparent; cursor: pointer; color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px;
  transition: var(--transition-smooth);
}
.sidebar-toggle-btn:hover, .theme-toggle-btn:hover { background: var(--bg-primary); color: var(--text-primary); }
.sidebar-collapsed .sidebar-toggle-btn svg { transform: rotate(180deg); }
```

- [ ] **Step 6: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task3-theme.js`
Expected: PASS pour les 4 assertions.

- [ ] **Step 7: Commit**

```bash
git add admin/js/ui-kit.js admin/admin.css admin/index.html
git commit -m "feat(admin): add dark theme toggle and collapsible sidebar with persistence"
```

---

### Task 4: UI Kit — Palette de commandes (⌘K)

**Files:**
- Modify: `admin/js/ui-kit.js`
- Modify: `admin/admin.css`
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task4-palette.js`

**Interfaces:**
- Consumes: `window.db.getProducts()` (Task 1 / existant), appel optionnel et protégé `window.ProductsPanel && window.ProductsPanel.openEditDrawer(id)` (produit par la Task 11 — absent avant, donc protégé par un test d'existence).
- Produces: `window.CommandPalette.open()`.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task4-palette.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  await page.keyboard.press('Control+k');
  log('la palette de commandes s\'ouvre avec Ctrl+K', await page.locator('.command-palette').count() === 1);

  await page.fill('#command-palette-input', 'Polo');
  await page.waitForTimeout(150);
  log('la recherche filtre les produits par titre', await page.locator('.command-palette-item', { hasText: 'Polo' }).count() >= 1);

  await page.keyboard.press('Escape');
  log('Échap ferme la palette', await page.locator('.command-palette').count() === 0);

  await page.click('.search-box input');
  log('cliquer sur la zone de recherche ouvre aussi la palette', await page.locator('.command-palette').count() === 1);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task4-palette.js`
Expected: FAIL — `.command-palette` jamais présent.

- [ ] **Step 3: Ajouter la palette dans `admin/js/ui-kit.js`**

Ajouter dans la même IIFE :
```javascript
  // ---------- Command Palette ----------
  const NAV_TARGETS = [
    { label: "Vue d'ensemble", target: "panel-dashboard" },
    { label: "Commandes", target: "panel-orders" },
    { label: "Gestion Articles", target: "panel-products" },
    { label: "Codes Promo", target: "panel-promos" },
    { label: "Configuration", target: "panel-settings" }
  ];

  function goToPanel(target) {
    const navItem = document.querySelector('.nav-item[data-target="' + target + '"]');
    if (navItem) navItem.click();
  }

  function openCommandPalette() {
    if (document.getElementById("command-palette-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "command-palette-overlay";
    overlay.id = "command-palette-overlay";
    overlay.innerHTML =
      '<div class="command-palette">' +
        '<input type="text" id="command-palette-input" placeholder="Rechercher un produit ou naviguer...">' +
        '<div class="command-palette-results" id="command-palette-results"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    function closePalette() {
      overlay.remove();
      document.removeEventListener("keydown", onPaletteKeydown);
    }

    function onPaletteKeydown(e) {
      if (e.key === "Escape") closePalette();
    }

    function renderResults(query) {
      const resultsEl = overlay.querySelector("#command-palette-results");
      const q = query.trim().toLowerCase();
      resultsEl.innerHTML = "";

      NAV_TARGETS.filter(n => n.label.toLowerCase().includes(q)).forEach(n => {
        const item = document.createElement("div");
        item.className = "command-palette-item";
        item.innerHTML = "<span></span><span>Navigation</span>";
        item.querySelector("span").textContent = n.label;
        item.addEventListener("click", () => { closePalette(); goToPanel(n.target); });
        resultsEl.appendChild(item);
      });

      if (q.length >= 2 && window.db) {
        window.db.getProducts().filter(p => p.title.toLowerCase().includes(q)).slice(0, 6).forEach(p => {
          const item = document.createElement("div");
          item.className = "command-palette-item";
          item.innerHTML = "<span></span><span>Produit</span>";
          item.querySelector("span").textContent = p.title;
          item.addEventListener("click", () => {
            closePalette();
            goToPanel("panel-products");
            if (window.ProductsPanel) window.ProductsPanel.openEditDrawer(p.id);
          });
          resultsEl.appendChild(item);
        });
      }

      if (!resultsEl.children.length) {
        resultsEl.innerHTML = '<div class="command-palette-empty">Aucun résultat</div>';
      }
    }

    renderResults("");
    overlay.querySelector("#command-palette-input").addEventListener("input", (e) => renderResults(e.target.value));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closePalette(); });
    document.addEventListener("keydown", onPaletteKeydown);
    overlay.querySelector("#command-palette-input").focus();
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCommandPalette();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.querySelector(".search-box input");
    if (searchBox) searchBox.addEventListener("click", openCommandPalette);
  });

  window.CommandPalette = { open: openCommandPalette };
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
.command-palette-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.5);
  display: flex; align-items: flex-start; justify-content: center; padding-top: 12vh; z-index: 9997;
}
.command-palette {
  width: 520px; max-width: 90vw; background: var(--bg-panel); border-radius: 14px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.command-palette input {
  width: 100%; height: 48px; border: none; border-bottom: 1px solid var(--border-light);
  padding: 0 16px; font-family: inherit; font-size: 0.9rem; outline: none; box-sizing: border-box;
  background: transparent; color: var(--text-primary);
}
.command-palette-results { max-height: 320px; overflow-y: auto; }
.command-palette-item {
  padding: 10px 16px; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: space-between;
  color: var(--text-primary);
}
.command-palette-item:hover { background: var(--bg-primary); }
.command-palette-empty { padding: 16px; font-size: 0.8rem; color: var(--text-secondary); text-align: center; }
```

- [ ] **Step 5: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task4-palette.js`
Expected: PASS pour les 4 assertions.

- [ ] **Step 6: Commit**

```bash
git add admin/js/ui-kit.js admin/admin.css
git commit -m "feat(admin): add functional Ctrl/Cmd+K command palette with product search"
```

---

### Task 5: Coquille HTML — logo SVG, favicon, panneau "Commandes"

**Files:**
- Create: `images/logo-shammah.svg`
- Modify: `admin/index.html`
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task5-shell.js`

**Interfaces:**
- Produces : nav-item `[data-target="panel-orders"]`, panneau `#panel-orders` avec `#orders-list-tbody`/`#orders-empty-state` (consommés par la Task 6).

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task5-shell.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  log('un favicon SVG est déclaré', await page.locator('link[rel="icon"][type="image/svg+xml"]').count() === 1);
  log('le logo de la sidebar est un SVG avec la classe brand-mark', await page.locator('.sidebar-logo svg.brand-mark').count() === 1);

  await page.click('.nav-item[data-target="panel-orders"]');
  log('le panneau Commandes devient visible', await page.locator('#panel-orders').evaluate(el => el.classList.contains('active')));
  log('le tableau des commandes existe', await page.locator('#orders-list-tbody').count() === 1);
  log('l\'état vide existe (masqué par défaut)', await page.locator('#orders-empty-state').count() === 1);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task5-shell.js`
Expected: FAIL — favicon et `#panel-orders` absents.

- [ ] **Step 3: Créer `images/logo-shammah.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="9" fill="#0f172a"/>
  <path d="M12 11.5c0-1.933 1.567-3.5 3.5-3.5h4a1 1 0 010 2h-4a1.5 1.5 0 000 3h2c1.933 0 3.5 1.567 3.5 3.5S21.433 20 19.5 20h-4a1 1 0 010-2h4a1.5 1.5 0 000-3h-2c-1.933 0-3.5-1.567-3.5-3.5z" fill="#ffffff"/>
</svg>
```

- [ ] **Step 4: Favicon + logo de la sidebar dans `admin/index.html`**

Dans `<head>`, après `<title>` :
```html
  <link rel="icon" type="image/svg+xml" href="../images/logo-shammah.svg">
```

Remplacer le bloc `<a href="../index.html" class="sidebar-logo">...</a>` existant par :
```html
        <a href="../index.html" class="sidebar-logo">
          <svg viewBox="0 0 32 32" width="28" height="28" class="brand-mark">
            <rect width="32" height="32" rx="9" fill="#0f172a"/>
            <path d="M12 11.5c0-1.933 1.567-3.5 3.5-3.5h4a1 1 0 010 2h-4a1.5 1.5 0 000 3h2c1.933 0 3.5 1.567 3.5 3.5S21.433 20 19.5 20h-4a1 1 0 010-2h4a1.5 1.5 0 000-3h-2c-1.933 0-3.5-1.567-3.5-3.5z" fill="#ffffff"/>
          </svg>
          <span class="sidebar-logo-text">SHAMMAH</span>
        </a>
```

- [ ] **Step 5: Nav-item "Commandes" dans `admin/index.html`**

Insérer entre le nav-item "Vue d'ensemble" et "Gestion Articles" :
```html
          <div class="nav-item" data-target="panel-orders">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="nav-label">Commandes</span>
          </div>
```

- [ ] **Step 6: Panneau `#panel-orders` dans `admin/index.html`**

Insérer entre la fermeture de `#panel-dashboard` et l'ouverture de `#panel-products` :
```html
      <!-- ==================== PANEL: COMMANDES ==================== -->
      <div class="workspace-panel" id="panel-orders">
        <div class="panel-header">
          <div>
            <h2>Commandes</h2>
            <p>Suivi et mise à jour du statut des commandes clients.</p>
          </div>
        </div>

        <div class="content-card">
          <div class="content-card-header"><h3>Toutes les commandes</h3></div>
          <div class="content-card-body" style="padding:0;">
            <table>
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Moyen</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody id="orders-list-tbody"></tbody>
            </table>
            <div class="empty-state" id="orders-empty-state" style="display:none;">
              <p>Aucune commande pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
```

- [ ] **Step 7: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task5-shell.js`
Expected: PASS pour les 5 assertions.

- [ ] **Step 8: Commit**

```bash
git add images/logo-shammah.svg admin/index.html
git commit -m "feat(admin): add SVG brand mark/favicon and Commandes nav item + panel skeleton"
```

---

### Task 6: Module Dashboard — KPI réels, graphique, panneau Commandes

Corrige le bug d'audit #4 : le dashboard cesse d'afficher des données fictives.

**Files:**
- Create: `admin/js/dashboard.js`
- Modify: `admin/admin.css` (badges de statut de commande, état vide)
- Modify: `admin/index.html` (script tag)
- Modify: `admin/admin.js` (retrait de `loadOverviewMetrics`, `setupChartToggle` et leurs appels dans `initApp`)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task6-dashboard.js`

**Interfaces:**
- Consumes: `window.db.getOrders()`, `window.db.updateOrderStatus()` (Task 1), `window.Toast`, `window.formatPrice` (Task 2), `#orders-list-tbody`/`#orders-empty-state` (Task 5), `window.PaymentIcons` optionnel (Task 12, protégé par test d'existence).
- Produces: `window.Dashboard.refresh()` — à appeler par tout module qui modifie des commandes ou des produits.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task6-dashboard.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.evaluate(() => window.db.saveOrder({
    id: 'SH-TESTORD', date: '25/07/2026', client: 'Test Client', email: 't@example.com',
    address: 'Adresse Test', phone: '+225000000', total: 999000, method: 'Wave', status: 'En attente', items: []
  }));
  await page.reload();

  log('la commande de test apparaît dans le widget Dernières Commandes', await page.locator('#dashboard-recent-orders').innerText().then(t => t.includes('SH-TESTORD')));

  await page.click('.nav-item[data-target="panel-orders"]');
  log('la commande de test apparaît dans le panneau Commandes', await page.locator('#orders-list-tbody').innerText().then(t => t.includes('SH-TESTORD')));

  const revenueBefore = await page.locator('#val-revenue').innerText();
  await page.selectOption('.order-status-select[data-id="SH-TESTORD"]', 'Annulée');
  await page.waitForTimeout(200);
  const revenueAfter = await page.locator('#val-revenue').innerText();
  log('annuler la commande fait baisser le CA affiché', revenueBefore !== revenueAfter);

  await page.reload();
  await page.click('.nav-item[data-target="panel-orders"]');
  const statusAfterReload = await page.locator('.order-status-select[data-id="SH-TESTORD"]').inputValue();
  log('le changement de statut est persisté après rechargement', statusAfterReload === 'Annulée');

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task6-dashboard.js`
Expected: FAIL — le widget affiche encore les commandes fictives codées en dur, `.order-status-select` introuvable.

- [ ] **Step 3: Créer `admin/js/dashboard.js`**

```javascript
(function () {
  "use strict";

  function statusBadgeClass(status) {
    if (status === "Payée") return "success";
    if (status === "Expédiée") return "info";
    if (status === "Annulée") return "danger";
    return "warning";
  }

  function methodDisplay(method) {
    return window.PaymentIcons ? window.PaymentIcons.forMethodLabel(method) : method;
  }

  function loadOverviewMetrics() {
    const orders = window.db.getOrders();
    const products = window.db.getProducts();

    const totalModelsEl = document.getElementById("val-stock");
    if (totalModelsEl) totalModelsEl.textContent = products.length + " Modèles";

    const activeOrders = orders.filter(o => o.status === "En attente" || o.status === "Payée");
    const revenueOrders = orders.filter(o => o.status !== "Annulée");
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const avgBasket = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;

    const ordersEl = document.getElementById("val-orders");
    if (ordersEl) ordersEl.textContent = activeOrders.length + " Commandes";

    const revenueEl = document.getElementById("val-revenue");
    if (revenueEl) revenueEl.textContent = window.formatPrice(totalRevenue);

    const basketEl = document.getElementById("val-basket");
    if (basketEl) basketEl.textContent = window.formatPrice(avgBasket);

    renderRecentOrdersWidget(orders);
  }

  function renderRecentOrdersWidget(orders) {
    const tbody = document.getElementById("dashboard-recent-orders");
    if (!tbody) return;
    tbody.innerHTML = "";
    // localStorage.push conserve l'ordre chronologique d'insertion : les 5 derniers éléments
    // sont donc les plus récents, contrairement à un tri par id (les id sont générés aléatoirement).
    orders.slice(-5).reverse().forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td style=\"padding:10px 14px; font-weight:700;\">" + o.id + "</td>" +
        "<td style=\"padding:10px 14px;\">" + window.formatPrice(o.total) + "</td>" +
        "<td style=\"padding:10px 14px;\">" + methodDisplay(o.method) + "</td>" +
        "<td style=\"padding:10px 14px; text-align:right;\"><span class=\"badge-status " + statusBadgeClass(o.status) + "\"><span class=\"bullet-dot\"></span> " + o.status + "</span></td>";
      tbody.appendChild(tr);
    });
  }

  function loadOrdersPanel() {
    const tbody = document.getElementById("orders-list-tbody");
    const emptyState = document.getElementById("orders-empty-state");
    if (!tbody) return;

    const orders = window.db.getOrders().slice().reverse();
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = orders.length ? "none" : "flex";

    orders.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + o.id + "</td>" +
        "<td>" + o.client + "</td>" +
        "<td>" + o.date + "</td>" +
        "<td>" + window.formatPrice(o.total) + "</td>" +
        "<td>" + methodDisplay(o.method) + "</td>" +
        "<td><select class=\"order-status-select\" data-id=\"" + o.id + "\">" +
          ["En attente", "Payée", "Expédiée", "Annulée"].map(s =>
            "<option value=\"" + s + "\"" + (s === o.status ? " selected" : "") + ">" + s + "</option>"
          ).join("") +
        "</select></td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".order-status-select").forEach(select => {
      select.addEventListener("change", () => {
        window.db.updateOrderStatus(select.dataset.id, select.value);
        window.Toast.show("Statut de la commande " + select.dataset.id + " mis à jour.", "success");
        refresh();
      });
    });
  }

  function refresh() {
    loadOverviewMetrics();
    loadOrdersPanel();
  }

  function setupChartToggle() {
    const btnWeek = document.getElementById("btn-chart-week");
    const btnMonth = document.getElementById("btn-chart-month");
    if (!btnWeek || !btnMonth) return;

    const curvePath = document.getElementById("chart-curve-path");
    const areaPath = document.getElementById("chart-area-path");
    const cursorLine = document.getElementById("chart-cursor-line");
    const glowDot = document.getElementById("chart-glow-dot");
    const innerDot = document.getElementById("chart-inner-dot");
    const tooltipGroup = document.getElementById("chart-tooltip-group");
    const tooltipText = document.getElementById("chart-tooltip-text");
    const trendBadge = document.getElementById("chart-trend-badge");
    const lbl1 = document.getElementById("chart-label-1");
    const lbl2 = document.getElementById("chart-label-2");
    const lbl3 = document.getElementById("chart-label-3");
    const lbl4 = document.getElementById("chart-label-4");

    const weeklyData = {
      curve: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75",
      area: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75 L 330 110 L 20 110 Z",
      cx: 240, cy: 45, tooltipTranslate: "translate(200, 7)", tooltipValue: "245 000 FCFA",
      trend: "+12.5% vs semaine dernière", labels: ["Lun", "Mer", "Ven", "Dim"]
    };
    const monthlyData = {
      curve: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55",
      area: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55 L 330 110 L 20 110 Z",
      cx: 240, cy: 35, tooltipTranslate: "translate(200, -3)", tooltipValue: "1 050 000 FCFA",
      trend: "+18.3% vs mois dernier", labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
    };

    function updateChart(data) {
      if (curvePath) curvePath.setAttribute("d", data.curve);
      if (areaPath) areaPath.setAttribute("d", data.area);
      if (cursorLine) { cursorLine.setAttribute("x1", data.cx); cursorLine.setAttribute("x2", data.cx); }
      if (glowDot) { glowDot.setAttribute("cx", data.cx); glowDot.setAttribute("cy", data.cy); }
      if (innerDot) { innerDot.setAttribute("cx", data.cx); innerDot.setAttribute("cy", data.cy); }
      if (tooltipGroup) tooltipGroup.setAttribute("transform", data.tooltipTranslate);
      if (tooltipText) tooltipText.textContent = data.tooltipValue;
      if (trendBadge) trendBadge.textContent = data.trend;
      if (lbl1) lbl1.textContent = data.labels[0];
      if (lbl2) lbl2.textContent = data.labels[1];
      if (lbl3) lbl3.textContent = data.labels[2];
      if (lbl4) lbl4.textContent = data.labels[3];
    }

    btnWeek.addEventListener("click", () => { btnWeek.classList.add("active"); btnMonth.classList.remove("active"); updateChart(weeklyData); });
    btnMonth.addEventListener("click", () => { btnMonth.classList.add("active"); btnWeek.classList.remove("active"); updateChart(monthlyData); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    setupChartToggle();
  });

  window.Dashboard = { refresh: refresh };
})();
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
.order-status-select {
  height: 30px; border: 1px solid var(--border-medium); border-radius: 6px; padding: 0 8px;
  font-family: inherit; font-size: 0.75rem; background: var(--bg-panel); color: var(--text-primary);
}
.empty-state { display: flex; align-items: center; justify-content: center; padding: 40px 20px; color: var(--text-secondary); font-size: 0.85rem; }
```

- [ ] **Step 5: Retirer la logique fictive d'`admin/admin.js`**

Supprimer entièrement la fonction `loadOverviewMetrics()` (données de commandes codées en dur) et la fonction `setupChartToggle()` de `admin/admin.js`, ainsi que leurs appels `loadOverviewMetrics();` et `setupChartToggle();` dans `initApp()`.

- [ ] **Step 6: Charger `dashboard.js` dans `admin/index.html`**

Après `<script src="js/ui-kit.js"></script>` :
```html
  <script src="js/dashboard.js"></script>
```

- [ ] **Step 7: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task6-dashboard.js`
Expected: PASS pour les 4 assertions.

- [ ] **Step 8: Commit**

```bash
git add admin/js/dashboard.js admin/admin.css admin/admin.js admin/index.html
git commit -m "feat(admin): wire dashboard KPIs and new Commandes panel to real order data"
```

---

### Task 7: Module Catégories — extraction + suppression

**Files:**
- Create: `admin/js/categories.js`
- Modify: `admin/admin.css`
- Modify: `admin/index.html` (script tag)
- Modify: `admin/admin.js` (retrait de `loadCategoryTree`, `setupSettingsForms`, et de leurs appels)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task7-categories.js`

**Interfaces:**
- Consumes: `window.db.saveCategory/getCategories/saveSubcategory/getSubcategories/deleteCategory/deleteSubcategory` (Task 1 / existant), `window.Toast`, `window.ConfirmModal` (Task 2).
- Produces: `window.CategoriesPanel.refresh()`.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task7-categories.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);
  await page.click('.nav-item[data-target="panel-settings"]');

  await page.fill('#cat-name', 'Bijoux Test');
  await page.click('#btn-save-category');
  log('la nouvelle catégorie apparaît dans l\'arbre', await page.locator('.category-tree-item', { hasText: 'Bijoux Test' }).count() === 1);
  log('aucune alerte native n\'a été utilisée (toast affiché à la place)', await page.locator('.toast', { hasText: 'créée' }).count() === 1);

  await page.click('.category-tree-item:has-text("Bijoux Test") .category-remove-btn');
  await page.click('.confirm-modal-actions [data-action="confirm"]');
  log('la catégorie disparaît de l\'arbre après confirmation de suppression', await page.locator('.category-tree-item', { hasText: 'Bijoux Test' }).count() === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task7-categories.js`
Expected: FAIL — `.category-tree-item` n'existe pas encore (l'ancien code utilise une autre structure sans bouton de suppression).

- [ ] **Step 3: Créer `admin/js/categories.js`**

```javascript
(function () {
  "use strict";

  let categoryImageDataUrl = "images/category_kid.png";

  function populateSubcategoryParentSelect() {
    const select = document.getElementById("subcat-parent");
    if (!select) return;
    select.innerHTML = "";
    window.db.getCategories().forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  }

  function loadCategoryTree() {
    const container = document.getElementById("list-settings-categories");
    if (!container) return;
    container.innerHTML = "";

    const categories = window.db.getCategories();
    const subcategories = window.db.getSubcategories();

    categories.forEach(cat => {
      const subs = subcategories.filter(s => s.category_slug === cat.slug);
      const div = document.createElement("div");
      div.className = "category-tree-item";
      div.innerHTML =
        '<div class="category-tree-photo"><img src="../' + cat.image_url + '" alt="' + cat.name + '"></div>' +
        '<div class="category-tree-info">' +
          '<span class="category-tree-name">' + cat.name + '</span>' +
          '<div class="category-tree-subs">' +
            (subs.length
              ? subs.map(s => '<span class="badge-status info category-subcat-chip">' + s.name + '<button type="button" class="category-subcat-remove" data-cat="' + cat.slug + '" data-sub="' + s.slug + '">&times;</button></span>').join("")
              : '<em>Aucune sous-catégorie</em>') +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-danger category-remove-btn" data-slug="' + cat.slug + '">Supprimer</button>';
      container.appendChild(div);
    });

    container.querySelectorAll(".category-remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.ConfirmModal.open({
          title: "Supprimer la catégorie",
          message: "Cela supprimera aussi toutes ses sous-catégories. Continuer ?",
          confirmLabel: "Supprimer",
          danger: true
        }).then(confirmed => {
          if (!confirmed) return;
          window.db.deleteCategory(btn.dataset.slug);
          window.Toast.show("Catégorie supprimée.", "success");
          loadCategoryTree();
          populateSubcategoryParentSelect();
        });
      });
    });

    container.querySelectorAll(".category-subcat-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        window.db.deleteSubcategory(btn.dataset.cat, btn.dataset.sub);
        window.Toast.show("Sous-catégorie supprimée.", "success");
        loadCategoryTree();
      });
    });
  }

  function setupCategoryForm() {
    const fileInput = document.getElementById("cat-image-file");
    const uploaderBox = document.getElementById("cat-uploader-box");
    const uploadLabel = document.getElementById("cat-upload-label");
    const btnSave = document.getElementById("btn-save-category");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          categoryImageDataUrl = evt.target.result;
          uploadLabel.textContent = "Image sélectionnée : " + file.name;
          uploaderBox.style.borderColor = "var(--accent-green)";
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnSave) {
      btnSave.addEventListener("click", () => {
        const name = document.getElementById("cat-name").value.trim();
        if (!name) {
          window.Toast.show("Veuillez entrer le nom de la catégorie.", "error");
          return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        window.db.saveCategory({ slug: slug, name: name, image_url: categoryImageDataUrl });
        window.Toast.show('Catégorie "' + name + '" créée avec succès.', "success");

        document.getElementById("form-add-category").reset();
        uploadLabel.textContent = "Déposer la photo ou cliquer pour choisir";
        uploaderBox.style.borderColor = "var(--border-medium)";
        categoryImageDataUrl = "images/category_kid.png";

        populateSubcategoryParentSelect();
        loadCategoryTree();
      });
    }
  }

  function setupSubcategoryForm() {
    const btnSave = document.getElementById("btn-save-subcategory");
    if (!btnSave) return;

    btnSave.addEventListener("click", () => {
      const name = document.getElementById("subcat-name").value.trim();
      const parent = document.getElementById("subcat-parent").value;
      if (!name) {
        window.Toast.show("Veuillez entrer le nom de la sous-catégorie.", "error");
        return;
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      window.db.saveSubcategory({ category_slug: parent, name: name, slug: slug });
      window.Toast.show('Sous-catégorie "' + name + '" créée avec succès.', "success");
      document.getElementById("form-add-subcategory").reset();
      loadCategoryTree();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    populateSubcategoryParentSelect();
    loadCategoryTree();
    setupCategoryForm();
    setupSubcategoryForm();
  });

  window.CategoriesPanel = { refresh: function () { populateSubcategoryParentSelect(); loadCategoryTree(); } };
})();
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
.category-tree-item {
  display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light);
  border-radius: 8px; padding: 10px 14px; background: var(--bg-panel); box-shadow: var(--shadow-sm); text-align: left;
}
.category-tree-photo { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 1px solid var(--border-light); flex-shrink: 0; }
.category-tree-photo img { width: 100%; height: 100%; object-fit: cover; }
.category-tree-info { flex: 1; }
.category-tree-name { font-size: 0.75rem; font-weight: 800; color: var(--text-primary); display: block; }
.category-tree-subs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.category-subcat-chip { display: inline-flex; align-items: center; gap: 4px; }
.category-subcat-remove { border: none; background: none; cursor: pointer; color: inherit; font-size: 0.8rem; line-height: 1; }
```

- [ ] **Step 5: Retirer la logique portée d'`admin/admin.js`**

Supprimer `loadCategoryTree()` et `setupSettingsForms()` en entier dans `admin/admin.js`, et retirer les appels `loadCategoryTree();` et `setupSettingsForms();` d'`initApp()`. Ne pas toucher à `populateCategoryDropdowns()`/`loadSubcategoryOptions()` : ces fonctions gèrent encore l'ancien formulaire produit inline (`#prod-category`/`#prod-subcategory`) qui n'est retiré qu'à la Task 11, et remplissent aussi `#subcat-parent` de façon redondante avec `categories.js` — une redondance sans impact fonctionnel (les deux écrivent les mêmes options), qui disparaît d'elle-même à la Task 11 quand ces fonctions sont supprimées en bloc. Éditer partiellement une fonction partagée par deux préoccupations serait plus risqué que cette redondance temporaire.

- [ ] **Step 6: Charger `categories.js` dans `admin/index.html`**

Après `<script src="js/dashboard.js"></script>` :
```html
  <script src="js/categories.js"></script>
```

- [ ] **Step 7: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task7-categories.js`
Expected: PASS pour les 3 assertions.

- [ ] **Step 8: Commit**

```bash
git add admin/js/categories.js admin/admin.css admin/admin.js admin/index.html
git commit -m "feat(admin): extract categories panel into its own module and add category/subcategory deletion"
```

---

### Task 8: Module Codes Promo — extraction + toasts

**Files:**
- Create: `admin/js/promos.js`
- Modify: `admin/index.html` (script tag)
- Modify: `admin/admin.js` (retrait de `loadPromoCodes`, `setupPromoCodesForm`, `populatePromoDropdown`, `renderQuickPromoList`, `deletePromoCode`, et de leurs appels)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task8-promos.js`

**Interfaces:**
- Consumes: `window.db.getPromoCodes/savePromoCode/deletePromoCode` (existant), `window.Toast`, `window.ConfirmModal`, `window.formatPrice`.
- Produces: `window.PromosPanel.refresh()`.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task8-promos.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);
  await page.click('.nav-item[data-target="panel-promos"]');

  await page.fill('#promo-code', 'TESTPROMO');
  await page.selectOption('#promo-type', 'percent');
  await page.fill('#promo-value', '15');
  await page.click('#btn-save-promo');

  log('le code promo apparaît dans le tableau', await page.locator('#promo-list-tbody', { hasText: 'TESTPROMO' }).count() === 1);
  log('un toast de succès est affiché (pas d\'alert natif)', await page.locator('.toast-success').count() === 1);

  await page.click('.promo-delete-btn[data-code="TESTPROMO"]');
  await page.click('.confirm-modal-actions [data-action="confirm"]');
  log('le code promo est retiré après confirmation', await page.evaluate(() => !window.db.getPromoCodes().some(p => p.code === 'TESTPROMO')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task8-promos.js`
Expected: FAIL — `.promo-delete-btn`/`.toast-success` absents (l'ancien code utilise `alert()`/`confirm()` natifs).

- [ ] **Step 3: Créer `admin/js/promos.js`**

```javascript
(function () {
  "use strict";

  function loadPromoCodes() {
    const tbody = document.getElementById("promo-list-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    window.db.getPromoCodes().forEach(p => {
      const tr = document.createElement("tr");
      const active = p.active === true || p.active === "true";
      const statusBadge = active
        ? '<span class="badge-status success"><span class="bullet-dot"></span> Actif</span>'
        : '<span class="badge-status warning"><span class="bullet-dot"></span> Inactif</span>';
      const typeLabel = p.type === "percent" ? "Pourcentage" : "Montant Fixe";
      const valLabel = p.type === "percent" ? p.value + "%" : window.formatPrice(p.value);

      tr.innerHTML =
        "<td>" + p.code + "</td>" +
        "<td>" + typeLabel + "</td>" +
        "<td>" + valLabel + "</td>" +
        "<td>" + statusBadge + "</td>" +
        '<td style="text-align:center;"><button type="button" class="btn-danger promo-delete-btn" data-code="' + p.code + '">Supprimer</button></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".promo-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.ConfirmModal.open({
          title: "Supprimer le code promo",
          message: 'Voulez-vous vraiment supprimer le code promo "' + btn.dataset.code + '" ?',
          confirmLabel: "Supprimer",
          danger: true
        }).then(confirmed => {
          if (!confirmed) return;
          window.db.deletePromoCode(btn.dataset.code);
          window.Toast.show('Code promo "' + btn.dataset.code + '" supprimé.', "success");
          loadPromoCodes();
        });
      });
    });
  }

  function setupPromoForm() {
    const btnSave = document.getElementById("btn-save-promo");
    if (!btnSave) return;

    btnSave.addEventListener("click", () => {
      const code = document.getElementById("promo-code").value.trim().toUpperCase();
      const type = document.getElementById("promo-type").value;
      const value = parseFloat(document.getElementById("promo-value").value);
      const active = document.getElementById("promo-active").value === "true";

      if (!code || isNaN(value) || value < 0) {
        window.Toast.show("Veuillez remplir correctement les champs.", "error");
        return;
      }

      window.db.savePromoCode({ code: code, type: type, value: value, active: active });
      window.Toast.show('Code promo "' + code + '" enregistré avec succès.', "success");
      document.getElementById("form-add-promo").reset();
      loadPromoCodes();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadPromoCodes();
    setupPromoForm();
  });

  window.PromosPanel = { refresh: loadPromoCodes };
})();
```

- [ ] **Step 4: Retirer la logique portée d'`admin/admin.js`**

Supprimer `loadPromoCodes()`, `setupPromoCodesForm()`, `populatePromoDropdown()`, `renderQuickPromoList()`, `window.deletePromoCode`, et leurs appels dans `initApp()`. La constante/le conteneur `#quick-promo-list` (widget "Codes Promo Actifs" du panneau Produits) est retiré à la Task 11 en même temps que la refonte du panneau Produits — ne rien faire ici pour ce widget.

- [ ] **Step 5: Charger `promos.js` dans `admin/index.html`**

Après `<script src="js/categories.js"></script>` :
```html
  <script src="js/promos.js"></script>
```

- [ ] **Step 6: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task8-promos.js`
Expected: PASS pour les 3 assertions.

- [ ] **Step 7: Commit**

```bash
git add admin/js/promos.js admin/admin.js admin/index.html
git commit -m "feat(admin): extract promo codes panel into its own module using toasts and confirm modal"
```

---

### Task 9: Éditeur de variantes — chips de tailles

Corrige le bug d'audit #2 (tailles génériques imposées par la catégorie plutôt que par le produit réel).

**Files:**
- Create: `admin/js/variant-editor.js`
- Modify: `admin/admin.css`
- Modify: `admin/index.html` (script tag)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task9-sizechips.js`

**Interfaces:**
- Produces: `window.VariantEditor.mount(container, {sizes, variants, onChange}) → handle` où `handle = { getState(): {sizes, variants}, addColor(name, color), destroy() }`.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task9-sizechips.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  await page.evaluate(() => {
    const div = document.createElement('div');
    div.id = 'test-mount';
    document.body.appendChild(div);
    window.__handle = window.VariantEditor.mount(div, {
      sizes: ['30', '32'],
      variants: [],
      onChange: (s) => { window.__lastChange = s; }
    });
  });

  log('les chips de tailles initiales sont affichées (30, 32)', await page.locator('#test-mount .size-chip').count() === 2);

  await page.fill('#test-mount .size-chip-input', '34');
  await page.click('#test-mount .size-chip-add-btn');
  log('ajouter une taille crée une 3e chip', await page.locator('#test-mount .size-chip').count() === 3);
  log('getState reflète la nouvelle taille', await page.evaluate(() => window.__handle.getState().sizes.includes('34')));

  await page.click('#test-mount .size-chip:has-text("30") .size-chip-remove');
  log('supprimer une chip la retire de getState', await page.evaluate(() => !window.__handle.getState().sizes.includes('30')));

  await page.evaluate(() => window.__handle.addColor('Noir', '#000000'));
  log('addColor crée une carte de couleur', await page.locator('#test-mount .variant-color-card', { hasText: 'Noir' }).count() === 1);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task9-sizechips.js`
Expected: FAIL — `window.VariantEditor is not defined`.

- [ ] **Step 3: Créer `admin/js/variant-editor.js`**

```javascript
(function () {
  "use strict";

  function createChipsEditor(container, initialSizes, onSizesChange) {
    let sizes = initialSizes.slice();

    function render() {
      container.innerHTML = "";
      const list = document.createElement("div");
      list.className = "size-chip-list";

      sizes.forEach((size, index) => {
        const chip = document.createElement("span");
        chip.className = "size-chip";
        chip.innerHTML = '<span></span><button type="button" class="size-chip-remove" data-index="' + index + '">&times;</button>';
        chip.querySelector("span").textContent = size;
        chip.querySelector(".size-chip-remove").addEventListener("click", () => {
          sizes.splice(index, 1);
          onSizesChange(sizes.slice());
          render();
        });
        list.appendChild(chip);
      });

      const addWrap = document.createElement("div");
      addWrap.className = "size-chip-add";
      addWrap.innerHTML =
        '<input type="text" class="size-chip-input" placeholder="Ajouter une taille (Ex: 42, XXL)">' +
        '<button type="button" class="btn-secondary size-chip-add-btn">Ajouter</button>';
      const input = addWrap.querySelector(".size-chip-input");
      const addBtn = addWrap.querySelector(".size-chip-add-btn");

      function commitAdd() {
        const val = input.value.trim();
        if (val === "" || sizes.includes(val)) { input.value = ""; return; }
        sizes.push(val);
        onSizesChange(sizes.slice());
        input.value = "";
        render();
      }

      addBtn.addEventListener("click", commitAdd);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commitAdd(); }
      });

      list.appendChild(addWrap);
      container.appendChild(list);
    }

    render();
    return {
      getSizes() { return sizes.slice(); },
      setSizes(newSizes) { sizes = newSizes.slice(); render(); }
    };
  }

  function mount(container, options) {
    options = options || {};
    const initialSizes = options.sizes && options.sizes.length ? options.sizes.slice() : ["S", "M", "L", "XL"];
    const variants = (options.variants || []).map(v => ({
      id: "var-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      name: v.name || "",
      color: v.color || "#000000",
      images: (v.images || []).slice(0, 3).concat([null, null, null]).slice(0, 3),
      sizesStock: Object.assign({}, v.sizesStock || {})
    }));
    const onChange = typeof options.onChange === "function" ? options.onChange : function () {};

    container.innerHTML = "";
    const sizesSection = document.createElement("div");
    sizesSection.className = "variant-editor-sizes";
    container.appendChild(sizesSection);

    const variantsSection = document.createElement("div");
    variantsSection.className = "variant-editor-colors";
    container.appendChild(variantsSection);

    function emitChange() {
      onChange({
        sizes: chipsApi.getSizes(),
        variants: variants.map(v => ({ name: v.name, color: v.color, images: v.images.slice(), sizesStock: Object.assign({}, v.sizesStock) }))
      });
    }

    const chipsApi = createChipsEditor(sizesSection, initialSizes, () => {
      renderVariantsSection();
      emitChange();
    });

    function renderVariantsSection() {
      variantsSection.innerHTML = "";
      variants.forEach(v => variantsSection.appendChild(renderColorCard(v)));
    }

    function renderColorCard(v) {
      // Implémentation minimale à cette étape : nom + pastille + suppression.
      // La Task 10 remplace cette fonction pour ajouter les photos, la grille de stock et le glisser-déposer.
      const card = document.createElement("div");
      card.className = "variant-color-card";
      card.dataset.variantId = v.id;
      card.innerHTML =
        '<div class="variant-color-card-header">' +
          '<span class="variant-color-swatch" style="background:' + v.color + '"></span>' +
          '<span class="variant-color-name"></span>' +
          '<button type="button" class="btn-secondary variant-color-remove">Supprimer</button>' +
        '</div>';
      card.querySelector(".variant-color-name").textContent = v.name || "Nouvelle couleur";
      card.querySelector(".variant-color-remove").addEventListener("click", () => {
        const idx = variants.findIndex(x => x.id === v.id);
        if (idx !== -1) variants.splice(idx, 1);
        renderVariantsSection();
        emitChange();
      });
      return card;
    }

    renderVariantsSection();

    return {
      getState() {
        return {
          sizes: chipsApi.getSizes(),
          variants: variants.map(v => ({ name: v.name, color: v.color, images: v.images.slice(), sizesStock: Object.assign({}, v.sizesStock) }))
        };
      },
      addColor(name, color) {
        variants.push({ id: "var-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), name: name, color: color, images: [null, null, null], sizesStock: {} });
        renderVariantsSection();
        emitChange();
      },
      destroy() { container.innerHTML = ""; }
    };
  }

  window.VariantEditor = { mount: mount };
})();
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
.variant-editor-sizes { margin-bottom: 16px; }
.size-chip-list { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.size-chip {
  display: inline-flex; align-items: center; gap: 6px; background: var(--bg-primary);
  border: 1px solid var(--border-medium); border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 600;
}
.size-chip-remove { border: none; background: none; cursor: pointer; color: var(--text-secondary); font-size: 0.9rem; line-height: 1; }
.size-chip-remove:hover { color: var(--accent-red); }
.size-chip-add { display: inline-flex; gap: 6px; align-items: center; }
.size-chip-input {
  height: 30px; border: 1px dashed var(--border-medium); border-radius: 6px; padding: 0 8px;
  font-size: 0.75rem; font-family: inherit; outline: none; width: 190px; background: var(--bg-panel); color: var(--text-primary);
}
.variant-editor-colors { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.variant-color-card { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: 10px; padding: 14px; }
.variant-color-card-header { display: flex; align-items: center; gap: 10px; }
.variant-color-swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--border-medium); flex-shrink: 0; }
.variant-color-name { flex: 1; font-size: 0.8rem; font-weight: 700; }
```

- [ ] **Step 5: Charger `variant-editor.js` dans `admin/index.html`**

Après `<script src="../js/db.js"></script>` et avant `<script src="js/ui-kit.js"></script>` (aucune dépendance entre eux, mais garde l'ordre indiqué dans la spec §3) :
```html
  <script src="js/variant-editor.js"></script>
```

- [ ] **Step 6: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task9-sizechips.js`
Expected: PASS pour les 5 assertions.

- [ ] **Step 7: Commit**

```bash
git add admin/js/variant-editor.js admin/admin.css admin/index.html
git commit -m "feat(admin): add VariantEditor with per-product editable size chips"
```

---

### Task 10: Éditeur de variantes — photos glisser-déposer, grille de stock, réorganisation

Corrige le bug d'audit #3 (les saisies de stock étaient perdues lors d'un nouveau rendu).

**Files:**
- Modify: `admin/js/variant-editor.js` (remplace `renderColorCard`)
- Modify: `admin/admin.css`
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task10-colorcards.js`

**Interfaces:**
- Consumes/Produces : identiques à la Task 9 (`mount/getState/addColor/destroy`), désormais avec un rendu complet des cartes couleur.

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task10-colorcards.js` (utilise une image réelle du projet comme fichier à téléverser) :
```javascript
const { chromium } = require('playwright');
const path = require('path');
const BASE = 'http://127.0.0.1:8811/admin/index.html';
const TEST_IMAGE = 'c:\\Users\\monep\\OneDrive\\Desktop\\Tous mes dossiers\\PROJET WEB\\Shammah 2.0\\images\\product_male.png';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  await page.evaluate(() => {
    const div = document.createElement('div');
    div.id = 'test-mount';
    document.body.appendChild(div);
    window.__handle = window.VariantEditor.mount(div, {
      sizes: ['S', 'M'],
      variants: [{ name: 'Noir', color: '#000000', images: [], sizesStock: { S: 5, M: 5 } }],
      onChange: () => {}
    });
  });

  log('la grille de stock affiche une entrée par taille', await page.locator('#test-mount .variant-stock-input').count() === 2);

  await page.setInputFiles('#test-mount .variant-photo-input[data-slot="0"]', TEST_IMAGE);
  await page.waitForTimeout(200);
  log('la photo apparaît dans la 1ère dropzone', await page.locator('#test-mount .variant-photo-dropzone[data-slot="0"] img').count() === 1);

  await page.fill('#test-mount .variant-stock-input[data-size="M"]', '12');
  await page.evaluate(() => document.querySelector('#test-mount .variant-stock-input[data-size="M"]').dispatchEvent(new Event('input', { bubbles: true })));

  await page.evaluate(() => window.__handle.addColor('Blanc', '#ffffff'));
  const stockAfterAddingColor = await page.evaluate(() => window.__handle.getState().variants[0].sizesStock.M);
  log('ajouter une couleur ne réinitialise pas le stock déjà saisi de la 1ère couleur (bug #3)', stockAfterAddingColor === 12);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task10-colorcards.js`
Expected: FAIL — `.variant-stock-input`/`.variant-photo-dropzone` n'existent pas encore (Task 9 ne rendait que nom + pastille).

- [ ] **Step 3: Remplacer `renderColorCard` dans `admin/js/variant-editor.js`**

Remplacer entièrement la fonction `renderColorCard(v)` de la Task 9 par :
```javascript
    function renderColorCard(v) {
      const currentSizes = chipsApi.getSizes();
      const card = document.createElement("div");
      card.className = "variant-color-card";
      card.draggable = true;
      card.dataset.variantId = v.id;

      const stockGridHTML = currentSizes.map(size => {
        const val = v.sizesStock[size] !== undefined ? v.sizesStock[size] : 5;
        return '<div class="variant-stock-field"><label></label><input type="number" min="0" class="variant-stock-input" data-size="' + size + '" value="' + val + '"></div>';
      }).join("");

      const dropzonesHTML = [0, 1, 2].map(i => {
        const img = v.images[i];
        return '<div class="variant-photo-dropzone" data-slot="' + i + '">' +
          (img ? '<img src="' + img + '" alt="Photo ' + (i + 1) + '"><button type="button" class="variant-photo-remove" data-slot="' + i + '">&times;</button>' : '<span class="variant-photo-placeholder">Photo ' + (i + 1) + '</span>') +
          '<input type="file" accept="image/*" class="variant-photo-input" data-slot="' + i + '" hidden></div>';
      }).join("");

      card.innerHTML =
        '<div class="variant-color-card-header">' +
          '<span class="variant-drag-handle">&#10021;</span>' +
          '<span class="variant-color-swatch" style="background:' + v.color + '"></span>' +
          '<input type="text" class="variant-color-name-input" value="" placeholder="Nom de la couleur">' +
          '<button type="button" class="btn-secondary variant-color-remove">Supprimer</button>' +
        '</div>' +
        '<div class="variant-stock-grid">' + stockGridHTML + '</div>' +
        '<div class="variant-photo-grid">' + dropzonesHTML + '</div>';

      card.querySelectorAll(".variant-stock-field label").forEach((label, idx) => { label.textContent = currentSizes[idx]; });
      card.querySelector(".variant-color-name-input").value = v.name;

      card.querySelector(".variant-color-name-input").addEventListener("input", (e) => {
        v.name = e.target.value;
        emitChange();
      });

      card.querySelector(".variant-color-remove").addEventListener("click", () => {
        const idx = variants.findIndex(x => x.id === v.id);
        if (idx !== -1) variants.splice(idx, 1);
        renderVariantsSection();
        emitChange();
      });

      card.querySelectorAll(".variant-stock-input").forEach(input => {
        input.addEventListener("input", () => {
          v.sizesStock[input.dataset.size] = Math.max(0, parseInt(input.value, 10) || 0);
          emitChange();
        });
      });

      function handleFile(slotIndex, file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          v.images[slotIndex] = evt.target.result;
          renderVariantsSection();
          emitChange();
        };
        reader.readAsDataURL(file);
      }

      card.querySelectorAll(".variant-photo-dropzone").forEach(zone => {
        const slot = parseInt(zone.dataset.slot, 10);
        const fileInput = zone.querySelector(".variant-photo-input");

        zone.addEventListener("click", (e) => {
          if (e.target.classList.contains("variant-photo-remove")) return;
          fileInput.click();
        });
        fileInput.addEventListener("change", (e) => handleFile(slot, e.target.files[0]));

        zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
        zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
        zone.addEventListener("drop", (e) => {
          e.preventDefault();
          zone.classList.remove("drag-over");
          handleFile(slot, e.dataTransfer.files && e.dataTransfer.files[0]);
        });

        const removeBtn = zone.querySelector(".variant-photo-remove");
        if (removeBtn) {
          removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            v.images[slot] = null;
            renderVariantsSection();
            emitChange();
          });
        }
      });

      card.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", v.id); card.classList.add("dragging"); });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("dragover", (e) => e.preventDefault());
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId === v.id) return;
        const fromIndex = variants.findIndex(x => x.id === draggedId);
        const toIndex = variants.findIndex(x => x.id === v.id);
        if (fromIndex === -1 || toIndex === -1) return;
        const moved = variants.splice(fromIndex, 1)[0];
        variants.splice(toIndex, 0, moved);
        renderVariantsSection();
        emitChange();
      });

      return card;
    }
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

Retirer d'abord la règle `.variant-color-name { flex: 1; font-size: 0.8rem; font-weight: 700; }` ajoutée à la Task 9 : le `<span class="variant-color-name">` qu'elle stylait est remplacé ci-dessus par `<input class="variant-color-name-input">`, elle est donc désormais orpheline.

```css
.variant-color-card.dragging { opacity: 0.4; }
.variant-drag-handle { cursor: grab; color: var(--text-secondary); }
.variant-color-name-input {
  flex: 1; height: 30px; border: 1px solid var(--border-medium); border-radius: 6px; padding: 0 8px;
  font-size: 0.8rem; font-family: inherit; outline: none; background: var(--bg-panel); color: var(--text-primary);
}
.variant-stock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 8px; margin: 10px 0; }
.variant-stock-field label { display: block; font-size: 0.6rem; color: var(--text-secondary); margin-bottom: 2px; text-align: center; }
.variant-stock-input { width: 100%; height: 28px; text-align: center; border: 1px solid var(--border-medium); border-radius: 6px; font-family: inherit; background: var(--bg-panel); color: var(--text-primary); }
.variant-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.variant-photo-dropzone {
  position: relative; height: 72px; border: 1.5px dashed var(--border-medium); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; background: var(--bg-panel);
}
.variant-photo-dropzone.drag-over { border-color: var(--accent-blue); background: #eff6ff; }
.variant-photo-dropzone img { width: 100%; height: 100%; object-fit: cover; }
.variant-photo-placeholder { font-size: 0.65rem; color: var(--text-secondary); }
.variant-photo-remove {
  position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; border: none;
  background: rgba(15,23,42,0.7); color: #fff; cursor: pointer; font-size: 0.75rem; line-height: 1;
}
```

- [ ] **Step 5: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task10-colorcards.js`
Expected: PASS pour les 3 assertions, en particulier la régression du bug #3.

- [ ] **Step 6: Commit**

```bash
git add admin/js/variant-editor.js admin/admin.css
git commit -m "fix(admin): variant editor keeps live-synced stock/photos across re-renders, adds drag & drop"
```

---

### Task 11: Module Produits — inventaire corrigé + panneau latéral de création/édition

Corrige le bug d'audit #1 (perte de stock silencieuse) et #2 (tailles fausses à l'édition), et livre le nouveau drawer premium avec aperçu en direct.

**Files:**
- Create: `admin/js/products.js`
- Modify: `admin/admin.css`
- Modify: `admin/index.html` (remplace le formulaire inline du panneau Produits par un bouton + tableau pleine largeur ; script tag)
- Modify: `admin/admin.js` (retrait de toute la logique produits restante)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task11-products.js`

**Interfaces:**
- Consumes: `window.VariantEditor.mount/getState/addColor/destroy` (Tasks 9-10), `window.db.*` (produits/catégories/sous-catégories/promos), `window.Toast`, `window.ConfirmModal`, `window.formatPrice` (Task 2), `window.Dashboard.refresh()` (Task 6).
- Produces: `window.ProductsPanel = { openCreateDrawer(), openEditDrawer(id) }` — consommé par la palette de commandes (Task 4, déjà posée en mode protégé).

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task11-products.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';
const TEST_IMAGE = 'c:\\Users\\monep\\OneDrive\\Desktop\\Tous mes dossiers\\PROJET WEB\\Shammah 2.0\\images\\product_male.png';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);
  await page.click('.nav-item[data-target="panel-products"]');

  // Bug #2 : éditer un produit à tailles non-génériques doit montrer ses vraies tailles
  await page.click('button[data-action="edit"][data-id="pantalon-chino-ajuste"]');
  const sizeChipsText = await page.locator('.variant-color-card, .variant-editor-sizes').first().locator('..').innerText();
  log('les vraies tailles (30/32/34/36) sont affichées à l\'édition du Chino, pas S/M/L/XL', sizeChipsText.includes('30') && sizeChipsText.includes('32') && !sizeChipsText.includes('"S"'));
  await page.click('#drawer-cancel-btn');
  await page.click('.confirm-modal-actions [data-action="confirm"]');

  // Bug #1 : modifier une seule taille ne doit pas effacer les autres
  await page.fill('.inventory-inline-stock-input[data-product="polo-signature"][data-size="M"]', '20');
  await page.evaluate(() => document.querySelector('.inventory-inline-stock-input[data-product="polo-signature"][data-size="M"]').dispatchEvent(new Event('change', { bubbles: true })));
  const stockL = await page.evaluate(() => window.db.getProducts().find(p => p.id === 'polo-signature').variants[0].sizesStock.L);
  log('modifier le stock de M ne réinitialise pas le stock de L (bug #1)', stockL !== undefined && stockL > 0);

  // Création complète
  await page.click('#btn-open-create-product-drawer');
  await page.fill('#drawer-prod-title', 'Produit Test Drawer');
  await page.fill('#drawer-prod-price', '25000');
  await page.fill('#drawer-new-color-name', 'Bleu Test');
  await page.click('#drawer-add-color-btn');
  await page.setInputFiles('.variant-photo-input[data-slot="0"]', TEST_IMAGE);
  await page.waitForTimeout(200);
  log('l\'aperçu en direct affiche le titre saisi', await page.locator('#drawer-live-preview').innerText().then(t => t.includes('Produit Test Drawer')));
  await page.click('#drawer-publish-btn');
  await page.waitForSelector('#product-drawer-overlay', { state: 'detached' });
  log('le nouveau produit apparaît dans le tableau d\'inventaire', await page.locator('#inventory-list-tbody').innerText().then(t => t.includes('Produit Test Drawer')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task11-products.js`
Expected: FAIL — `#btn-open-create-product-drawer` et `#drawer-prod-title` n'existent pas encore (ancien formulaire inline toujours en place).

- [ ] **Step 3: Créer `admin/js/products.js`**

```javascript
(function () {
  "use strict";

  let variantEditorHandle = null;
  let editingProduct = null;

  function getCategorySuggestedSizes(categorySlug) {
    if (categorySlug === "gadget") return ["Taille Unique"];
    if (categorySlug === "enfant") return ["2 ans", "4 ans", "6 ans", "8 ans"];
    return ["S", "M", "L", "XL"];
  }

  function computeProductStock(variants) {
    let total = 0;
    variants.forEach(v => {
      Object.keys(v.sizesStock || {}).forEach(sz => { total += parseInt(v.sizesStock[sz], 10) || 0; });
    });
    return total;
  }

  // ---------- Inventory table ----------
  function loadInventoryList() {
    const tbody = document.getElementById("inventory-list-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const products = window.db.getProducts();
    let needsPersist = false;

    products.forEach(p => {
      p.sizes = (p.sizes && p.sizes.length) ? p.sizes : ["S", "M", "L", "XL"];
      p.variants.forEach(v => {
        if (!v.sizesStock) {
          v.sizesStock = {};
          const defaultStock = v.stock !== undefined ? v.stock : (p.stock !== undefined ? p.stock : 10);
          const share = Math.max(0, Math.floor(defaultStock / p.sizes.length));
          p.sizes.forEach((sz, idx) => {
            v.sizesStock[sz] = (idx === p.sizes.length - 1) ? (defaultStock - share * (p.sizes.length - 1)) : share;
          });
          needsPersist = true;
        }
      });
      p.stock = computeProductStock(p.variants);
    });

    if (needsPersist) localStorage.setItem("shammah_db_products", JSON.stringify(products));

    products.forEach(p => {
      const tr = document.createElement("tr");
      let stockStatus = '<span class="badge-status success"><span class="bullet-dot"></span> OK</span>';
      if (p.stock < 3) stockStatus = '<span class="badge-status danger"><span class="bullet-dot"></span> Stock Faible</span>';

      let inlineStocksHTML = '<div class="inventory-inline-stocks">';
      p.variants.forEach(v => {
        p.sizes.forEach(sz => {
          const qty = (v.sizesStock && v.sizesStock[sz] !== undefined) ? v.sizesStock[sz] : 0;
          inlineStocksHTML +=
            '<div class="inventory-inline-stock-row">' +
              '<span class="inventory-inline-stock-label"><span class="color-badge-dot" style="background-color:' + v.color + ';"></span>' + v.name + ' (' + sz + ')</span>' +
              '<input type="number" value="' + qty + '" min="0" class="inventory-inline-stock-input" data-product="' + p.id + '" data-color="' + v.name + '" data-size="' + sz + '">' +
            '</div>';
        });
      });
      inlineStocksHTML += "</div>";

      const promoBadgeHTML = p.promoCode ? '<span class="badge-status info inventory-promo-badge">Promo : ' + p.promoCode + '</span>' : "";

      tr.innerHTML =
        '<td><div class="inventory-product-cell"><img src="../' + p.image + '" alt=""><div>' +
          '<span class="inventory-product-title"></span>' +
          '<span class="inventory-product-price"></span>' + promoBadgeHTML +
        '</div></div></td>' +
        '<td class="inventory-category-cell"></td>' +
        '<td class="inventory-stock-cell">' + inlineStocksHTML + '<div class="inventory-stock-total"><span></span>' + stockStatus + '</div></td>' +
        '<td class="inventory-actions-cell"><button class="btn-secondary" data-action="edit" data-id="' + p.id + '">Modifier</button> <button class="btn-danger" data-action="delete" data-id="' + p.id + '">Supprimer</button></td>';

      tr.querySelector(".inventory-product-cell img").alt = p.title;
      tr.querySelector(".inventory-product-title").textContent = p.title;
      tr.querySelector(".inventory-product-price").textContent = "Prix : " + window.formatPrice(p.price);
      tr.querySelector(".inventory-category-cell").textContent = p.categories[0];
      tr.querySelector(".inventory-stock-total span").textContent = "Total : " + p.stock;

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".inventory-inline-stock-input").forEach(input => {
      input.addEventListener("change", () => updateVariantSizeStock(input.dataset.product, input.dataset.color, input.dataset.size, input.value));
    });
    tbody.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener("click", () => openEditDrawer(btn.dataset.id)));
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener("click", () => handleDeleteProduct(btn.dataset.id)));
  }

  function updateVariantSizeStock(productId, colorName, size, newQty) {
    const products = window.db.getProducts();
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const v = p.variants.find(varObj => varObj.name === colorName);
    if (!v) return;

    v.sizesStock = v.sizesStock || {};
    (p.sizes || []).forEach(sz => { if (v.sizesStock[sz] === undefined) v.sizesStock[sz] = 0; });
    v.sizesStock[size] = Math.max(0, parseInt(newQty, 10) || 0);
    v.stock = Object.keys(v.sizesStock).reduce((sum, sz) => sum + (parseInt(v.sizesStock[sz], 10) || 0), 0);
    p.stock = computeProductStock(p.variants);

    window.db.saveProduct(p);
    loadInventoryList();
    if (window.Dashboard) window.Dashboard.refresh();
  }

  function handleDeleteProduct(id) {
    window.ConfirmModal.open({
      title: "Supprimer l'article",
      message: "Voulez-vous vraiment supprimer cet article de la boutique ?",
      confirmLabel: "Supprimer",
      danger: true
    }).then(confirmed => {
      if (!confirmed) return;
      window.db.deleteProduct(id);
      if (editingProduct && editingProduct.id === id) closeDrawer();
      loadInventoryList();
      if (window.Dashboard) window.Dashboard.refresh();
      window.Toast.show("L'article a été supprimé avec succès.", "success");
    });
  }

  // ---------- Drawer ----------
  function buildCategoryOptions(selectEl, selectedSlug) {
    selectEl.innerHTML = "";
    window.db.getCategories().forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.name;
      selectEl.appendChild(opt);
    });
    if (selectedSlug) selectEl.value = selectedSlug;
  }

  function buildSubcategoryOptions(selectEl, categorySlug, selectedSlug) {
    selectEl.innerHTML = "";
    window.db.getSubcategoriesForCategory(categorySlug).forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub.slug;
      opt.textContent = sub.name;
      selectEl.appendChild(opt);
    });
    if (selectedSlug) selectEl.value = selectedSlug;
  }

  function buildPromoOptions(selectEl, selectedCode) {
    selectEl.innerHTML = '<option value="">Aucun</option>';
    window.db.getPromoCodes().filter(pr => pr.active === true || pr.active === "true").forEach(pr => {
      const opt = document.createElement("option");
      opt.value = pr.code;
      const valLabel = pr.type === "percent" ? pr.value + "%" : window.formatPrice(pr.value);
      opt.textContent = pr.code + " (" + valLabel + ")";
      selectEl.appendChild(opt);
    });
    if (selectedCode) selectEl.value = selectedCode;
  }

  function updateLivePreview(overlay) {
    const title = overlay.querySelector("#drawer-prod-title").value.trim() || "Titre de l'article";
    const price = parseFloat(overlay.querySelector("#drawer-prod-price").value) || 0;
    const category = overlay.querySelector("#drawer-prod-category").value || "";
    const promo = overlay.querySelector("#drawer-prod-promo").value;
    const state = variantEditorHandle ? variantEditorHandle.getState() : { variants: [] };

    let firstImage = "images/product_male.png";
    for (const v of state.variants) {
      const found = v.images.find(img => img);
      if (found) { firstImage = found; break; }
    }
    const imgSrc = firstImage.startsWith("data:") ? firstImage : "../" + firstImage;

    const preview = overlay.querySelector("#drawer-live-preview");
    preview.innerHTML =
      '<div class="live-preview-card"><div class="live-preview-image-wrap">' +
        '<img src="' + imgSrc + '" alt=""><span class="badge-tag"></span>' +
        (promo ? '<span class="badge-tag live-preview-promo"></span>' : "") +
      '</div><div class="live-preview-title"></div><div class="live-preview-price"></div></div>';

    preview.querySelector(".badge-tag").textContent = category;
    if (promo) preview.querySelector(".live-preview-promo").textContent = "Code : " + promo;
    preview.querySelector(".live-preview-title").textContent = title;
    preview.querySelector(".live-preview-price").textContent = window.formatPrice(price);
  }

  function openDrawer(product) {
    editingProduct = product;

    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.id = "product-drawer-overlay";
    overlay.innerHTML =
      '<div class="drawer-panel">' +
        '<div class="drawer-header"><h3></h3><button type="button" class="drawer-close" aria-label="Fermer">&times;</button></div>' +
        '<div class="drawer-body">' +
          '<section class="drawer-section"><h4>Informations générales</h4>' +
            '<div class="form-group"><label>Nom de l\'article*</label><input type="text" id="drawer-prod-title"></div>' +
            '<div class="form-group"><label>Prix de vente*</label><input type="number" id="drawer-prod-price"></div>' +
            '<div class="form-group"><label>Catégorie Parente*</label><select id="drawer-prod-category"></select></div>' +
            '<div class="form-group"><label>Sous-Catégorie*</label><select id="drawer-prod-subcategory"></select></div>' +
            '<div class="form-group"><label>Description</label><textarea id="drawer-prod-desc"></textarea></div>' +
            '<div class="form-group"><label>Code Promo Associé</label><select id="drawer-prod-promo"></select></div>' +
          '</section>' +
          '<section class="drawer-section"><h4>Tailles & Variantes de couleur</h4>' +
            '<div id="drawer-variant-editor-mount"></div>' +
            '<div class="variant-add-color-row">' +
              '<input type="text" id="drawer-new-color-name" placeholder="Nom de la couleur (Ex: Noir Onyx)">' +
              '<input type="color" id="drawer-new-color-hex" value="#000000">' +
              '<button type="button" class="btn-secondary" id="drawer-add-color-btn">+ Couleur</button>' +
            '</div>' +
          '</section>' +
          '<section class="drawer-section"><h4>Aperçu en direct</h4><div id="drawer-live-preview"></div></section>' +
        '</div>' +
        '<div class="drawer-footer">' +
          '<button type="button" class="btn-secondary" id="drawer-cancel-btn">Annuler</button>' +
          '<button type="button" class="btn-primary" id="drawer-publish-btn"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector(".drawer-header h3").textContent = product ? "Modifier : " + product.title : "Nouveau Produit";
    overlay.querySelector("#drawer-publish-btn").textContent = product ? "Enregistrer les modifications" : "Publier sur la boutique";
    if (product) {
      overlay.querySelector("#drawer-prod-title").value = product.title;
      overlay.querySelector("#drawer-prod-price").value = product.price;
      overlay.querySelector("#drawer-prod-desc").value = product.desc || "";
    }

    const categorySelect = overlay.querySelector("#drawer-prod-category");
    const subcategorySelect = overlay.querySelector("#drawer-prod-subcategory");
    buildCategoryOptions(categorySelect, product ? product.categories[0] : undefined);
    buildSubcategoryOptions(subcategorySelect, categorySelect.value, product ? product.subcategory : undefined);
    buildPromoOptions(overlay.querySelector("#drawer-prod-promo"), product ? product.promoCode : undefined);

    const mount = overlay.querySelector("#drawer-variant-editor-mount");
    const initialSizes = (product && product.sizes && product.sizes.length) ? product.sizes : getCategorySuggestedSizes(categorySelect.value);
    const initialVariants = product ? product.variants.map(v => ({
      name: v.name, color: v.color, images: (v.images && v.images.length) ? v.images : (v.img ? [v.img] : []), sizesStock: v.sizesStock || {}
    })) : [];

    variantEditorHandle = window.VariantEditor.mount(mount, {
      sizes: initialSizes,
      variants: initialVariants,
      onChange: () => updateLivePreview(overlay)
    });

    categorySelect.addEventListener("change", () => {
      buildSubcategoryOptions(subcategorySelect, categorySelect.value);
      if (!product) {
        const previousVariants = variantEditorHandle.getState().variants;
        variantEditorHandle.destroy();
        variantEditorHandle = window.VariantEditor.mount(mount, {
          sizes: getCategorySuggestedSizes(categorySelect.value),
          variants: previousVariants,
          onChange: () => updateLivePreview(overlay)
        });
      }
      updateLivePreview(overlay);
    });

    ["input", "change"].forEach(evt => {
      overlay.querySelector("#drawer-prod-title").addEventListener(evt, () => updateLivePreview(overlay));
      overlay.querySelector("#drawer-prod-price").addEventListener(evt, () => updateLivePreview(overlay));
      overlay.querySelector("#drawer-prod-promo").addEventListener(evt, () => updateLivePreview(overlay));
    });

    overlay.querySelector("#drawer-add-color-btn").addEventListener("click", () => {
      const nameInput = overlay.querySelector("#drawer-new-color-name");
      const hexInput = overlay.querySelector("#drawer-new-color-hex");
      const name = nameInput.value.trim();
      if (!name) { window.Toast.show("Veuillez renseigner le nom de la couleur.", "error"); return; }
      variantEditorHandle.addColor(name, hexInput.value);
      nameInput.value = "";
      updateLivePreview(overlay);
    });

    updateLivePreview(overlay);

    function requestClose() {
      window.ConfirmModal.open({
        title: "Fermer sans enregistrer ?",
        message: "Les modifications non publiées seront perdues.",
        confirmLabel: "Fermer"
      }).then(confirmed => { if (confirmed) closeDrawer(); });
    }

    overlay.addEventListener("click", (e) => { if (e.target === overlay) requestClose(); });
    overlay.querySelector(".drawer-close").addEventListener("click", requestClose);
    overlay.querySelector("#drawer-cancel-btn").addEventListener("click", requestClose);
    overlay.querySelector("#drawer-publish-btn").addEventListener("click", () => handlePublish(overlay, product));
  }

  function closeDrawer() {
    const overlay = document.getElementById("product-drawer-overlay");
    if (overlay) overlay.remove();
    if (variantEditorHandle) variantEditorHandle.destroy();
    variantEditorHandle = null;
    editingProduct = null;
  }

  function handlePublish(overlay, existingProduct) {
    const title = overlay.querySelector("#drawer-prod-title").value.trim();
    const price = parseFloat(overlay.querySelector("#drawer-prod-price").value);
    const category = overlay.querySelector("#drawer-prod-category").value;
    const subcategory = overlay.querySelector("#drawer-prod-subcategory").value;
    const desc = overlay.querySelector("#drawer-prod-desc").value.trim();
    const promoCode = overlay.querySelector("#drawer-prod-promo").value;

    if (title === "" || isNaN(price)) { window.Toast.show("Veuillez renseigner un titre et un prix corrects.", "error"); return; }

    const state = variantEditorHandle.getState();
    if (state.variants.length === 0) { window.Toast.show("Veuillez ajouter au moins une variante de couleur.", "error"); return; }
    if (!state.variants[0].images.some(img => img)) { window.Toast.show("Veuillez téléverser au moins une photo pour la première couleur.", "error"); return; }

    const formattedVariants = state.variants.map(v => {
      const validImages = v.images.filter(img => img);
      const stockTotal = Object.keys(v.sizesStock).reduce((sum, sz) => sum + (parseInt(v.sizesStock[sz], 10) || 0), 0);
      return { name: v.name, color: v.color, img: validImages[0] || "images/product_male.png", images: validImages, sizesStock: v.sizesStock, stock: stockTotal };
    });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = existingProduct ? existingProduct.id : (slug + "-" + Date.now());

    const product = {
      id: id,
      title: title,
      categories: [category],
      subcategory: subcategory,
      price: price,
      oldPrice: existingProduct ? existingProduct.oldPrice : price * 1.2,
      desc: desc || "Aucune description fournie.",
      image: formattedVariants[0].img,
      variants: formattedVariants,
      sizes: state.sizes,
      stock: computeProductStock(formattedVariants),
      promoCode: promoCode || ""
    };

    window.db.saveProduct(product);
    window.Toast.show(existingProduct ? '"' + title + '" mis à jour avec succès.' : '"' + title + '" publié avec succès.', "success");
    closeDrawer();
    loadInventoryList();
    if (window.Dashboard) window.Dashboard.refresh();
  }

  function openCreateDrawer() { openDrawer(null); }
  function openEditDrawer(id) {
    const product = window.db.getProducts().find(p => p.id === id);
    if (product) openDrawer(product);
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadInventoryList();
    const createBtn = document.getElementById("btn-open-create-product-drawer");
    if (createBtn) createBtn.addEventListener("click", openCreateDrawer);
  });

  window.ProductsPanel = { openCreateDrawer: openCreateDrawer, openEditDrawer: openEditDrawer };
})();
```

- [ ] **Step 4: Ajouter les styles dans `admin/admin.css`**

```css
.drawer-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; justify-content: flex-end; z-index: 9996; }
.drawer-panel {
  width: 680px; max-width: 92vw; height: 100%; background: var(--bg-panel); box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; animation: drawerSlideIn 0.25s ease-out;
}
@keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
.drawer-header h3 { margin: 0; font-size: 1rem; font-weight: 800; }
.drawer-close { border: none; background: none; font-size: 1.3rem; cursor: pointer; color: var(--text-secondary); }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-section { margin-bottom: 28px; }
.drawer-section h4 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin: 0 0 12px 0; }
.drawer-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-light); }
.variant-add-color-row { display: flex; gap: 8px; margin-top: 12px; }
.variant-add-color-row input[type="text"] { flex: 1; height: 34px; border: 1px solid var(--border-medium); border-radius: 6px; padding: 0 10px; font-family: inherit; }
.variant-add-color-row input[type="color"] { width: 40px; height: 34px; padding: 0; border: 1px solid var(--border-medium); border-radius: 6px; cursor: pointer; }

.live-preview-card { width: 200px; border: 1px solid var(--border-light); border-radius: 10px; overflow: hidden; background: var(--bg-panel); }
.live-preview-image-wrap { position: relative; height: 160px; background: var(--bg-primary); }
.live-preview-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
.live-preview-image-wrap .badge-tag {
  position: absolute; top: 8px; left: 8px; background: #ffffff; color: var(--text-primary);
  font-size: 0.6rem; font-weight: 700; text-transform: capitalize; padding: 2px 8px; border-radius: 4px;
}
.live-preview-image-wrap .live-preview-promo { top: auto; bottom: 8px; left: 8px; background: var(--accent-red); color: #fff; }
.live-preview-title { padding: 8px 10px 0 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
.live-preview-price { padding: 2px 10px 10px 10px; font-size: 0.8rem; color: var(--text-secondary); }

.inventory-product-cell { display: flex; align-items: center; gap: 10px; }
.inventory-product-cell img { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-light); }
.inventory-product-title { display: block; font-weight: 700; }
.inventory-product-price { font-size: 0.65rem; color: var(--text-secondary); font-weight: 500; display: block; }
.inventory-promo-badge { font-size: 0.6rem; margin-top: 2px; display: inline-block; }
.inventory-inline-stocks { display: flex; flex-direction: column; gap: 6px; font-size: 0.7rem; min-width: 210px; }
.inventory-inline-stock-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.inventory-inline-stock-input { width: 45px; height: 20px; text-align: center; border: 1px solid var(--border-medium); border-radius: 4px; font-family: inherit; font-size: 0.7rem; }
.inventory-stock-total { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
```

- [ ] **Step 5: Restructurer le panneau Produits dans `admin/index.html`**

Remplacer tout le contenu de `<div class="panel-grid-2" style="grid-template-columns: 1.2fr 1fr;">...</div>` (le formulaire inline `#form-add-product` et la colonne de droite avec `#quick-promo-list`) par :
```html
        <div class="panel-header" style="padding-bottom:0;">
          <div></div>
          <button class="btn-primary" id="btn-open-create-product-drawer">+ Nouveau produit</button>
        </div>

        <div class="content-card">
          <div class="content-card-header"><h3>État des Stocks</h3></div>
          <div class="content-card-body" style="padding:0; overflow-y:auto; max-height:640px;">
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Catégorie</th>
                  <th style="text-align:right; width:230px;">Stock</th>
                  <th style="text-align:center; width:130px;">Action</th>
                </tr>
              </thead>
              <tbody id="inventory-list-tbody"></tbody>
            </table>
          </div>
        </div>
```

- [ ] **Step 6: Retirer toute la logique produits restante d'`admin/admin.js`**

Supprimer entièrement : `activeVariants`/`editingProductId` (état module), `getSelectedProductSizes()`, `loadInventoryList()`, `window.updateVariantSizeStock`, `window.editProduct`, `window.deleteProduct`, `cancelProductEdit()`, `populateCategoryDropdowns()` (dans son intégralité — sa partie `#subcat-parent` est désormais couverte par `categories.js` depuis la Task 7), `loadSubcategoryOptions()`, `renderActiveVariants()`, `setupVariantCreator()`, `window.removeVariantColor`, `window.uploadVariantImage`, `setupProductPublishForm()`. Retirer leurs appels dans `initApp()`. À ce stade, `initApp()` ne doit plus contenir que `setupNavigation();`.

- [ ] **Step 7: Charger `products.js` dans `admin/index.html`**

Après `<script src="js/promos.js"></script>` :
```html
  <script src="js/products.js"></script>
```

- [ ] **Step 8: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task11-products.js`
Expected: PASS pour les 4 assertions.

- [ ] **Step 9: Commit**

```bash
git add admin/js/products.js admin/admin.css admin/index.html admin/admin.js
git commit -m "feat(admin): replace inline product form with drawer editor, fix stock-loss and wrong-sizes bugs"
```

---

### Task 12: Icônes SVG des moyens de paiement (dashboard + footer boutique)

**Files:**
- Create: `js/payment-icons.js`
- Modify: `admin/index.html` (script tag)
- Modify: `index.html` (footer, badges de confiance)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task12-paymenticons.js`

**Interfaces:**
- Produces: `window.PaymentIcons.forMethodLabel(label) → string` (HTML), déjà consommé de façon protégée par `dashboard.js` (Task 6).

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task12-paymenticons.js` :
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const adminPage = await browser.newContext().then(c => c.newPage());
  await adminPage.goto('http://127.0.0.1:8811/admin/index.html');
  await adminPage.click('.nav-item[data-target="panel-orders"]');
  log('la colonne Moyen du panneau Commandes contient une icône SVG', await adminPage.locator('#orders-list-tbody tr').first().locator('svg').count() >= 1);

  const storefrontPage = await browser.newContext().then(c => c.newPage());
  await storefrontPage.goto('http://127.0.0.1:8811/index.html');
  const footerBadges = storefrontPage.locator('.payment-method-pill');
  log('le footer boutique affiche des icônes SVG pour les moyens de paiement', await footerBadges.count() >= 4);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task12-paymenticons.js`
Expected: FAIL — pas de `<svg>` dans la colonne Moyen (fallback texte de `dashboard.js`), pas de `.payment-method-pill` dans le footer.

- [ ] **Step 3: Créer `js/payment-icons.js`**

```javascript
(function () {
  "use strict";

  const ICONS = {
    orange: '<svg viewBox="0 0 40 40" width="20" height="20"><rect width="40" height="40" rx="8" fill="#FF7900"/><path d="M17 19h6v2h-6zm0 4h6v2h-6z" fill="#ffffff"/></svg>',
    mtn: '<svg viewBox="0 0 40 40" width="20" height="20"><rect width="40" height="40" rx="8" fill="#FFCC00"/><ellipse cx="20" cy="20" rx="14" ry="10" fill="#003399"/><text x="20" y="23" dominant-baseline="middle" text-anchor="middle" fill="#FFCC00" font-family="sans-serif" font-weight="900" font-size="8">MTN</text></svg>',
    wave: '<svg viewBox="0 0 40 40" width="20" height="20"><rect width="40" height="40" rx="8" fill="#1B4ECF"/><path d="M10 18c4-6 6-6 10 0s6 6 10 0" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 10h20"/></svg>'
  };

  function keyForLabel(label) {
    const l = (label || "").toLowerCase();
    if (l.indexOf("orange") !== -1) return "orange";
    if (l.indexOf("mtn") !== -1) return "mtn";
    if (l.indexOf("wave") !== -1) return "wave";
    return "card";
  }

  function forMethodLabel(label) {
    const span = document.createElement("span");
    span.className = "payment-method-pill";
    const iconWrap = document.createElement("span");
    iconWrap.innerHTML = ICONS[keyForLabel(label)];
    const text = document.createElement("span");
    text.textContent = label;
    span.appendChild(iconWrap);
    span.appendChild(text);
    return span.outerHTML;
  }

  window.PaymentIcons = { icons: ICONS, forMethodLabel: forMethodLabel };
})();
```

- [ ] **Step 4: Charger le script dans `admin/index.html`**

Après `<script src="../js/db.js"></script>` :
```html
  <script src="../js/payment-icons.js"></script>
```
(aucune autre modification n'est nécessaire dans `admin/js/dashboard.js` : son appel `window.PaymentIcons ? window.PaymentIcons.forMethodLabel(method) : method` bascule automatiquement dès que le script est présent.)

- [ ] **Step 5: Ajouter le style dans `admin/admin.css`**

```css
.payment-method-pill { display: inline-flex; align-items: center; gap: 6px; }
```

- [ ] **Step 6: Remplacer les badges du footer dans `index.html`**

Remplacer les 5 `<span>` de la ligne `Orange Money / MTN MoMo / Wave / Visa / Mastercard` (section badges de confiance du footer) par :
```html
              <span class="payment-method-pill" style="font-family: var(--font-inter); font-size: 0.68rem; color: #d4d4d8; border: 1px solid #27272a; background: #18181b; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                <svg viewBox="0 0 40 40" width="16" height="16"><rect width="40" height="40" rx="8" fill="#FF7900"/><path d="M17 19h6v2h-6zm0 4h6v2h-6z" fill="#ffffff"/></svg>
                Orange Money
              </span>
              <span class="payment-method-pill" style="font-family: var(--font-inter); font-size: 0.68rem; color: #d4d4d8; border: 1px solid #27272a; background: #18181b; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                <svg viewBox="0 0 40 40" width="16" height="16"><rect width="40" height="40" rx="8" fill="#FFCC00"/><ellipse cx="20" cy="20" rx="14" ry="10" fill="#003399"/><text x="20" y="23" dominant-baseline="middle" text-anchor="middle" fill="#FFCC00" font-family="sans-serif" font-weight="900" font-size="8">MTN</text></svg>
                MTN MoMo
              </span>
              <span class="payment-method-pill" style="font-family: var(--font-inter); font-size: 0.68rem; color: #d4d4d8; border: 1px solid #27272a; background: #18181b; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                <svg viewBox="0 0 40 40" width="16" height="16"><rect width="40" height="40" rx="8" fill="#1B4ECF"/><path d="M10 18c4-6 6-6 10 0s6 6 10 0" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>
                Wave
              </span>
              <span class="payment-method-pill" style="font-family: var(--font-inter); font-size: 0.68rem; color: #d4d4d8; border: 1px solid #27272a; background: #18181b; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d4d4d8" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 10h20"/></svg>
                Visa
              </span>
              <span class="payment-method-pill" style="font-family: var(--font-inter); font-size: 0.68rem; color: #d4d4d8; border: 1px solid #27272a; background: #18181b; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d4d4d8" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 10h20"/></svg>
                Mastercard
              </span>
```

- [ ] **Step 7: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task12-paymenticons.js`
Expected: PASS pour les 2 assertions.

- [ ] **Step 8: Commit**

```bash
git add js/payment-icons.js admin/index.html admin/admin.css index.html
git commit -m "feat: reuse SVG payment operator icons in the dashboard orders table and storefront footer"
```

---

### Task 13: Bootstrap final — `app.js`, retrait d'`admin.js`, régression complète

**Files:**
- Create: `admin/js/app.js`
- Delete: `admin/admin.js`
- Modify: `admin/index.html` (script tags finaux)
- Test: `C:\tmp\shammah-checkout-tests\test-premium-task13-final.js`

**Interfaces:**
- Consumes: rien de neuf (tous les modules s'auto-initialisent déjà).
- Produces: navigation entre panneaux (fonction déplacée depuis `admin.js`).

- [ ] **Step 1: Écrire le test Playwright (attendu en échec)**

Créer `C:\tmp\shammah-checkout-tests\test-premium-task13-final.js` :
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  page.on('response', res => { if (res.status() === 404) errors.push('404: ' + res.url()); });

  await page.goto(BASE);
  log('aucune erreur console/page/404 au chargement', errors.length === 0);
  log('admin.js a été retiré au profit de js/app.js', await page.evaluate(() => !document.querySelector('script[src="admin.js"]') && !!document.querySelector('script[src="js/app.js"]')));

  const panels = ['panel-dashboard', 'panel-orders', 'panel-products', 'panel-promos', 'panel-settings'];
  for (const target of panels) {
    await page.click('.nav-item[data-target="' + target + '"]');
    const isActive = await page.locator('#' + target).evaluate(el => el.classList.contains('active'));
    log('la navigation affiche bien ' + target, isActive);
    const othersHidden = await page.evaluate((t) => {
      return Array.from(document.querySelectorAll('.workspace-panel')).every(p => p.id === t ? p.classList.contains('active') : !p.classList.contains('active'));
    }, target);
    log(target + ' est seul actif', othersHidden);
  }

  log('aucune erreur accumulée après navigation complète', errors.length === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Lancer le test et confirmer l'échec**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task13-final.js`
Expected: FAIL — l'assertion "admin.js a été retiré au profit de js/app.js" échoue, car `admin/index.html` charge encore `<script src="admin.js">` et ne charge pas encore `js/app.js`.

- [ ] **Step 3: Créer `admin/js/app.js`**

```javascript
(function () {
  "use strict";

  function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const panels = document.querySelectorAll(".workspace-panel");

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");
        const target = item.getAttribute("data-target");
        panels.forEach(p => p.classList.toggle("active", p.id === target));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", setupNavigation);
})();
```

- [ ] **Step 4: Supprimer `admin/admin.js` et mettre à jour les scripts dans `admin/index.html`**

Supprimer le fichier `admin/admin.js` (à ce stade il ne contient plus que `setupNavigation()`/`initApp()`, désormais dans `app.js`).

Dans `admin/index.html`, remplacer le bloc de scripts final :
```html
  <script src="../js/db.js"></script>
  <script src="../js/payment-icons.js"></script>
  <script src="js/variant-editor.js"></script>
  <script src="js/ui-kit.js"></script>
  <script src="js/dashboard.js"></script>
  <script src="js/categories.js"></script>
  <script src="js/promos.js"></script>
  <script src="js/products.js"></script>
  <script src="js/app.js"></script>
```

- [ ] **Step 5: Relancer le test et confirmer le succès**

Run: `node C:\tmp\shammah-checkout-tests\test-premium-task13-final.js`
Expected: PASS pour toutes les assertions (0 erreur, navigation correcte sur les 5 panneaux).

- [ ] **Step 6: Lancer l'ensemble des tests premium pour une régression finale**

Run (un par un, ou dans une boucle shell) :
```bash
for f in test-premium-task1-db test-premium-task2-uikit test-premium-task3-theme test-premium-task4-palette test-premium-task5-shell test-premium-task6-dashboard test-premium-task7-categories test-premium-task8-promos test-premium-task9-sizechips test-premium-task10-colorcards test-premium-task11-products test-premium-task12-paymenticons test-premium-task13-final; do
  node "C:\tmp\shammah-checkout-tests\$f.js" || echo "ECHEC: $f"
done
```
Expected: aucun "ECHEC" affiché.

- [ ] **Step 7: Commit**

```bash
git add admin/js/app.js admin/index.html
git rm admin/admin.js
git commit -m "refactor(admin): finish modularization — move nav bootstrap to app.js and retire the legacy admin.js monolith"
```
