# Bloom Dashboard Redesign — Phase 1 (Nav Shell + Dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin dashboard's left sidebar with a Bloom-style top navigation bar, apply the new premium SaaS design tokens, and rebuild the Dashboard panel's 4 KPI cards, bar chart, radial gauge, recent-orders preview, and sales-overview widget so every number is computed from real order/product data instead of the current hardcoded placeholders.

**Architecture:** Vanilla HTML/CSS/JS, no build step, following the codebase's existing module pattern (`admin/js/*.js`, each a single IIFE exposing one `window.*` API). A new `admin/js/dashboard-charts.js` module owns pure SVG rendering (bar chart, radial gauge); `admin/js/dashboard.js` keeps owning data computation and orchestration, as it already does.

**Tech Stack:** HTML5, CSS3, ES6 vanilla, `localStorage` via existing `js/db.js`. Verification via Playwright (`chromium`) against the existing local static server convention.

## Global Constraints

- Reproduce the "Bloom" reference design's visual language; every widget must be wired to real data — no hardcoded/fictional values where a real computation is possible (see spec §1).
- Every icon (nav, KPI, chevrons, bell, chart glyphes) is an inline SVG, `stroke="currentColor"` line-icon style matching the codebase's existing icons — no raster images except real product photos.
- Design tokens (spec §4): `--page-bg: #F6F6FB`, `--card-bg: #FFFFFF`, `--accent-primary: #6C63FF`, `--accent-primary-hover: #5A52E0`, `--status-blue: #3B82F6`, `--status-amber: #F59E0B`, `--status-green: #22C55E`, `--status-red: #EF4444`, `--text-heading: #111827`, `--text-body: #6B7280`, `--card-radius: 16px`, `--card-shadow: 0 4px 24px rgba(17, 24, 39, 0.06)`.
- Nav order: **Dashboard, Produits, Commandes, Clients, Attributs, Promotions** (6 tabs). "Attributs" reuses the existing `panel-settings` content unchanged (full Attributes redesign is a later phase); "Clients" is a new placeholder panel (`panel-customers`) with a "bientôt disponible" empty state (no data model for customers exists yet — that's Phase 4).
- Dark mode and sidebar-collapse: their toggle buttons are removed from the HTML; the JS functions in `admin/js/ui-kit.js` are NOT deleted, only their invocation is guarded on the (now-absent) button's existence, so they become inert without any code being removed.
- The Semaine/Mois toggle on the revenue bar chart keeps its own fixed time window, independent of the new page-level date-range selector (see spec §5.3) — do not make them interact.
- Every file in `admin/js/*.js` stays a single IIFE exposing only its documented `window.*` API.
- Playwright test scripts live in `C:\tmp\shammah-checkout-tests\`, named `test-bloom-p1-taskN-*.js`, following the existing PASS/FAIL console-logging convention (see `test-premium-task1-db.js` for the established style).
- A static server must be running at `http://127.0.0.1:8811` serving the repo root for all Playwright verification (`npx --yes serve -l 8811 .` from the project root — `serve.json` already disables clean-URL redirects, required for relative asset paths to resolve).
- Design spec: `docs/superpowers/specs/2026-07-26-bloom-dashboard-phase1-design.md` — read it for full context before starting.

---

### Task 1: Top nav shell — replace sidebar, design tokens, Clients placeholder

Replaces the left sidebar with a Bloom-style top nav bar, introduces the new design tokens, adds the new "Clients" placeholder panel, and relabels the existing "Attributs" (Configuration) tab — all before touching any Dashboard-specific content.

**Files:**
- Modify: `admin/index.html` (sidebar → top nav; new panel-customers)
- Modify: `admin/admin.css` (new tokens; remove sidebar CSS; new nav CSS; restyle shared card/button base classes)
- Modify: `admin/js/ui-kit.js` (guard `initTheme()` call; update command-palette `NAV_TARGETS`)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task1-navshell.js`

**Interfaces:**
- Produces: `.top-nav`, `.nav-tabs`, `.nav-tab[data-target]` (reuses the existing generic panel-switching mechanism in `admin/js/app.js` unchanged — that file consumes `.nav-item`... **note:** `admin/js/app.js`'s `setupNavigation()` currently selects `.nav-item`/`.workspace-panel` — since this task renames the nav element's class from `.nav-item` to `.nav-tab`, Task 1 must also update `admin/js/app.js`'s selector, or keep the class name `.nav-item` on the new pill elements (simpler — reuse the existing class name, just restyle it). **Decision: keep the class name `.nav-item` unchanged** so `admin/js/app.js` needs zero modification; only the visual CSS and the surrounding markup (sidebar → header) change.
- Produces: new panel `#panel-customers` (empty-state placeholder) for later phases (Phase 4) to fill in.

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task1-navshell.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(BASE);

  log('la sidebar a disparu', await page.locator('.sidebar').count() === 0);
  log('une nav du haut existe', await page.locator('.top-nav').count() === 1);
  log('les 6 onglets sont présents dans le bon ordre', await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('.top-nav .nav-item .nav-label')).map(el => el.textContent.trim());
    return JSON.stringify(labels) === JSON.stringify(['Dashboard', 'Produits', 'Commandes', 'Clients', 'Attributs', 'Promotions']);
  }));

  await page.click('.nav-item[data-target="panel-customers"]');
  log('le panneau Clients (placeholder) devient visible', await page.locator('#panel-customers').evaluate(el => el.classList.contains('active')));
  log('le placeholder Clients affiche un état vide', await page.locator('#panel-customers').innerText().then(t => t.toLowerCase().includes('bientôt')));

  await page.click('.nav-item[data-target="panel-settings"]');
  log('le panneau Attributs (ex-Configuration) devient visible', await page.locator('#panel-settings').evaluate(el => el.classList.contains('active')));

  log('aucun bouton de bascule de thème ou de repli de sidebar', await page.evaluate(() => !document.getElementById('theme-toggle-btn') && !document.getElementById('sidebar-toggle-btn')));

  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  await page.reload();
  log('data-theme n\'est jamais posé automatiquement (initTheme correctement gardé)', await page.evaluate(() => document.documentElement.getAttribute('data-theme') === null));

  await page.keyboard.press('Control+k');
  await page.waitForSelector('.command-palette', { timeout: 2000 }).catch(() => {});
  log('la palette ⌘K liste bien "Clients" et "Attributs"', await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.command-palette-item span')).map(el => el.textContent);
    return items.includes('Clients') && items.includes('Attributs');
  }));

  log('aucune erreur JS au chargement', errors.length === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task1-navshell.js"`
Expected: FAIL — `.top-nav` doesn't exist yet, `.sidebar` still present.

- [ ] **Step 3: Replace the sidebar with the top nav in `admin/index.html`**

Replace the entire `<aside class="sidebar">...</aside>` block (currently lines 15-89) with:
```html
    <header class="top-nav">
      <a href="../index.html" class="top-nav-logo">
        <svg viewBox="0 0 32 32" width="28" height="28" class="brand-mark">
          <rect width="32" height="32" rx="9" fill="#0f172a"/>
          <path d="M12 11.5c0-1.933 1.567-3.5 3.5-3.5h4a1 1 0 010 2h-4a1.5 1.5 0 000 3h2c1.933 0 3.5 1.567 3.5 3.5S21.433 20 19.5 20h-4a1 1 0 010-2h4a1.5 1.5 0 000-3h-2c-1.933 0-3.5-1.567-3.5-3.5z" fill="#ffffff"/>
        </svg>
        <span class="top-nav-logo-text">SHAMMAH</span>
      </a>

      <nav class="nav-tabs">
        <div class="nav-item active" data-target="panel-dashboard">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          <span class="nav-label">Dashboard</span>
        </div>
        <div class="nav-item" data-target="panel-products">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span class="nav-label">Produits</span>
        </div>
        <div class="nav-item" data-target="panel-orders">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span class="nav-label">Commandes</span>
        </div>
        <div class="nav-item" data-target="panel-customers">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-3.13a4 4 0 100-8 4 4 0 000 8zm6 0a4 4 0 10-2-7.45" />
          </svg>
          <span class="nav-label">Clients</span>
        </div>
        <div class="nav-item" data-target="panel-settings">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="nav-label">Attributs</span>
        </div>
        <div class="nav-item" data-target="panel-promos">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
          <span class="nav-label">Promotions</span>
        </div>
      </nav>

      <div class="top-nav-actions">
        <button type="button" class="nav-bell-btn" id="nav-bell-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        <div class="nav-user" id="nav-user-menu">
          <div class="user-avatar">A</div>
          <div class="user-info">
            <span class="user-name">Administrateur</span>
            <span class="user-role">Super Admin</span>
          </div>
          <svg class="nav-user-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          <div class="nav-user-dropdown" id="nav-user-dropdown">
            <button type="button" class="nav-user-dropdown-item" data-action="profile" disabled title="Disponible dans une prochaine phase">Profil &amp; Paramètres</button>
            <button type="button" class="nav-user-dropdown-item" data-action="logout">Déconnexion</button>
          </div>
        </div>
      </div>
    </header>

    <!-- ==================== PLACEHOLDER PANEL: CLIENTS ==================== -->
    <!-- Real content arrives in a later phase (customer records don't exist yet). -->
```

Immediately after this new `<header>` block (before `<main class="main-workspace">`), leave the comment above as a marker — the actual `#panel-customers` element is inserted inside `<main>`, alongside the other panels (Step 4).

- [ ] **Step 4: Add the `#panel-customers` placeholder panel**

Inside `<main class="main-workspace">`, insert this new panel anywhere after `#panel-orders` and before `#panel-products` (matching the nav order):
```html
      <!-- ==================== PANEL: CLIENTS (placeholder) ==================== -->
      <div class="workspace-panel" id="panel-customers">
        <div class="panel-header">
          <div>
            <h2>Clients</h2>
            <p>Gérez les comptes et les informations clients.</p>
          </div>
        </div>
        <div class="content-card">
          <div class="content-card-body empty-state-panel">
            <p>Cette section arrive bientôt : la gestion des fiches clients fera l'objet d'une prochaine phase.</p>
          </div>
        </div>
      </div>
```

- [ ] **Step 5: Add the design tokens and new nav CSS to `admin/admin.css`, remove the old sidebar CSS**

At the top of the `:root { ... }` block, add the new tokens (keep the existing ones that are still used, like `--font-inter`, `--shadow-sm`, etc. — only add these new ones, don't remove the block):
```css
  --page-bg: #F6F6FB;
  --card-bg: #FFFFFF;
  --accent-primary: #6C63FF;
  --accent-primary-hover: #5A52E0;
  --status-blue: #3B82F6;
  --status-amber: #F59E0B;
  --status-green: #22C55E;
  --status-red: #EF4444;
  --text-heading: #111827;
  --text-body: #6B7280;
  --card-radius: 16px;
  --card-shadow: 0 4px 24px rgba(17, 24, 39, 0.06);
```

Remove entirely these existing rule blocks (they styled the sidebar/search-box/nav-links/nav-item/user-card/toggle-buttons, all now gone): `.app-container` (grid version), `.sidebar`, `.sidebar-top`, `.sidebar-logo`, `.sidebar-logo span`/`.sidebar-logo-text`, `.search-box` and its children, `.nav-links`, `.nav-item` (old sidebar version), `.nav-item svg`, `.nav-item:hover`, `.nav-item.active`, `.nav-item.active svg`, `.user-card`, `.user-avatar` (keep the rule but it'll be redefined below), `.user-info`, `.user-name`, `.user-email`, `.sidebar-toggle-btn, .theme-toggle-btn` and their `:hover`, `.sidebar-collapsed` and all `.sidebar-collapsed .*` rules. Leave the `:root[data-theme="dark"] { ... }` block and every other `:root[data-theme="dark"] .*` rule completely untouched (dormant, not deleted, per Global Constraints).

Replace with:
```css
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-inter);
  background-color: var(--page-bg);
  color: var(--text-heading);
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.top-nav {
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 28px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-light);
}

.top-nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.top-nav-logo-text {
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 2px;
  color: var(--text-heading);
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-tabs .nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.nav-tabs .nav-item svg { width: 16px; height: 16px; }

.nav-tabs .nav-item:hover { background: var(--page-bg); color: var(--text-heading); }

.nav-tabs .nav-item.active {
  background: var(--accent-primary);
  color: #ffffff;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.nav-bell-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}
.nav-bell-btn:hover { color: var(--text-heading); border-color: var(--border-medium); }

.nav-user {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  transition: var(--transition-smooth);
}
.nav-user:hover { background: var(--page-bg); }

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-info { display: flex; flex-direction: column; text-align: left; line-height: 1.2; }
.user-name { font-size: 0.8rem; font-weight: 700; color: var(--text-heading); }
.user-role { font-size: 0.7rem; color: var(--text-body); }
.nav-user-chevron { color: var(--text-body); transition: var(--transition-smooth); }
.nav-user.open .nav-user-chevron { transform: rotate(180deg); }

.nav-user-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  min-width: 200px;
  padding: 6px;
  z-index: 20;
}
.nav-user.open .nav-user-dropdown { display: block; }

.nav-user-dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--text-heading);
  cursor: pointer;
}
.nav-user-dropdown-item:hover { background: var(--page-bg); }
.nav-user-dropdown-item[disabled] { color: var(--text-body); cursor: not-allowed; opacity: 0.6; }
.nav-user-dropdown-item[disabled]:hover { background: none; }

.main-workspace {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.empty-state-panel {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-body);
  font-size: 0.9rem;
}
```

Restyle the shared card/button base classes (find and replace these existing rules in place — they're reused by every panel, so this cascades intentionally):
```css
.content-card {
  background: var(--card-bg);
  border: none;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
}

.metric-card {
  background: var(--card-bg);
  border: none;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-primary);
  color: #ffffff;
  border: 1px solid var(--accent-primary);
  border-radius: 10px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
}
.btn-primary:hover { background: var(--accent-primary-hover); border-color: var(--accent-primary-hover); }
```

- [ ] **Step 6: Guard `initTheme()` and update `NAV_TARGETS` in `admin/js/ui-kit.js`**

Change:
```javascript
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebarCollapse();
  });
```
to:
```javascript
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("theme-toggle-btn")) initTheme();
    if (document.getElementById("sidebar-toggle-btn")) initSidebarCollapse();
  });
```

Change the `NAV_TARGETS` array from:
```javascript
  const NAV_TARGETS = [
    { label: "Vue d'ensemble", target: "panel-dashboard" },
    { label: "Commandes", target: "panel-orders" },
    { label: "Gestion Articles", target: "panel-products" },
    { label: "Codes Promo", target: "panel-promos" },
    { label: "Configuration", target: "panel-settings" }
  ];
```
to:
```javascript
  const NAV_TARGETS = [
    { label: "Dashboard", target: "panel-dashboard" },
    { label: "Produits", target: "panel-products" },
    { label: "Commandes", target: "panel-orders" },
    { label: "Clients", target: "panel-customers" },
    { label: "Attributs", target: "panel-settings" },
    { label: "Promotions", target: "panel-promos" }
  ];
```

- [ ] **Step 7: Wire the user-menu dropdown and the notification bell**

In `admin/js/ui-kit.js`, inside the same IIFE, add (call this new function from the existing `DOMContentLoaded` listener, right after the two guarded init calls added in Step 6):
```javascript
  function initNavUserMenu() {
    const userMenu = document.getElementById("nav-user-menu");
    if (!userMenu) return;

    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("open");
    });

    document.addEventListener("click", () => userMenu.classList.remove("open"));

    // Only "logout" is wired — "profile" carries the `disabled` attribute (see index.html)
    // per spec §3, since Profil & Paramètres has no real destination until Phase 6 exists.
    userMenu.querySelectorAll(".nav-user-dropdown-item:not([disabled])").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        userMenu.classList.remove("open");
        window.Toast.show("Déconnexion non disponible dans cette démo.", "info");
      });
    });
  }

  function initNotificationBell() {
    const btn = document.getElementById("nav-bell-btn");
    if (!btn) return;
    btn.addEventListener("click", () => window.Toast.show("Aucune nouvelle notification.", "info"));
  }
```
And update the `DOMContentLoaded` listener from Step 6 to also call these:
```javascript
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("theme-toggle-btn")) initTheme();
    if (document.getElementById("sidebar-toggle-btn")) initSidebarCollapse();
    initNavUserMenu();
    initNotificationBell();
  });
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task1-navshell.js"`
Expected: all PASS, exit code 0.

- [ ] **Step 9: Commit**

```bash
git add admin/index.html admin/admin.css admin/js/ui-kit.js
git commit -m "feat(admin): replace sidebar with Bloom-style top nav, add design tokens and Clients placeholder"
```

---

### Task 2: Date-range selector + 4 real KPI cards + layout scaffold

Adds the header's date-range selector, rebuilds the 4 KPI cards to show real computed values with real trend percentages, and scaffolds the two new grid rows the Dashboard panel needs (chart+gauge row, and the recent-orders+sales-overview row) so Tasks 3-5 each fill in one card.

**Files:**
- Modify: `admin/index.html` (dashboard header gets date-range select + export button; 4 KPI cards restructured; scaffold the 2 new `panel-grid-2` rows with empty card bodies)
- Modify: `admin/js/dashboard.js` (date parsing/filtering helpers, `computeKPIs`, wire the date-range select)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task2-kpis.js`

**Interfaces:**
- Consumes: `window.db.getOrders()` (existing), `window.formatPrice` (existing).
- Produces: `parseOrderDate(dateStr) → Date`, `filterByRange(orders, rangeKey) → Order[]`, `filterByPreviousRange(orders, rangeKey) → Order[]`, `trendPercent(current, previous) → number|null` — all module-private in `dashboard.js`, but Tasks 3/4/5 (same file) will call the filtering helpers with the currently-selected `rangeKey` via a shared module-level variable `currentRangeKey` (default `"7d"`).

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task2-kpis.js`:
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

  const today = new Date();
  const fmt = (d) => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const recent = new Date(today); recent.setDate(recent.getDate() - 2);
  const old = new Date(today); old.setDate(old.getDate() - 20);

  await page.evaluate(({ recentDate, oldDate }) => {
    window.db.saveOrder({ id: 'SH-RECENT1', date: recentDate, client: 'A', email: 'a@example.com', address: 'x', phone: '1', total: 100000, method: 'Wave', status: 'Payée', items: [] });
    window.db.saveOrder({ id: 'SH-OLD1', date: oldDate, client: 'B', email: 'b@example.com', address: 'x', phone: '2', total: 500000, method: 'Wave', status: 'Payée', items: [] });
  }, { recentDate: fmt(recent), oldDate: fmt(old) });
  await page.reload();

  log('le sélecteur de plage de dates existe avec la valeur par défaut "7 derniers jours"', await page.locator('#kpi-date-range').inputValue() === '7d');

  const revenue7d = await page.locator('#val-revenue').innerText();
  log('le CA sur 7 jours inclut la commande récente mais pas l\'ancienne', revenue7d.includes('100') && !revenue7d.includes('600'));

  await page.selectOption('#kpi-date-range', 'all');
  await page.waitForTimeout(200);
  const revenueAll = await page.locator('#val-revenue').innerText();
  log('sur "Tout", le CA inclut les deux commandes (100 000 + 500 000 = 600 000)', revenueAll.replace(/\s/g, '').includes('600000'));

  log('le badge de tendance est masqué sur "Tout" (pas de période de comparaison)', await page.locator('#kpi-revenue-trend').isVisible() === false);

  await page.selectOption('#kpi-date-range', '7d');
  await page.waitForTimeout(200);
  log('le badge de tendance est visible sur "7 derniers jours"', await page.locator('#kpi-revenue-trend').isVisible());

  log('Clients Actifs compte les emails distincts (2 dans "Tout")', (await page.selectOption('#kpi-date-range', 'all').then(() => page.waitForTimeout(200)).then(() => page.locator('#val-customers').innerText())).then ? true : true);
  const customersAll = await page.locator('#val-customers').innerText();
  log('Clients Actifs = 2 sur "Tout"', customersAll.trim().startsWith('2'));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task2-kpis.js"`
Expected: FAIL — `#kpi-date-range` doesn't exist yet.

- [ ] **Step 3: Restructure the Dashboard panel's header and KPI cards in `admin/index.html`**

Replace the existing dashboard `.panel-header` (currently `<h2>Operations Center</h2>` + "Actualiser" button) with:
```html
        <div class="panel-header">
          <div>
            <h2>Bonjour, Administrateur 👋</h2>
            <p>Gérez produits, commandes, clients et performance en un seul endroit.</p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <select id="kpi-date-range" class="date-range-select">
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="all">Tout</option>
            </select>
            <button class="btn-primary" id="btn-export-report">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
              Exporter le rapport
            </button>
          </div>
        </div>
```

Replace the entire `.metrics-grid` block with:
```html
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-wrapper" style="background:#EEF2FF; color:var(--accent-primary);">
              <svg style="width:22px; height:22px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17l6-6 4 4 8-8M17 7h8v8" /></svg>
            </div>
            <div>
              <span class="metric-title">Ventes Totales</span>
              <div class="metric-value" id="val-sales">…</div>
              <span class="metric-trend" id="kpi-sales-trend"></span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-wrapper" style="background:#ECFDF5; color:var(--status-green);">
              <svg style="width:22px; height:22px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <span class="metric-title">Chiffre d'Affaires</span>
              <div class="metric-value" id="val-revenue">…</div>
              <span class="metric-trend" id="kpi-revenue-trend"></span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-wrapper" style="background:#EFF6FF; color:var(--status-blue);">
              <svg style="width:22px; height:22px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-3.13a4 4 0 100-8 4 4 0 000 8zm6 0a4 4 0 10-2-7.45" /></svg>
            </div>
            <div>
              <span class="metric-title">Clients Actifs</span>
              <div class="metric-value" id="val-customers">…</div>
              <span class="metric-trend" id="kpi-customers-trend"></span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-wrapper" style="background:#FEF2F2; color:var(--status-red);">
              <svg style="width:22px; height:22px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
            </div>
            <div>
              <span class="metric-title">Demandes de Remboursement</span>
              <div class="metric-value" id="val-refunds">…</div>
              <span class="metric-trend" id="kpi-refunds-trend"></span>
            </div>
          </div>
        </div>

        <div class="panel-grid-2" id="dashboard-charts-row">
          <div class="content-card">
            <div class="content-card-header">
              <h3>Chiffre d'Affaires</h3>
            </div>
            <div class="content-card-body" id="revenue-chart-body" style="height: 260px;"></div>
          </div>
          <div class="content-card">
            <div class="content-card-header">
              <h3>Taux de Réussite</h3>
            </div>
            <div class="content-card-body" id="success-gauge-body" style="height: 260px;"></div>
          </div>
        </div>
```

Then, immediately below, keep a `panel-grid-2` for the bottom row but repoint it at the two Task 5/6 cards (for THIS task, just scaffold empty bodies so the test's DOM queries for KPI/trend elements have a stable page to run against — the old "Courbe de Performance" card and its entire inline SVG chart markup, plus the old "Dernières Commandes" card, are removed here since the bar chart moves to `#revenue-chart-body` above and Task 5 rebuilds "Dernières Commandes" in the row below):
```html
        <div class="panel-grid-2">
          <div class="content-card">
            <div class="content-card-header"><h3>Commandes Récentes</h3></div>
            <div class="content-card-body" id="recent-orders-body" style="padding:0;"></div>
          </div>
          <div class="content-card">
            <div class="content-card-header"><h3>Aperçu des Ventes</h3></div>
            <div class="content-card-body" id="sales-overview-body"></div>
          </div>
        </div>
```

Remove the OLD "Courbe de Performance" content-card (the one containing the `chart-toggle-btn`/inline curve SVG) and the OLD "Dernières Commandes" content-card entirely — both are superseded by the structure above. (Their DOM ids like `#dashboard-recent-orders`, `#chart-trend-badge`, `#chart-curve-path`, etc. will no longer exist; Task 3 and Task 5 introduce fresh replacements.)

- [ ] **Step 4: Add the date/KPI computation logic to `admin/js/dashboard.js`**

Add near the top of the IIFE (after `methodDisplay`, before `loadOverviewMetrics`):
```javascript
  // ---------- Date range filtering ----------
  let currentRangeKey = "7d";

  function parseOrderDate(dateStr) {
    // order.date is always produced by `new Date().toLocaleDateString('fr-FR')` -> "dd/mm/yyyy"
    const parts = (dateStr || "").split("/");
    if (parts.length !== 3) return new Date(0);
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }

  function rangeDays(rangeKey) {
    return rangeKey === "30d" ? 30 : 7;
  }

  function filterByRange(orders, rangeKey) {
    if (rangeKey === "all") return orders;
    const days = rangeDays(rangeKey);
    const start = new Date();
    start.setDate(start.getDate() - days);
    return orders.filter(o => parseOrderDate(o.date) >= start);
  }

  function filterByPreviousRange(orders, rangeKey) {
    if (rangeKey === "all") return [];
    const days = rangeDays(rangeKey);
    const start = new Date();
    start.setDate(start.getDate() - days * 2);
    const end = new Date();
    end.setDate(end.getDate() - days);
    return orders.filter(o => {
      const d = parseOrderDate(o.date);
      return d >= start && d < end;
    });
  }

  function trendPercent(current, previous) {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  }

  function renderTrend(elId, value) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (value === null || value === undefined || !isFinite(value)) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const sign = value >= 0 ? "+" : "";
    el.textContent = sign + value.toFixed(1) + "%";
    el.className = "metric-trend " + (value >= 0 ? "up" : "down");
  }
```

- [ ] **Step 5: Replace `loadOverviewMetrics` with real KPI computation**

Replace the existing `loadOverviewMetrics` function body with:
```javascript
  function computeKPIs(allOrders, rangeKey) {
    const current = filterByRange(allOrders, rangeKey);
    const previous = filterByPreviousRange(allOrders, rangeKey);

    const currentNonCancelled = current.filter(o => o.status !== "Annulée");
    const previousNonCancelled = previous.filter(o => o.status !== "Annulée");

    const currentRevenue = currentNonCancelled.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const previousRevenue = previousNonCancelled.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const currentCancelled = current.filter(o => o.status === "Annulée");
    const previousCancelled = previous.filter(o => o.status === "Annulée");

    const currentCustomers = new Set(current.map(o => o.email || o.phone).filter(Boolean)).size;
    const previousCustomers = new Set(previous.map(o => o.email || o.phone).filter(Boolean)).size;

    return {
      sales: { value: currentNonCancelled.length, trend: trendPercent(currentNonCancelled.length, previousNonCancelled.length) },
      revenue: { value: currentRevenue, trend: trendPercent(currentRevenue, previousRevenue) },
      customers: { value: currentCustomers, trend: trendPercent(currentCustomers, previousCustomers) },
      refunds: { value: currentCancelled.length, trend: trendPercent(currentCancelled.length, previousCancelled.length) }
    };
  }

  function loadOverviewMetrics() {
    const orders = window.db.getOrders();
    const kpis = computeKPIs(orders, currentRangeKey);

    const salesEl = document.getElementById("val-sales");
    if (salesEl) salesEl.textContent = kpis.sales.value;
    renderTrend("kpi-sales-trend", kpis.sales.trend);

    const revenueEl = document.getElementById("val-revenue");
    if (revenueEl) revenueEl.textContent = window.formatPrice(kpis.revenue.value);
    renderTrend("kpi-revenue-trend", kpis.revenue.trend);

    const customersEl = document.getElementById("val-customers");
    if (customersEl) customersEl.textContent = kpis.customers.value;
    renderTrend("kpi-customers-trend", kpis.customers.trend);

    const refundsEl = document.getElementById("val-refunds");
    if (refundsEl) refundsEl.textContent = kpis.refunds.value;
    renderTrend("kpi-refunds-trend", kpis.refunds.trend);
  }
```

Note: this removes the call to `renderRecentOrdersWidget(orders)` that used to sit at the end of the old `loadOverviewMetrics` — Task 5 reintroduces recent-orders rendering, called separately from `refresh()`.

- [ ] **Step 6: Wire the date-range selector and update `refresh()`**

Update `refresh()`:
```javascript
  function refresh() {
    loadOverviewMetrics();
    loadOrdersPanel();
  }
```
(unchanged in shape, but now calls the new `loadOverviewMetrics`.)

Add, right before the final `document.addEventListener("DOMContentLoaded", ...)` block:
```javascript
  function setupDateRangeSelector() {
    const select = document.getElementById("kpi-date-range");
    if (!select) return;
    select.addEventListener("change", () => {
      currentRangeKey = select.value;
      refresh();
    });
  }
```

Update the `DOMContentLoaded` listener to also call it:
```javascript
  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    setupChartToggle();
    setupDateRangeSelector();
  });
```

(`setupChartToggle()` will be replaced entirely in Task 3 — leave the call in place for now since Task 2 doesn't touch that function; it will safely no-op once Task 3 removes the old chart elements it looks for, per its own `if (!btnWeek || !btnMonth) return;` guard.)

- [ ] **Step 7: Add minimal CSS for the trend badges and date-range select**

Add to `admin/admin.css`:
```css
.metric-trend {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.metric-trend.up { background: #ECFDF5; color: var(--status-green); }
.metric-trend.down { background: #FEF2F2; color: var(--status-red); }

.date-range-select {
  height: 38px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 0.8rem;
  background: var(--card-bg);
  color: var(--text-heading);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task2-kpis.js"`
Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add admin/index.html admin/js/dashboard.js admin/admin.css
git commit -m "feat(admin): add real date-range filtering and 4 KPI cards with trend percentages"
```

---

### Task 3: Revenue bar chart with real data and hover tooltip

Replaces the old hardcoded curve/tooltip with a real bar chart (grouped by day for "Semaine", by week for "Mois") computed from actual orders, with a real hover tooltip.

**Files:**
- Create: `admin/js/dashboard-charts.js`
- Modify: `admin/index.html` (script tag; bar-chart SVG skeleton goes inside `#revenue-chart-body`)
- Modify: `admin/js/dashboard.js` (remove old `setupChartToggle`'s fake data; compute real weekly/monthly buckets; call `DashboardCharts.renderRevenueBarChart`)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task3-barchart.js`

**Interfaces:**
- Produces: `window.DashboardCharts.renderRevenueBarChart(container, buckets, options)` where `buckets` is `[{label: string, total: number, count: number, dateLabel: string}, ...]` (7 items for week, ~5 for month) and `options` is `{ trend: number|null }`. The function creates the entire SVG from scratch on every call (simplest correct approach — no partial-update state to manage) and wires its own hover listeners.
- Consumes (Task 2): `currentRangeKey` is NOT used here — per Global Constraints, the bar chart's own Semaine/Mois toggle is independent of the page-level date-range selector.

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task3-barchart.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  log('le graphique à barres contient 7 barres en mode Semaine', await page.locator('#revenue-chart-body .revenue-bar').count() === 7);

  await page.hover('#revenue-chart-body .revenue-bar >> nth=0');
  log('un tooltip apparaît au survol de la première barre', await page.locator('#revenue-chart-body .revenue-bar-tooltip').isVisible());

  await page.click('#btn-chart-month');
  await page.waitForTimeout(150);
  const monthBars = await page.locator('#revenue-chart-body .revenue-bar').count();
  log('le mode Mois affiche entre 4 et 5 barres', monthBars >= 4 && monthBars <= 5);

  await page.click('#btn-chart-week');
  await page.waitForTimeout(150);
  log('revenir en mode Semaine réaffiche 7 barres', await page.locator('#revenue-chart-body .revenue-bar').count() === 7);

  log('window.DashboardCharts est bien exposé et n\'expose que renderRevenueBarChart pour cette tâche', await page.evaluate(() => typeof window.DashboardCharts !== 'undefined' && typeof window.DashboardCharts.renderRevenueBarChart === 'function'));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task3-barchart.js"`
Expected: FAIL — `#revenue-chart-body` is empty, no `.revenue-bar` elements.

- [ ] **Step 3: Create `admin/js/dashboard-charts.js`**

```javascript
(function () {
  "use strict";

  function renderRevenueBarChart(container, buckets, options) {
    options = options || {};
    container.innerHTML = "";

    const maxTotal = Math.max(1, ...buckets.map(b => b.total));
    const width = 560;
    const height = 220;
    const paddingBottom = 26;
    const paddingTop = 10;
    const chartHeight = height - paddingBottom - paddingTop;
    const barGap = 14;
    const barWidth = (width - barGap * (buckets.length + 1)) / buckets.length;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";

    buckets.forEach((bucket, i) => {
      const barHeight = Math.max(4, (bucket.total / maxTotal) * chartHeight);
      const x = barGap + i * (barWidth + barGap);
      const y = paddingTop + (chartHeight - barHeight);

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("class", "revenue-bar");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", barHeight);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", "var(--accent-primary)");
      svg.appendChild(rect);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", x + barWidth / 2);
      label.setAttribute("y", height - 8);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "9");
      label.setAttribute("fill", "var(--text-body)");
      label.textContent = bucket.label;
      svg.appendChild(label);

      rect.addEventListener("mouseenter", () => showTooltip(container, bucket, x + barWidth / 2, y));
      rect.addEventListener("mouseleave", () => hideTooltip(container));
    });

    container.appendChild(svg);

    if (options.trend !== undefined && options.trend !== null) {
      const badge = document.createElement("span");
      badge.className = "chart-trend-floating badge-status " + (options.trend >= 0 ? "success" : "danger");
      badge.textContent = (options.trend >= 0 ? "+" : "") + options.trend.toFixed(1) + "% vs période précédente";
      container.appendChild(badge);
    }
  }

  function showTooltip(container, bucket, x, y) {
    hideTooltip(container);
    const tooltip = document.createElement("div");
    tooltip.className = "revenue-bar-tooltip";
    tooltip.innerHTML =
      '<strong></strong><br><span class="tooltip-count"></span><br><span class="tooltip-total"></span>';
    tooltip.querySelector("strong").textContent = bucket.dateLabel;
    tooltip.querySelector(".tooltip-count").textContent = bucket.count + " commande(s)";
    tooltip.querySelector(".tooltip-total").textContent = window.formatPrice(bucket.total);
    container.style.position = "relative";
    tooltip.style.left = (x / 560 * 100) + "%";
    tooltip.style.top = "0px";
    container.appendChild(tooltip);
  }

  function hideTooltip(container) {
    const existing = container.querySelector(".revenue-bar-tooltip");
    if (existing) existing.remove();
  }

  window.DashboardCharts = { renderRevenueBarChart: renderRevenueBarChart };
})();
```

- [ ] **Step 4: Add the bar-chart CSS to `admin/admin.css`**

```css
.revenue-bar { cursor: pointer; transition: opacity 0.15s; }
.revenue-bar:hover { opacity: 0.85; }

.revenue-bar-tooltip {
  position: absolute;
  transform: translateX(-50%);
  background: var(--text-heading);
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  line-height: 1.4;
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
}

.chart-trend-floating {
  position: absolute;
  top: 16px;
  right: 16px;
}
```

- [ ] **Step 5: Replace `setupChartToggle` in `admin/js/dashboard.js` with real bucket computation**

Replace the entire `setupChartToggle` function with:
```javascript
  function buildWeeklyBuckets(orders) {
    const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      buckets.push({ label: dayLabels[(day.getDay() + 6) % 7], total: 0, count: 0, dateLabel: day.toLocaleDateString("fr-FR"), dayStart: day });
    }

    orders.forEach(o => {
      if (o.status === "Annulée") return;
      const d = parseOrderDate(o.date);
      const bucket = buckets.find(b => b.dayStart.toDateString() === d.toDateString());
      if (bucket) {
        bucket.total += parseFloat(o.total) || 0;
        bucket.count += 1;
      }
    });

    return buckets;
  }

  function buildMonthlyBuckets(orders) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 34); // 5 weeks
    start.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      buckets.push({ label: "Sem " + (i + 1), total: 0, count: 0, dateLabel: "Sem " + (i + 1) + " (" + weekStart.toLocaleDateString("fr-FR") + ")", weekStart: weekStart, weekEnd: weekEnd });
    }

    orders.forEach(o => {
      if (o.status === "Annulée") return;
      const d = parseOrderDate(o.date);
      const bucket = buckets.find(b => d >= b.weekStart && d < b.weekEnd);
      if (bucket) {
        bucket.total += parseFloat(o.total) || 0;
        bucket.count += 1;
      }
    });

    return buckets;
  }

  function renderRevenueChart(mode) {
    const container = document.getElementById("revenue-chart-body");
    if (!container) return;
    const orders = window.db.getOrders();
    const buckets = mode === "month" ? buildMonthlyBuckets(orders) : buildWeeklyBuckets(orders);

    const currentTotal = buckets.reduce((s, b) => s + b.total, 0);
    // Trend vs the immediately preceding equivalent window, using the same bucket builders
    // shifted back by their own span, so the badge reflects the same granularity being viewed.
    const shiftedOrders = orders; // filtering happens by absolute date inside the builder, so
    // compute the previous window's total by re-running the same builder logic against a
    // synthetic "now" shifted back — simplest correct approach: sum orders in the prior window directly.
    const now = new Date();
    const spanDays = mode === "month" ? 35 : 7;
    const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - spanDays * 2);
    const prevEnd = new Date(now); prevEnd.setDate(prevEnd.getDate() - spanDays);
    const previousTotal = orders
      .filter(o => o.status !== "Annulée")
      .filter(o => { const d = parseOrderDate(o.date); return d >= prevStart && d < prevEnd; })
      .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);

    const trend = trendPercent(currentTotal, previousTotal);
    window.DashboardCharts.renderRevenueBarChart(container, buckets, { trend: trend });
  }

  function setupChartToggle() {
    const btnWeek = document.getElementById("btn-chart-week");
    const btnMonth = document.getElementById("btn-chart-month");
    if (!btnWeek || !btnMonth) return;

    renderRevenueChart("week");

    btnWeek.addEventListener("click", () => {
      btnWeek.classList.add("active");
      btnMonth.classList.remove("active");
      renderRevenueChart("week");
    });
    btnMonth.addEventListener("click", () => {
      btnMonth.classList.add("active");
      btnWeek.classList.remove("active");
      renderRevenueChart("month");
    });
  }
```

- [ ] **Step 6: Add the Semaine/Mois toggle buttons and load the new script in `admin/index.html`**

Inside the `#dashboard-charts-row` card whose header currently just says `<h3>Chiffre d'Affaires</h3>` (added in Task 2), update that header to:
```html
            <div class="content-card-header">
              <h3>Chiffre d'Affaires</h3>
              <div style="display: flex; gap: 4px; background: var(--page-bg); padding: 2px; border-radius: 6px;">
                <button class="chart-toggle-btn active" id="btn-chart-week">Semaine</button>
                <button class="chart-toggle-btn" id="btn-chart-month">Mois</button>
              </div>
            </div>
```

Add the script tag to the bottom of `admin/index.html`, right before `<script src="js/dashboard.js"></script>`:
```html
  <script src="js/dashboard-charts.js"></script>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task3-barchart.js"`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add admin/js/dashboard-charts.js admin/index.html admin/js/dashboard.js admin/admin.css
git commit -m "feat(admin): replace fake performance curve with a real revenue bar chart and hover tooltip"
```

---

### Task 4: Radial "Taux de Réussite" gauge + mini stat cards

**Files:**
- Modify: `admin/js/dashboard-charts.js` (add `renderSuccessGauge`)
- Modify: `admin/index.html` (fill `#success-gauge-body`)
- Modify: `admin/js/dashboard.js` (compute success rate + call the renderer)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task4-gauge.js`

**Interfaces:**
- Produces: `window.DashboardCharts.renderSuccessGauge(container, percent)` — appended to the same `window.DashboardCharts` object from Task 3 (do not overwrite the object, add the new key to it).
- Consumes: `currentRangeKey`, `filterByRange` (Task 2, same file) — the gauge respects the page-level date-range selector (unlike the bar chart).

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task4-gauge.js`:
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

  const today = new Date().toLocaleDateString('fr-FR');
  await page.evaluate((d) => {
    window.db.saveOrder({ id: 'SH-G1', date: d, client: 'A', email: 'a@x.com', address: 'x', phone: '1', total: 1000, method: 'Wave', status: 'Payée', items: [] });
    window.db.saveOrder({ id: 'SH-G2', date: d, client: 'B', email: 'b@x.com', address: 'x', phone: '2', total: 1000, method: 'Wave', status: 'Expédiée', items: [] });
    window.db.saveOrder({ id: 'SH-G3', date: d, client: 'C', email: 'c@x.com', address: 'x', phone: '3', total: 1000, method: 'Wave', status: 'En attente', items: [] });
    window.db.saveOrder({ id: 'SH-G4', date: d, client: 'D', email: 'd@x.com', address: 'x', phone: '4', total: 1000, method: 'Wave', status: 'Annulée', items: [] });
  }, today);
  await page.selectOption('#kpi-date-range', 'all');
  await page.waitForTimeout(200);

  log('la jauge affiche un pourcentage', await page.locator('#success-gauge-body .gauge-percent').innerText().then(t => /\d/.test(t)));
  // 2 réussies (Payée+Expédiée) sur 3 non-annulées = 66.7%
  log('le taux de réussite calculé est correct (66.7%)', await page.locator('#success-gauge-body .gauge-percent').innerText().then(t => t.includes('66.7') || t.includes('67')));
  log('deux mini-cartes de stats sont affichées sous la jauge', await page.locator('#success-gauge-body .gauge-mini-stat').count() === 2);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task4-gauge.js"`
Expected: FAIL — `#success-gauge-body` is empty.

- [ ] **Step 3: Add `renderSuccessGauge` to `admin/js/dashboard-charts.js`**

Add this function inside the existing IIFE (before the final `window.DashboardCharts = ...` line), then update that line to include the new key:
```javascript
  function renderSuccessGauge(container, percent, stats) {
    container.innerHTML = "";

    const svgNS = "http://www.w3.org/2000/svg";
    const size = 180;
    const radius = 70;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const totalSegments = 24;
    const filledSegments = Math.round((percent / 100) * totalSegments);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + (size / 2 + 30));
    svg.setAttribute("width", "160");
    svg.setAttribute("height", "110");

    for (let i = 0; i < totalSegments; i++) {
      const angle = Math.PI + (i / (totalSegments - 1)) * Math.PI;
      const x1 = cx + Math.cos(angle) * (radius - 8);
      const y1 = cy + Math.sin(angle) * (radius - 8);
      const x2 = cx + Math.cos(angle) * radius;
      const y2 = cy + Math.sin(angle) * radius;

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", i < filledSegments ? "var(--accent-primary)" : "var(--border-light)");
      line.setAttribute("stroke-width", "5");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    }

    const wrap = document.createElement("div");
    wrap.className = "gauge-wrap";
    wrap.appendChild(svg);

    const percentLabel = document.createElement("div");
    percentLabel.className = "gauge-percent";
    percentLabel.textContent = percent.toFixed(1) + "%";
    wrap.appendChild(percentLabel);

    const subLabel = document.createElement("div");
    subLabel.className = "gauge-sublabel";
    subLabel.textContent = "Croissance des ventes";
    wrap.appendChild(subLabel);

    container.appendChild(wrap);

    const statsRow = document.createElement("div");
    statsRow.className = "gauge-mini-stats";
    (stats || []).forEach(s => {
      const card = document.createElement("div");
      card.className = "gauge-mini-stat";
      card.innerHTML = '<span class="gauge-mini-stat-label"></span><span class="gauge-mini-stat-value"></span>';
      card.querySelector(".gauge-mini-stat-label").textContent = s.label;
      card.querySelector(".gauge-mini-stat-value").textContent = s.value;
      statsRow.appendChild(card);
    });
    container.appendChild(statsRow);
  }

  window.DashboardCharts = {
    renderRevenueBarChart: renderRevenueBarChart,
    renderSuccessGauge: renderSuccessGauge
  };
```

- [ ] **Step 4: Add gauge CSS to `admin/admin.css`**

```css
.gauge-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
.gauge-percent { font-size: 1.6rem; font-weight: 800; color: var(--text-heading); margin-top: -30px; }
.gauge-sublabel { font-size: 0.75rem; color: var(--text-body); }
.gauge-mini-stats { display: flex; gap: 12px; margin-top: 16px; width: 100%; }
.gauge-mini-stat {
  flex: 1;
  background: var(--page-bg);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gauge-mini-stat-label { font-size: 0.65rem; color: var(--text-body); text-transform: uppercase; }
.gauge-mini-stat-value { font-size: 0.9rem; font-weight: 700; color: var(--text-heading); }
#success-gauge-body { display: flex; flex-direction: column; align-items: center; justify-content: center; }
```

- [ ] **Step 5: Compute and render the success rate in `admin/js/dashboard.js`**

Add, right after `computeKPIs`:
```javascript
  function computeSuccessRate(allOrders, rangeKey) {
    const current = filterByRange(allOrders, rangeKey).filter(o => o.status !== "Annulée");
    const successful = current.filter(o => o.status === "Payée" || o.status === "Expédiée");
    const percent = current.length ? (successful.length / current.length) * 100 : 0;
    return { percent: percent, successfulCount: successful.length, successfulRevenue: successful.reduce((s, o) => s + (parseFloat(o.total) || 0), 0) };
  }

  function renderSuccessGauge() {
    const container = document.getElementById("success-gauge-body");
    if (!container || !window.DashboardCharts) return;
    const orders = window.db.getOrders();
    const result = computeSuccessRate(orders, currentRangeKey);
    window.DashboardCharts.renderSuccessGauge(container, result.percent, [
      { label: "Ventes", value: result.successfulCount },
      { label: "Chiffre d'Affaires", value: window.formatPrice(result.successfulRevenue) }
    ]);
  }
```

Update `loadOverviewMetrics()` to also call it, at the end of the function:
```javascript
    renderSuccessGauge();
  }
```
(i.e., add this line just before the function's closing brace.)

- [ ] **Step 6: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task4-gauge.js"`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add admin/js/dashboard-charts.js admin/index.html admin/js/dashboard.js admin/admin.css
git commit -m "feat(admin): add real radial success-rate gauge with mini stat cards"
```

---

### Task 5: Recent Orders preview (restyled) + Sales Overview (breakdown + top products)

**Files:**
- Modify: `admin/js/dashboard.js` (restore a read-only recent-orders renderer targeting the new `#recent-orders-body`; add sales-overview computation + rendering)
- Modify: `admin/admin.css` (sales-overview breakdown bar + legend + mini table styles)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task5-salesoverview.js`

**Interfaces:**
- Consumes: `currentRangeKey`, `filterByRange` (Task 2).
- Produces: nothing new consumed by later tasks in this phase.

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task5-salesoverview.js`:
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

  const today = new Date().toLocaleDateString('fr-FR');
  await page.evaluate((d) => {
    window.db.saveOrder({
      id: 'SH-SO1', date: d, client: 'Aminata Test', email: 'a@x.com', address: 'x', phone: '1', total: 30000, method: 'Wave', status: 'Payée',
      items: [
        { title: 'Polo Test', price: 15000, qty: 2, size: 'M', variant: { name: 'Bleu', img: 'images/polo_bleu.png' } },
        { title: 'Second Article', price: 5000, qty: 1, size: 'L', variant: { name: 'Rouge', img: 'images/second.png' } }
      ]
    });
  }, today);
  await page.selectOption('#kpi-date-range', 'all');
  await page.waitForTimeout(200);

  log('le tableau Commandes Récentes affiche le premier article, le client, la date et "+1 autres articles"', await page.locator('#recent-orders-body').innerText().then(t => t.includes('Polo Test') && t.includes('Aminata Test') && t.includes(today) && t.includes('+1 autres articles')));
  log('le tableau Commandes Récentes n\'affiche pas de colonne N° Commande', await page.locator('#recent-orders-body').innerText().then(t => !t.includes('SH-SO1')));
  log('la légende Aperçu des Ventes affiche 3 catégories avec %', await page.locator('#sales-overview-body .sales-legend-item').count() === 3);
  log('la visualisation en barres proportionnelles existe', await page.locator('#sales-overview-body .sales-breakdown-bar').count() >= 1);
  log('le tableau des produits les plus vendus affiche "Polo Test"', await page.locator('#sales-overview-body').innerText().then(t => t.includes('Polo Test')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task5-salesoverview.js"`
Expected: FAIL — `#recent-orders-body`/`#sales-overview-body` are empty.

- [ ] **Step 3: Add the recent-orders renderer to `admin/js/dashboard.js`**

Replace the old `renderRecentOrdersWidget` function (still present from before, now orphaned since Task 2 stopped calling it and it targets a removed `#dashboard-recent-orders` id) with this new version targeting `#recent-orders-body`:
```javascript
  function buildThumbElement(firstItem) {
    if (firstItem && firstItem.variant && firstItem.variant.img) {
      const img = document.createElement("img");
      img.className = "recent-order-thumb";
      img.src = firstItem.variant.img; // product catalog data (admin-controlled), safe as a src
      img.alt = "";
      return img;
    }
    const placeholder = document.createElement("div");
    placeholder.className = "recent-order-thumb recent-order-thumb-empty";
    placeholder.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />' +
      "</svg>";
    return placeholder;
  }

  function renderRecentOrdersPreview() {
    const container = document.getElementById("recent-orders-body");
    if (!container) return;
    const orders = window.db.getOrders();

    if (orders.length === 0) {
      container.innerHTML = '<p class="empty-state-panel">Aucune commande pour le moment.</p>';
      return;
    }

    const table = document.createElement("table");
    table.innerHTML =
      "<thead><tr><th>Article</th><th>Client</th><th>Date</th><th>Montant</th><th style=\"text-align:right;\">Statut</th></tr></thead><tbody></tbody>";
    const tbody = table.querySelector("tbody");

    orders.slice(-5).reverse().forEach(o => {
      const items = o.items || [];
      const firstItem = items[0];
      const extraCount = items.length - 1;

      const itemCell = document.createElement("td");
      const itemWrap = document.createElement("div");
      itemWrap.className = "recent-order-item-cell";
      itemWrap.appendChild(buildThumbElement(firstItem));

      const textWrap = document.createElement("div");
      const titleEl = document.createElement("span");
      titleEl.className = "recent-order-title";
      // item.title comes from the product catalog (admin-controlled), but we still use
      // textContent (never innerHTML interpolation) to match this file's established convention.
      titleEl.textContent = firstItem ? firstItem.title : "Commande vide";
      textWrap.appendChild(titleEl);
      if (extraCount > 0) {
        const extraEl = document.createElement("span");
        extraEl.className = "recent-order-extra";
        extraEl.textContent = "+" + extraCount + " autres articles";
        textWrap.appendChild(document.createElement("br"));
        textWrap.appendChild(extraEl);
      }
      itemWrap.appendChild(textWrap);
      itemCell.appendChild(itemWrap);

      const clientCell = document.createElement("td");
      clientCell.textContent = o.client; // customer-submitted (js/shammah.js) -> textContent only

      const dateCell = document.createElement("td");
      dateCell.textContent = o.date;

      const totalCell = document.createElement("td");
      totalCell.textContent = window.formatPrice(o.total);

      const statusCell = document.createElement("td");
      statusCell.style.textAlign = "right";
      const badge = document.createElement("span");
      badge.className = "badge-status " + statusBadgeClass(o.status);
      const dot = document.createElement("span");
      dot.className = "bullet-dot";
      badge.appendChild(dot);
      badge.appendChild(document.createTextNode(" " + o.status));
      statusCell.appendChild(badge);

      const tr = document.createElement("tr");
      tr.appendChild(itemCell);
      tr.appendChild(clientCell);
      tr.appendChild(dateCell);
      tr.appendChild(totalCell);
      tr.appendChild(statusCell);
      tbody.appendChild(tr);
    });

    container.innerHTML = "";
    container.appendChild(table);
  }
```

- [ ] **Step 4: Add the sales-overview computation and renderer**

Add, after `computeSuccessRate`:
```javascript
  function computeSalesOverview(allOrders, rangeKey) {
    const current = filterByRange(allOrders, rangeKey);
    const total = current.length || 1;

    const successful = current.filter(o => o.status === "Payée" || o.status === "Expédiée").length;
    const pending = current.filter(o => o.status === "En attente").length;
    const cancelled = current.filter(o => o.status === "Annulée").length;

    const breakdown = [
      { label: "Réussies", key: "success", percent: (successful / total) * 100 },
      { label: "En attente", key: "pending", percent: (pending / total) * 100 },
      { label: "Annulées", key: "cancelled", percent: (cancelled / total) * 100 }
    ];

    const productTotals = {};
    current.forEach(o => {
      (o.items || []).forEach(item => {
        const title = item.title || "Article";
        const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 1);
        productTotals[title] = (productTotals[title] || 0) + lineTotal;
      });
    });

    const grandTotal = Object.values(productTotals).reduce((s, v) => s + v, 0) || 1;
    const topProducts = Object.keys(productTotals)
      .map(title => ({ title: title, earnings: productTotals[title], percent: (productTotals[title] / grandTotal) * 100 }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 4);

    return { breakdown: breakdown, topProducts: topProducts };
  }

  function renderSalesOverview() {
    const container = document.getElementById("sales-overview-body");
    if (!container) return;
    const orders = window.db.getOrders();
    const data = computeSalesOverview(orders, currentRangeKey);

    const legendHTML = data.breakdown.map(b =>
      '<div class="sales-legend-item"><span class="sales-legend-dot ' + b.key + '"></span><span class="sales-legend-label"></span><strong class="sales-legend-percent"></strong></div>'
    ).join("");

    const barsHTML = data.breakdown.map(b => {
      const ticks = Math.round(b.percent / 2); // ~50 ticks total across all 3 categories
      let ticksHTML = "";
      for (let i = 0; i < ticks; i++) {
        ticksHTML += '<span class="sales-breakdown-bar ' + b.key + '"></span>';
      }
      return ticksHTML;
    }).join("");

    const rowsHTML = data.topProducts.map(p =>
      '<tr><td class="top-product-name"></td><td class="top-product-percent"></td><td class="top-product-earnings"></td></tr>'
    ).join("");

    container.innerHTML =
      '<div class="sales-legend">' + legendHTML + '</div>' +
      '<div class="sales-breakdown-row">' + barsHTML + '</div>' +
      '<table class="sales-top-products"><thead><tr><th>Produit</th><th>Part</th><th>Gains</th></tr></thead><tbody>' + rowsHTML + '</tbody></table>';

    container.querySelectorAll(".sales-legend-item").forEach((el, i) => {
      el.querySelector(".sales-legend-label").textContent = data.breakdown[i].label;
      el.querySelector(".sales-legend-percent").textContent = data.breakdown[i].percent.toFixed(1) + "%";
    });

    if (data.topProducts.length === 0) {
      container.querySelector(".sales-top-products tbody").innerHTML = '<tr><td colspan="3" class="empty-state-panel">Aucun article vendu sur cette période.</td></tr>';
    } else {
      container.querySelectorAll(".sales-top-products tbody tr").forEach((row, i) => {
        row.querySelector(".top-product-name").textContent = data.topProducts[i].title;
        row.querySelector(".top-product-percent").textContent = data.topProducts[i].percent.toFixed(0) + "%";
        row.querySelector(".top-product-earnings").textContent = window.formatPrice(data.topProducts[i].earnings);
      });
    }
  }
```

- [ ] **Step 5: Wire both renderers into `loadOverviewMetrics`**

Add these two calls at the end of `loadOverviewMetrics`, alongside the `renderSuccessGauge();` line added in Task 4:
```javascript
    renderSuccessGauge();
    renderRecentOrdersPreview();
    renderSalesOverview();
  }
```

- [ ] **Step 6: Add CSS for the sales-overview widget**

```css
.sales-legend { display: flex; gap: 20px; padding: 16px 20px 0; }
.sales-legend-item { display: flex; align-items: center; gap: 6px; flex-direction: column; align-items: flex-start; }
.sales-legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.sales-legend-dot.success { background: var(--status-green); }
.sales-legend-dot.pending { background: var(--status-amber); }
.sales-legend-dot.cancelled { background: var(--status-red); }
.sales-legend-label { font-size: 0.7rem; color: var(--text-body); }
.sales-legend-percent { font-size: 1.1rem; font-weight: 800; color: var(--text-heading); }

.sales-breakdown-row { display: flex; gap: 2px; align-items: flex-end; padding: 16px 20px; height: 40px; }
.sales-breakdown-bar { width: 4px; height: 100%; border-radius: 2px; display: inline-block; }
.sales-breakdown-bar.success { background: var(--status-green); }
.sales-breakdown-bar.pending { background: var(--status-amber); }
.sales-breakdown-bar.cancelled { background: var(--status-red); }

.sales-top-products { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.sales-top-products th { text-align: left; padding: 10px 20px; color: var(--text-body); font-weight: 600; border-top: 1px solid var(--border-light); }
.sales-top-products td { padding: 8px 20px; border-top: 1px solid var(--border-light); }

.recent-order-item-cell { display: flex; align-items: center; gap: 10px; }
.recent-order-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.recent-order-thumb-empty { display: flex; align-items: center; justify-content: center; background: var(--page-bg); color: var(--text-body); }
.recent-order-title { font-size: 0.8rem; font-weight: 600; color: var(--text-heading); }
.recent-order-extra { font-size: 0.7rem; color: var(--text-body); }
```

- [ ] **Step 7: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task5-salesoverview.js"`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add admin/js/dashboard.js admin/admin.css
git commit -m "feat(admin): restyle recent orders preview and add real sales overview breakdown"
```

---

### Task 6: Export Report (real CSV download)

**Files:**
- Modify: `admin/js/dashboard.js` (build CSV from current KPIs + recent orders, trigger download)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task6-export.js`

**Interfaces:**
- Consumes: `computeKPIs`, `currentRangeKey`, `window.db.getOrders()` (all Task 2/this file).

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task6-export.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/admin/index.html';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE);

  const downloadPromise = page.waitForEvent('download');
  await page.click('#btn-export-report');
  const download = await downloadPromise;

  log('le téléchargement porte un nom de fichier .csv', /\.csv$/.test(download.suggestedFilename()));

  const path = await download.path();
  const fs = require('fs');
  const content = fs.readFileSync(path, 'utf-8');
  log('le CSV contient un en-tête avec les KPI', content.includes('Ventes Totales') && content.includes('Chiffre d\'Affaires'));
  log('le CSV contient une section des commandes récentes', content.includes('Commande') && content.includes('Client'));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task6-export.js"`
Expected: FAIL — `#btn-export-report` has no click handler, no download fires (test times out waiting for the download event — this is the expected failure mode; if it hangs, that itself confirms RED).

- [ ] **Step 3: Add the export function to `admin/js/dashboard.js`**

Add, right after `setupDateRangeSelector`:
```javascript
  function csvEscape(value) {
    const str = String(value === undefined || value === null ? "" : value);
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
      return "\"" + str.replace(/"/g, "\"\"") + "\"";
    }
    return str;
  }

  function buildReportCSV() {
    const orders = window.db.getOrders();
    const kpis = computeKPIs(orders, currentRangeKey);

    const lines = [];
    lines.push("Indicateur,Valeur");
    lines.push(csvEscape("Ventes Totales") + "," + csvEscape(kpis.sales.value));
    lines.push(csvEscape("Chiffre d'Affaires") + "," + csvEscape(window.formatPrice(kpis.revenue.value)));
    lines.push(csvEscape("Clients Actifs") + "," + csvEscape(kpis.customers.value));
    lines.push(csvEscape("Demandes de Remboursement") + "," + csvEscape(kpis.refunds.value));
    lines.push("");
    lines.push("Commande,Client,Date,Total,Statut");
    orders.slice(-5).reverse().forEach(o => {
      lines.push([o.id, o.client, o.date, window.formatPrice(o.total), o.status].map(csvEscape).join(","));
    });

    return lines.join("\n");
  }

  function setupExportButton() {
    const btn = document.getElementById("btn-export-report");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const csv = buildReportCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = "rapport-shammah-" + today + ".csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      window.Toast.show("Rapport exporté.", "success");
    });
  }
```

Update the final `DOMContentLoaded` listener to also call it:
```javascript
  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    setupChartToggle();
    setupDateRangeSelector();
    setupExportButton();
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task6-export.js"`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/js/dashboard.js
git commit -m "feat(admin): add real CSV export for the dashboard report button"
```

---

### Task 7: Final integration pass — full regression across Phase 1 + existing suite

Verifies the whole phase together, confirms the older `test-premium-task*.js` suite (from the prior admin-dashboard project) still passes now that the sidebar is gone and shared card/button styles changed, and cleans up any leftover dead references.

**Files:**
- Modify: `admin/js/dashboard.js` (remove the now-fully-orphaned old `renderRecentOrdersWidget` if any trace remains — it was replaced in Task 5, confirm no dead code was left behind)
- Test: `C:\tmp\shammah-checkout-tests\test-bloom-p1-task7-final.js`

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-bloom-p1-task7-final.js`:
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

  const panels = ['panel-dashboard', 'panel-orders', 'panel-products', 'panel-customers', 'panel-settings', 'panel-promos'];
  for (const target of panels) {
    await page.click('.nav-item[data-target="' + target + '"]');
    const isActive = await page.locator('#' + target).evaluate(el => el.classList.contains('active'));
    log('la navigation affiche bien ' + target, isActive);
  }

  log('les cartes KPI, le graphique, la jauge, les commandes récentes et l\'aperçu des ventes sont tous non vides', await page.evaluate(() => {
    return document.getElementById('val-revenue').textContent !== '…'
      && document.querySelectorAll('#revenue-chart-body .revenue-bar').length === 7
      && document.querySelector('#success-gauge-body .gauge-percent') !== null
      && document.getElementById('recent-orders-body').children.length > 0
      && document.getElementById('sales-overview-body').children.length > 0;
  }));

  log('aucune erreur accumulée après navigation complète', errors.length === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails (or passes already if nothing is broken — see note)**

Run: `node "C:\tmp\shammah-checkout-tests\test-bloom-p1-task7-final.js"`
Expected: likely already passes if Tasks 1-6 were done correctly — this task's real job is the manual full-suite regression sweep below, not a new red/green cycle. If it fails, investigate and fix before proceeding (do not treat a failure here as acceptable).

- [ ] **Step 3: Run the entire prior `test-premium-task*.js` suite plus all `test-bloom-p1-task*.js` files as a full regression check**

```bash
for f in test-premium-task1-db test-premium-task2-uikit test-premium-task3-theme test-premium-task4-palette test-premium-task5-shell test-premium-task6-dashboard test-premium-task7-categories test-premium-task8-promos test-premium-task9-sizechips test-premium-task10-colorcards test-premium-task11-products test-premium-task12-paymenticons test-premium-task13-final test-premium-finalfix-darkmode test-premium-finalfix-subcategory test-premium-finalfix-photopath test-premium-finalfix-duplicatedrawer test-premium-finalfix-orderdetail test-premium-finalfix-darkmode-cta test-bloom-p1-task1-navshell test-bloom-p1-task2-kpis test-bloom-p1-task3-barchart test-bloom-p1-task4-gauge test-bloom-p1-task5-salesoverview test-bloom-p1-task6-export test-bloom-p1-task7-final; do
  node "C:\tmp\shammah-checkout-tests\$f.js" || echo "ECHEC: $f"
done
```

**Important:** several of the old `test-premium-task3-theme.js` (dark mode/sidebar collapse) and `test-premium-task4-palette.js` (checks `.search-box input` exists) assertions will legitimately FAIL now, since Task 1 of this plan intentionally removed the theme-toggle button, sidebar-collapse button, and the visible search box — this is an accepted, deliberate divergence from the prior phase (per this plan's Global Constraints and the approved design spec §2), not a regression to fix. Read each failure's specific assertion text before deciding: if it's about the theme/sidebar-collapse buttons or the visible search input no longer existing, that's expected — note it in the commit message. If it's about anything else (product drawer, promo codes, categories, payment icons, order detail, etc.), that's a real regression and must be fixed before committing.

- [ ] **Step 4: Fix any genuine regressions found, re-run until only the expected divergences remain**

(No placeholder here — if Step 3 finds a real regression, the specific fix depends on what broke; investigate via the failing assertion's message and the relevant file from this plan's Task 1-6 changes, then re-run the full sweep again.)

- [ ] **Step 5: Commit**

```bash
git add admin/js/dashboard.js
git commit -m "test(admin): add Phase 1 final regression test and confirm no unintended breakage"
```
