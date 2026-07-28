# Next.js Plan B — Chantier 1 (Nav + Dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the already-validated vanilla Bloom Phase 1 dashboard (top nav + real dashboard) to the Next.js project (`nextjs/`), backed by the real Postgres data (Neon) instead of `localStorage`, with placeholder pages for the 5 sections that get their own future chantier.

**Architecture:** `app/(admin)/layout.tsx` gets a top nav shell (client component for active-tab highlighting + a user menu with real sign-out). The dashboard page becomes an async Server Component that reads `range`/`chart` from the URL search params and calls a new pure data-layer module (`lib/dashboard-metrics.ts`) directly via Prisma — no new API route. Only the few genuinely interactive widgets (revenue chart hover/toggle, date-range select, CSV export) are client components; they receive already-computed data as props.

**Tech Stack:** Next.js 16 (App Router, Server Components) + TypeScript, Tailwind v4 (tokens already in `app/globals.css`), Prisma + Neon, NextAuth v5 (`next-auth/react` `signOut`), Playwright for browser tests, plain Node scripts for the pure data-layer test — same PASS/FAIL console convention as the rest of the project.

## Global Constraints

- No new API route for the dashboard's own data — Server Components call Prisma directly (spec §6).
- Charts are hand-rolled SVG, `stroke="currentColor" stroke-width="2"` — no charting library (spec §4, confirmed with user).
- Icons: inline SVG only, no icon library, no raster except real product photos (project-wide convention).
- Design tokens already exist in `nextjs/app/globals.css` (`--color-page-bg`, `--color-card-bg`, `--color-accent-primary`, `--color-accent-primary-hover`, `--color-status-blue/amber/green/red`, `--color-text-heading`, `--color-text-body`, `--radius-card`, `--shadow-card`) — use the Tailwind utility classes they generate (`bg-page-bg`, `text-text-heading`, `rounded-card`, `shadow-card`, etc.), don't redefine them.
- `AdminUser` has no `name` field — the user-menu display name is the static string "Administrateur" (matches vanilla), not derived from the session.
- Trend badges are hidden (not "+∞%") whenever the comparison baseline is 0 — this covers both `range=all` and any period whose previous window had zero orders/revenue (spec §5.2, added during spec self-review).
- `OrderItem.variantId` is `null` on all 4 migrated legacy orders (the migration script doesn't set it) — any UI needing a product thumbnail from an order must handle a missing image gracefully, never assume one exists.
- Test file locations: Playwright browser tests go in `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-*.js` (established convention, see `test-bloom-p1-task1-navshell.js` for style); the one pure-data-layer test goes in `nextjs/scripts/test-dashboard-metrics.js` (same location as the other plain Node PASS/FAIL scripts from Plan A).
- Money fields (`Order.total`, `OrderItem.price`) come back from Prisma as `Decimal` objects — always wrap in `Number(...)` before arithmetic or rendering.

---

### Task 1: Top nav shell, user menu with real sign-out, placeholder pages

Builds the shared navigation shell everything else lives inside, and stubs the 5 not-yet-built sections so the nav never 404s.

**Files:**
- Modify: `nextjs/app/(admin)/layout.tsx`
- Modify: `nextjs/middleware.ts`
- Create: `nextjs/components/dashboard/TopNav.tsx`
- Create: `nextjs/components/dashboard/UserMenu.tsx`
- Create: `nextjs/components/dashboard/ComingSoonPanel.tsx`
- Create: `nextjs/app/(admin)/produits/page.tsx`
- Create: `nextjs/app/(admin)/commandes/page.tsx`
- Create: `nextjs/app/(admin)/clients/page.tsx`
- Create: `nextjs/app/(admin)/attributs/page.tsx`
- Create: `nextjs/app/(admin)/promotions/page.tsx`
- Create: `C:\tmp\shammah-checkout-tests\test-utils-nextjs-login.js`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task1-navshell.js`

**Interfaces:**
- Produces: `NAV_ITEMS: { label: string; href: string }[]` exported from `TopNav.tsx` (Task 3+ don't need it, but keeps the tab list in one place).
- Produces: `loginAsAdmin(page): Promise<void>` exported from `test-utils-nextjs-login.js` — logs in via the `/login` form using `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` from `nextjs/.env`, waits for redirect to `/dashboard`. Every later task's Playwright test imports this instead of re-implementing login.

- [ ] **Step 1: Write the failing Playwright test**

Create `C:\tmp\shammah-checkout-tests\test-utils-nextjs-login.js`:

```javascript
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../nextjs/.env') });

async function loginAsAdmin(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('#email', process.env.ADMIN_SEED_EMAIL);
  await page.fill('#password', process.env.ADMIN_SEED_PASSWORD);
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard');
}

module.exports = { loginAsAdmin };
```

Create `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task1-navshell.js`:

```javascript
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  const tabs = ['Dashboard', 'Produits', 'Commandes', 'Clients', 'Attributs', 'Promotions'];
  for (const tab of tabs) {
    const link = page.locator('[data-nav-item="' + tab + '"]');
    log('l\'onglet ' + tab + ' est présent', await link.count() === 1);
  }

  const activeTab = page.locator('[data-nav-item="Dashboard"]');
  log('Dashboard est actif au chargement', (await activeTab.getAttribute('data-active')) === 'true');

  await page.click('[data-nav-item="Produits"]');
  await page.waitForURL('**/produits');
  log('cliquer Produits navigue vers /produits', page.url().endsWith('/produits'));
  log('la page Produits affiche le message de construction', await page.locator('text=Cette section arrive').count() === 1);

  await page.click('#user-menu-trigger');
  await page.click('#user-menu-signout');
  await page.waitForURL('**/login');
  log('Déconnexion redirige vers /login', page.url().endsWith('/login'));

  await page.goto(BASE + '/dashboard');
  await page.waitForURL('**/login');
  log('/dashboard redirige vers /login une fois déconnecté', page.url().endsWith('/login'));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task1-navshell.js`
Expected: FAIL — nav items/user menu don't exist yet.

- [ ] **Step 3: Create the placeholder panel component**

```tsx
// nextjs/components/dashboard/ComingSoonPanel.tsx
export function ComingSoonPanel({ title }: { title: string }) {
  return (
    <main className="p-8">
      <div className="rounded-card bg-card-bg p-12 text-center shadow-card">
        <h1 className="text-2xl font-bold text-text-heading">{title}</h1>
        <p className="mt-2 text-text-body">Cette section arrive dans un prochain chantier.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Create the 5 placeholder pages**

```tsx
// nextjs/app/(admin)/produits/page.tsx
import { ComingSoonPanel } from "@/components/dashboard/ComingSoonPanel";
export default function ProduitsPage() {
  return <ComingSoonPanel title="Produits" />;
}
```

Repeat identically for `commandes/page.tsx` (`CommandesPage` / "Commandes"), `clients/page.tsx` (`ClientsPage` / "Clients"), `attributs/page.tsx` (`AttributsPage` / "Attributs"), `promotions/page.tsx` (`PromotionsPage` / "Promotions").

- [ ] **Step 5: Create the user menu component**

```tsx
// nextjs/components/dashboard/UserMenu.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-gray-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary text-sm font-semibold text-white">
          A
        </span>
        <span className="text-left">
          <span className="block text-sm font-medium text-text-heading">Administrateur</span>
          <span className="block text-xs text-text-body">Super Admin</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-card bg-card-bg py-2 shadow-card">
          <span className="block cursor-not-allowed px-4 py-2 text-sm text-gray-400">
            Profil &amp; Paramètres
          </span>
          <button
            id="user-menu-signout"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full px-4 py-2 text-left text-sm text-status-red hover:bg-gray-50"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create the top nav component**

```tsx
// nextjs/components/dashboard/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Produits", href: "/produits" },
  { label: "Commandes", href: "/commandes" },
  { label: "Clients", href: "/clients" },
  { label: "Attributs", href: "/attributs" },
  { label: "Promotions", href: "/promotions" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-[72px] items-center justify-between border-b border-gray-100 bg-card-bg px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img src="/images/logo-shammah.svg" alt="Shammah" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-text-heading">SHAMMAH</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item={item.label}
                data-active={active ? "true" : "false"}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-accent-primary text-white" : "text-text-body hover:bg-gray-50")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-body">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <UserMenu />
      </div>
    </nav>
  );
}
```

- [ ] **Step 7: Wire `TopNav` into the admin layout**

```tsx
// nextjs/app/(admin)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/dashboard/TopNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-page-bg">
      <TopNav />
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Widen the middleware matcher to cover the new routes**

```typescript
// nextjs/middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/produits/:path*", "/commandes/:path*", "/clients/:path*", "/attributs/:path*", "/promotions/:path*"],
};
```

- [ ] **Step 9: Start the dev server and run the test**

```bash
cd nextjs && npm run dev
```
In another terminal: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task1-navshell.js`
Expected: all PASS.

- [ ] **Step 10: Commit**

```bash
git add nextjs/app/\(admin\) nextjs/middleware.ts nextjs/components/dashboard
git commit -m "feat(nextjs): add top nav shell, real sign-out, and section placeholders"
```

---

### Task 2: Dashboard metrics data layer

Pure, testable functions computing everything the dashboard needs from real Postgres data — no UI yet.

**Files:**
- Create: `nextjs/lib/dashboard-metrics.ts`
- Test: `nextjs/scripts/test-dashboard-metrics.js`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma` (existing).
- Produces (used by Tasks 3–7):
  - `type DateRangeKey = "7d" | "30d" | "all"`
  - `getDashboardMetrics(range: DateRangeKey, now?: Date): Promise<DashboardMetrics>` where `DashboardMetrics` has `kpis.{totalSales,revenue,activeClients,refundRequests}: { value: number; trendPercent: number | null }`, `successRate: { rate: number; successfulCount: number; revenue: number }`, `salesBreakdown: { successfulPct: number; pendingPct: number; cancelledPct: number }`, `topProducts: { title: string; amount: number; percentOfTotal: number }[]`
  - `type RevenueChartMode = "week" | "month"`
  - `getRevenueChartData(mode: RevenueChartMode, now?: Date): Promise<{ points: { label: string; revenue: number; orderCount: number }[]; trendPercent: number | null }>`
  - `type RecentOrder = { id: string; orderNumber: string; clientName: string; createdAt: Date; total: number; status: string; firstItemTitle: string; extraItemsCount: number; thumbnailUrl: string | null }`
  - `getRecentOrders(limit?: number): Promise<RecentOrder[]>`

- [ ] **Step 1: Write the failing test**

Create `nextjs/scripts/test-dashboard-metrics.js`:

```javascript
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  const now = new Date("2026-08-01T12:00:00Z");
  const category = await prisma.category.create({
    data: { name: "Test Metrics", slug: "test-metrics-" + Date.now() },
  });

  // 2 orders "yesterday" (in the 7d window), 1 order 10 days ago (previous 7d window), 1 cancelled
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "TESTM-1-" + Date.now(),
        clientName: "Client A", email: "a@test.com", address: "-", phone: "-",
        total: 100, paymentMethod: "test", status: "PAYEE",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: { create: [{ title: "Produit Test 1", price: 100, variantName: "", size: "", quantity: 1 }] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-2-" + Date.now(),
        clientName: "Client B", email: "b@test.com", address: "-", phone: "-",
        total: 50, paymentMethod: "test", status: "EXPEDIEE",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        items: { create: [{ title: "Produit Test 2", price: 50, variantName: "", size: "", quantity: 1 }] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-3-" + Date.now(),
        clientName: "Client C", email: "c@test.com", address: "-", phone: "-",
        total: 999, paymentMethod: "test", status: "ANNULEE",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: { create: [] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-4-" + Date.now(),
        clientName: "Client D", email: "d@test.com", address: "-", phone: "-",
        total: 20, paymentMethod: "test", status: "PAYEE",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        items: { create: [] },
      },
    }),
  ]);

  const { getDashboardMetrics, getRevenueChartData, getRecentOrders } = require("../lib/dashboard-metrics");

  const metrics = await getDashboardMetrics("7d", now);
  log("Ventes Totales (hors annulée) sur 7j = 2", metrics.kpis.totalSales.value === 2);
  log("Chiffre d'Affaires sur 7j = 150", metrics.kpis.revenue.value === 150);
  log("Demandes de remboursement sur 7j = 1", metrics.kpis.refundRequests.value === 1);
  log("tendance CA vs période précédente (20) = 650%", metrics.kpis.revenue.trendPercent === 650);

  const allTime = await getDashboardMetrics("all", now);
  log("badge de tendance masqué (null) pour range=all", allTime.kpis.revenue.trendPercent === null);

  const chart = await getRevenueChartData("week", now);
  log("le graphique semaine a 7 points", chart.points.length === 7);
  log("le CA total du graphique semaine = 150", chart.points.reduce((s, p) => s + p.revenue, 0) === 150);

  const recent = await getRecentOrders(5);
  log("commandes récentes limitées à 5 max", recent.length <= 5);
  log("commande sans variant a thumbnailUrl null", recent.find((o) => o.orderNumber.startsWith("TESTM-2"))?.thumbnailUrl === null);

  // cleanup
  await Promise.all(orders.map((o) => prisma.order.delete({ where: { id: o.id } })));
  await prisma.category.delete({ where: { id: category.id } });

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

`lib/dashboard-metrics.ts` uses the `@/lib/prisma` path alias (same convention as every other file in `nextjs/`), which plain `node` cannot resolve outside of Next's own bundler — use `tsx` (resolves both the TypeScript syntax and the tsconfig `paths` alias) to run this script, same as every other step in this task:

Run: `cd nextjs && npx tsx scripts/test-dashboard-metrics.js`
Expected: FAIL with "Cannot find module '../lib/dashboard-metrics'" (or similar — the module doesn't exist yet).

- [ ] **Step 3: Implement `lib/dashboard-metrics.ts`**

```typescript
// nextjs/lib/dashboard-metrics.ts
import { prisma } from "@/lib/prisma";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

export type DateRangeKey = "7d" | "30d" | "all";
export type RevenueChartMode = "week" | "month";

export type DashboardMetrics = {
  kpis: {
    totalSales: { value: number; trendPercent: number | null };
    revenue: { value: number; trendPercent: number | null };
    activeClients: { value: number; trendPercent: number | null };
    refundRequests: { value: number; trendPercent: number | null };
  };
  successRate: { rate: number; successfulCount: number; revenue: number };
  salesBreakdown: { successfulPct: number; pendingPct: number; cancelledPct: number };
  topProducts: { title: string; amount: number; percentOfTotal: number }[];
};

export type RevenueChartPoint = { label: string; revenue: number; orderCount: number };

export type RecentOrder = {
  id: string;
  orderNumber: string;
  clientName: string;
  createdAt: Date;
  total: number;
  status: string;
  firstItemTitle: string;
  extraItemsCount: number;
  thumbnailUrl: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function resolveRangeBounds(range: DateRangeKey, now: Date) {
  if (range === "all") {
    return { currentStart: null as Date | null, currentEnd: now, previousStart: null as Date | null, previousEnd: null as Date | null };
  }
  const days = range === "7d" ? 7 : 30;
  const currentStart = new Date(now.getTime() - days * DAY_MS);
  const previousEnd = currentStart;
  const previousStart = new Date(currentStart.getTime() - days * DAY_MS);
  return { currentStart, currentEnd: now, previousStart, previousEnd };
}

async function fetchOrdersInRange(start: Date | null, end: Date): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: start ? { createdAt: { gte: start, lte: end } } : { createdAt: { lte: end } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function computeKpis(orders: OrderWithItems[]) {
  const nonCancelled = orders.filter((o) => o.status !== "ANNULEE");
  return {
    totalSales: nonCancelled.length,
    revenue: nonCancelled.reduce((sum, o) => sum + Number(o.total), 0),
    activeClients: new Set(orders.map((o) => o.email || o.phone)).size,
    refundRequests: orders.length - nonCancelled.length,
  };
}

function computeSuccessRate(orders: OrderWithItems[]) {
  const eligible = orders.filter((o) => o.status !== "ANNULEE");
  const successful = orders.filter((o) => o.status === "PAYEE" || o.status === "EXPEDIEE");
  return {
    rate: eligible.length === 0 ? 0 : (successful.length / eligible.length) * 100,
    successfulCount: successful.length,
    revenue: successful.reduce((sum, o) => sum + Number(o.total), 0),
  };
}

function computeSalesBreakdown(orders: OrderWithItems[]) {
  const total = orders.length;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return {
    successfulPct: pct(orders.filter((o) => o.status === "PAYEE" || o.status === "EXPEDIEE").length),
    pendingPct: pct(orders.filter((o) => o.status === "EN_ATTENTE").length),
    cancelledPct: pct(orders.filter((o) => o.status === "ANNULEE").length),
  };
}

function computeTopProducts(orders: OrderWithItems[], limit = 4) {
  const totals = new Map<string, number>();
  let grandTotal = 0;
  for (const order of orders) {
    for (const item of order.items) {
      const amount = Number(item.price) * item.quantity;
      totals.set(item.title, (totals.get(item.title) || 0) + amount);
      grandTotal += amount;
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([title, amount]) => ({ title, amount, percentOfTotal: grandTotal === 0 ? 0 : (amount / grandTotal) * 100 }));
}

export async function getDashboardMetrics(range: DateRangeKey, now: Date = new Date()): Promise<DashboardMetrics> {
  const { currentStart, currentEnd, previousStart, previousEnd } = resolveRangeBounds(range, now);
  const currentOrders = await fetchOrdersInRange(currentStart, currentEnd);
  const previousOrders = previousStart ? await fetchOrdersInRange(previousStart, previousEnd!) : [];

  const current = computeKpis(currentOrders);
  const previous = computeKpis(previousOrders);

  return {
    kpis: {
      totalSales: { value: current.totalSales, trendPercent: trendPercent(current.totalSales, previous.totalSales) },
      revenue: { value: current.revenue, trendPercent: trendPercent(current.revenue, previous.revenue) },
      activeClients: { value: current.activeClients, trendPercent: trendPercent(current.activeClients, previous.activeClients) },
      refundRequests: { value: current.refundRequests, trendPercent: trendPercent(current.refundRequests, previous.refundRequests) },
    },
    successRate: computeSuccessRate(currentOrders),
    salesBreakdown: computeSalesBreakdown(currentOrders),
    topProducts: computeTopProducts(currentOrders),
  };
}

export async function getRevenueChartData(mode: RevenueChartMode, now: Date = new Date()) {
  const bucketCount = mode === "week" ? 7 : 5;
  const bucketMs = mode === "week" ? DAY_MS : 7 * DAY_MS;

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getTime() - bucketCount * bucketMs);
  const previousStart = new Date(start.getTime() - bucketCount * bucketMs);

  const orders = (await fetchOrdersInRange(previousStart, end)).filter((o) => o.status !== "ANNULEE");

  const points: RevenueChartPoint[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(start.getTime() + i * bucketMs);
    const bucketEnd = new Date(bucketStart.getTime() + bucketMs);
    const bucketOrders = orders.filter((o) => o.createdAt >= bucketStart && o.createdAt < bucketEnd);
    points.push({
      label: mode === "week" ? WEEKDAY_LABELS[bucketStart.getDay()] : "S" + (i + 1),
      revenue: bucketOrders.reduce((s, o) => s + Number(o.total), 0),
      orderCount: bucketOrders.length,
    });
  }

  const previousRevenue = orders
    .filter((o) => o.createdAt < start)
    .reduce((s, o) => s + Number(o.total), 0);
  const currentRevenue = points.reduce((s, p) => s + p.revenue, 0);

  return { points, trendPercent: trendPercent(currentRevenue, previousRevenue) };
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: {
        include: { variant: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      },
    },
  });

  return orders.map((order) => {
    const firstItem = order.items[0];
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      createdAt: order.createdAt,
      total: Number(order.total),
      status: order.status,
      firstItemTitle: firstItem?.title ?? "—",
      extraItemsCount: Math.max(order.items.length - 1, 0),
      thumbnailUrl: firstItem?.variant?.images[0]?.url ?? null,
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd nextjs && npx tsx scripts/test-dashboard-metrics.js`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add nextjs/lib/dashboard-metrics.ts nextjs/scripts/test-dashboard-metrics.js
git commit -m "feat(nextjs): add dashboard-metrics data layer with real Postgres queries"
```

---

### Task 3: Dashboard page shell, KPI cards, date-range selector

**Files:**
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Create: `nextjs/components/dashboard/DateRangeSelect.tsx`
- Create: `nextjs/components/dashboard/KpiCard.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task3-kpis.js`

**Interfaces:**
- Consumes: `getDashboardMetrics` from Task 2.
- Produces: `KpiCard` props `{ id: string; title: string; value: string; trendPercent: number | null; icon: React.ReactNode }` (used as-is by Tasks 4-7, no changes needed later).

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task3-kpis.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log('en-tête de bienvenue présent', await page.locator('text=Bonjour, Administrateur').count() === 1);

  const kpiIds = ['kpi-total-sales', 'kpi-revenue', 'kpi-active-clients', 'kpi-refund-requests'];
  for (const id of kpiIds) {
    log('la carte KPI #' + id + ' est présente', await page.locator('#' + id).count() === 1);
  }

  const revenueBefore = await page.locator('#kpi-revenue [data-kpi-value]').innerText();

  await page.selectOption('#date-range-select', 'all');
  await page.waitForURL('**/dashboard?range=all');
  const revenueAfter = await page.locator('#kpi-revenue [data-kpi-value]').innerText();
  log("changer la plage de dates recharge les KPI (l'URL reflète le choix)", page.url().includes('range=all'));
  log('le badge de tendance est masqué pour "Tout"', await page.locator('#kpi-revenue [data-trend-badge]').count() === 0);

  console.log('INFO - CA 7j: ' + revenueBefore + ', CA tout: ' + revenueAfter);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task3-kpis.js`
Expected: FAIL — dashboard page still shows the Plan A placeholder text, no KPI cards or date-range select exist.

- [ ] **Step 3: Create `KpiCard`**

```tsx
// nextjs/components/dashboard/KpiCard.tsx
export function KpiCard({
  id,
  title,
  value,
  trendPercent,
  icon,
}: {
  id: string;
  title: string;
  value: string;
  trendPercent: number | null;
  icon: React.ReactNode;
}) {
  const positive = (trendPercent ?? 0) >= 0;
  return (
    <div id={id} className="rounded-card bg-card-bg p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
          {icon}
        </span>
        <span className="text-sm text-text-body">{title}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span data-kpi-value className="text-2xl font-extrabold text-text-heading">{value}</span>
        {trendPercent !== null && (
          <span
            data-trend-badge
            className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (positive ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")}
          >
            {positive ? "+" : ""}{trendPercent.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `DateRangeSelect`**

```tsx
// nextjs/components/dashboard/DateRangeSelect.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function DateRangeSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") || "7d";

  return (
    <select
      id="date-range-select"
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", e.target.value);
        router.push("/dashboard?" + params.toString());
      }}
      className="rounded-full border border-gray-200 bg-card-bg px-4 py-2 text-sm text-text-heading"
    >
      <option value="7d">7 derniers jours</option>
      <option value="30d">30 derniers jours</option>
      <option value="all">Tout</option>
    </select>
  );
}
```

- [ ] **Step 5: Rewrite the dashboard page as a Server Component**

```tsx
// nextjs/app/(admin)/dashboard/page.tsx
import { getDashboardMetrics, type DateRangeKey } from "@/lib/dashboard-metrics";
import { DateRangeSelect } from "@/components/dashboard/DateRangeSelect";
import { KpiCard } from "@/components/dashboard/KpiCard";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: DateRangeKey = rawRange === "30d" || rawRange === "all" ? rawRange : "7d";

  const metrics = await getDashboardMetrics(range);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Bonjour, Administrateur 👋</h1>
          <p className="mt-1 text-text-body">Gérez produits, commandes, clients et performance en un seul endroit.</p>
        </div>
        <DateRangeSelect />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          id="kpi-total-sales"
          title="Ventes Totales"
          value={String(metrics.kpis.totalSales.value)}
          trendPercent={metrics.kpis.totalSales.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KpiCard
          id="kpi-revenue"
          title="Chiffre d'Affaires"
          value={formatEUR(metrics.kpis.revenue.value)}
          trendPercent={metrics.kpis.revenue.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8V6m0 10v2" /></svg>}
        />
        <KpiCard
          id="kpi-active-clients"
          title="Clients Actifs"
          value={String(metrics.kpis.activeClients.value)}
          trendPercent={metrics.kpis.activeClients.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 100-8 4 4 0 000 8z" /></svg>}
        />
        <KpiCard
          id="kpi-refund-requests"
          title="Demandes de Remboursement"
          value={String(metrics.kpis.refundRequests.value)}
          trendPercent={metrics.kpis.refundRequests.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Run the dev server and the test**

```bash
cd nextjs && npm run dev
```
`node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task3-kpis.js`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add nextjs/app/\(admin\)/dashboard/page.tsx nextjs/components/dashboard/DateRangeSelect.tsx nextjs/components/dashboard/KpiCard.tsx
git commit -m "feat(nextjs): wire dashboard KPI cards and date-range filter to real data"
```

---

### Task 4: Revenue chart (hand-rolled SVG bars + tooltip + week/month toggle)

**Files:**
- Create: `nextjs/components/dashboard/RevenueChart.tsx`
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task4-revenuechart.js`

**Interfaces:**
- Consumes: `getRevenueChartData` from Task 2.
- Produces: `<RevenueChart points={...} trendPercent={...} mode={...} />` client component, self-contained (owns its own week/month URL state the same way `DateRangeSelect` does).

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task4-revenuechart.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log('le graphique CA est présent', await page.locator('#revenue-chart').count() === 1);
  log('7 barres en mode semaine par défaut', await page.locator('#revenue-chart [data-chart-bar]').count() === 7);

  await page.click('#revenue-chart-mode-month');
  await page.waitForURL('**chart=month**');
  log('bascule vers le mode mois change le nombre de barres', await page.locator('#revenue-chart [data-chart-bar]').count() === 5);

  const firstBar = page.locator('#revenue-chart [data-chart-bar]').first();
  await firstBar.hover();
  log('le survol affiche un tooltip', await page.locator('#revenue-chart-tooltip').isVisible());

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task4-revenuechart.js`
Expected: FAIL — `#revenue-chart` doesn't exist yet.

- [ ] **Step 3: Create `RevenueChart`**

```tsx
// nextjs/components/dashboard/RevenueChart.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Point = { label: string; revenue: number; orderCount: number };

export function RevenueChart({
  points,
  trendPercent,
  mode,
}: {
  points: Point[];
  trendPercent: number | null;
  mode: "week" | "month";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(...points.map((p) => p.revenue), 1);

  function setMode(next: "week" | "month") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("chart", next);
    router.push("/dashboard?" + params.toString());
  }

  return (
    <div id="revenue-chart" className="relative rounded-card bg-card-bg p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-heading">Chiffre d&apos;Affaires</h2>
        <div className="flex items-center gap-2">
          {trendPercent !== null && (
            <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (trendPercent >= 0 ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")}>
              {trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}%
            </span>
          )}
          <button id="revenue-chart-mode-week" onClick={() => setMode("week")} className={"rounded-full px-3 py-1 text-xs font-medium " + (mode === "week" ? "bg-accent-primary text-white" : "bg-gray-50 text-text-body")}>Semaine</button>
          <button id="revenue-chart-mode-month" onClick={() => setMode("month")} className={"rounded-full px-3 py-1 text-xs font-medium " + (mode === "month" ? "bg-accent-primary text-white" : "bg-gray-50 text-text-body")}>Mois</button>
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-3">
        {points.map((p, i) => (
          <div
            key={i}
            data-chart-bar
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div
              className="w-full rounded-t-md bg-accent-primary/80 transition-all"
              style={{ height: Math.max((p.revenue / max) * 128, 4) + "px" }}
            />
            <span className="text-xs text-text-body">{p.label}</span>
          </div>
        ))}
      </div>

      {hovered !== null && (
        <div
          id="revenue-chart-tooltip"
          className="absolute rounded-lg bg-text-heading px-3 py-2 text-xs text-white shadow-card"
          style={{ top: 56, left: `calc(${(hovered / points.length) * 100}% + 12px)` }}
        >
          <div className="font-semibold">{points[hovered].label}</div>
          <div>{points[hovered].orderCount} commande{points[hovered].orderCount !== 1 ? "s" : ""}</div>
          <div>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(points[hovered].revenue)}</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire it into the dashboard page**

In `nextjs/app/(admin)/dashboard/page.tsx`, add the import and read the `chart` search param alongside `range`:

```tsx
import { getDashboardMetrics, getRevenueChartData, type DateRangeKey } from "@/lib/dashboard-metrics";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
```

```tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; chart?: string }>;
}) {
  const { range: rawRange, chart: rawChart } = await searchParams;
  const range: DateRangeKey = rawRange === "30d" || rawRange === "all" ? rawRange : "7d";
  const chartMode: "week" | "month" = rawChart === "month" ? "month" : "week";

  const [metrics, revenueChart] = await Promise.all([
    getDashboardMetrics(range),
    getRevenueChartData(chartMode),
  ]);
```

Add after the KPI grid, still inside `<main>`:

```tsx
      <div className="mt-6">
        <RevenueChart points={revenueChart.points} trendPercent={revenueChart.trendPercent} mode={chartMode} />
      </div>
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task4-revenuechart.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/dashboard/RevenueChart.tsx "nextjs/app/(admin)/dashboard/page.tsx"
git commit -m "feat(nextjs): add hand-rolled revenue bar chart with tooltip and week/month toggle"
```

---

### Task 5: Success-rate gauge + mini stat cards

**Files:**
- Create: `nextjs/components/dashboard/SuccessGauge.tsx`
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task5-gauge.js`

**Interfaces:**
- Consumes: `metrics.successRate` from Task 2/3.
- Produces: `<SuccessGauge rate={...} successfulCount={...} revenue={...} />`.

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task5-gauge.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log('la jauge de taux de réussite est présente', await page.locator('#success-gauge').count() === 1);
  log('la mini-carte Ventes est présente', await page.locator('#success-gauge-sales-mini').count() === 1);
  log('la mini-carte Chiffre d\'Affaires est présente', await page.locator('#success-gauge-revenue-mini').count() === 1);

  const rateText = await page.locator('#success-gauge [data-gauge-rate]').innerText();
  log('la jauge affiche un pourcentage', /%$/.test(rateText.trim()));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task5-gauge.js`
Expected: FAIL — `#success-gauge` doesn't exist yet.

- [ ] **Step 3: Create `SuccessGauge`**

```tsx
// nextjs/components/dashboard/SuccessGauge.tsx
function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function SuccessGauge({
  rate,
  successfulCount,
  revenue,
}: {
  rate: number;
  successfulCount: number;
  revenue: number;
}) {
  const segments = 12;
  const filledSegments = Math.round((rate / 100) * segments);

  return (
    <div id="success-gauge" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Taux de Réussite</h2>

      <svg width="180" height="100" viewBox="0 0 180 100" className="mx-auto mt-4">
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (Math.PI * i) / (segments - 1);
          const x1 = 90 - 70 * Math.cos(angle);
          const y1 = 95 - 70 * Math.sin(angle);
          const x2 = 90 - 85 * Math.cos(angle);
          const y2 = 95 - 85 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i < filledSegments ? "var(--color-accent-primary)" : "#E5E7EB"}
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="-mt-8 text-center">
        <span data-gauge-rate className="text-2xl font-extrabold text-text-heading">{rate.toFixed(0)}%</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div id="success-gauge-sales-mini" className="rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-text-body">Ventes</div>
          <div className="text-lg font-bold text-text-heading">{successfulCount}</div>
        </div>
        <div id="success-gauge-revenue-mini" className="rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-text-body">Chiffre d&apos;Affaires</div>
          <div className="text-lg font-bold text-text-heading">{formatEUR(revenue)}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into the dashboard page**

Add import `import { SuccessGauge } from "@/components/dashboard/SuccessGauge";` and, after the revenue chart block, add:

```tsx
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SuccessGauge
          rate={metrics.successRate.rate}
          successfulCount={metrics.successRate.successfulCount}
          revenue={metrics.successRate.revenue}
        />
      </div>
```

(Tasks 6 and 7 will add siblings inside this same grid.)

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task5-gauge.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/dashboard/SuccessGauge.tsx "nextjs/app/(admin)/dashboard/page.tsx"
git commit -m "feat(nextjs): add success-rate radial gauge with mini stat cards"
```

---

### Task 6: Recent orders table

**Files:**
- Create: `nextjs/components/dashboard/RecentOrdersTable.tsx`
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task6-recentorders.js`

**Interfaces:**
- Consumes: `getRecentOrders` from Task 2.
- Produces: `<RecentOrdersTable orders={...} />`.

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task6-recentorders.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log('le tableau des commandes récentes est présent', await page.locator('#recent-orders-table').count() === 1);
  const rowCount = await page.locator('#recent-orders-table [data-order-row]').count();
  log('au maximum 5 lignes affichées', rowCount <= 5 && rowCount > 0);
  log('le statut est un badge non cliquable (pas de <select>/<button>)', await page.locator('#recent-orders-table [data-order-row] select, #recent-orders-table [data-order-row] button').count() === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task6-recentorders.js`
Expected: FAIL — `#recent-orders-table` doesn't exist yet.

- [ ] **Step 3: Create `RecentOrdersTable`**

```tsx
// nextjs/components/dashboard/RecentOrdersTable.tsx
import type { RecentOrder } from "@/lib/dashboard-metrics";

const STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  EXPEDIEE: "Expédiée",
  ANNULEE: "Annulée",
};
const STATUS_CLASS: Record<string, string> = {
  EN_ATTENTE: "bg-status-amber/10 text-status-amber",
  PAYEE: "bg-status-blue/10 text-status-blue",
  EXPEDIEE: "bg-status-green/10 text-status-green",
  ANNULEE: "bg-status-red/10 text-status-red",
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <div id="recent-orders-table" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Commandes Récentes</h2>
      <div className="mt-4 divide-y divide-gray-100">
        {orders.length === 0 && <p className="py-4 text-sm text-text-body">Aucune commande pour le moment.</p>}
        {orders.map((order) => (
          <div key={order.id} data-order-row className="flex items-center gap-3 py-3">
            {order.thumbnailUrl ? (
              <img src={order.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
                {order.firstItemTitle.charAt(0)}
              </span>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-text-heading">
                {order.firstItemTitle}
                {order.extraItemsCount > 0 && <span className="text-text-body"> +{order.extraItemsCount} autres articles</span>}
              </div>
              <div className="text-xs text-text-body">{order.clientName} · {order.createdAt.toLocaleDateString("fr-FR")}</div>
            </div>
            <div className="text-sm font-semibold text-text-heading">{formatEUR(order.total)}</div>
            <span className={"rounded-full px-2 py-1 text-xs font-medium " + STATUS_CLASS[order.status]}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into the dashboard page**

Add `import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";` and `getRecentOrders` to the `dashboard-metrics` import. Fetch it alongside the other data:

```tsx
  const [metrics, revenueChart, recentOrders] = await Promise.all([
    getDashboardMetrics(range),
    getRevenueChartData(chartMode),
    getRecentOrders(5),
  ]);
```

Add inside the grid started in Task 5, as a sibling of `<SuccessGauge>` spanning the remaining columns:

```tsx
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task6-recentorders.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/dashboard/RecentOrdersTable.tsx "nextjs/app/(admin)/dashboard/page.tsx"
git commit -m "feat(nextjs): add read-only recent orders table with graceful missing-thumbnail fallback"
```

---

### Task 7: Sales overview + top products

**Files:**
- Create: `nextjs/components/dashboard/SalesOverview.tsx`
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task7-salesoverview.js`

**Interfaces:**
- Consumes: `metrics.salesBreakdown` and `metrics.topProducts` from Task 2/3.
- Produces: `<SalesOverview breakdown={...} topProducts={...} />`.

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task7-salesoverview.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log("l'aperçu des ventes est présent", await page.locator('#sales-overview').count() === 1);
  log('la légende a 3 catégories', await page.locator('#sales-overview [data-legend-item]').count() === 3);
  log('le tableau des produits les plus vendus est présent', await page.locator('#sales-overview-top-products [data-top-product-row]').count() > 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task7-salesoverview.js`
Expected: FAIL — `#sales-overview` doesn't exist yet.

- [ ] **Step 3: Create `SalesOverview`**

```tsx
// nextjs/components/dashboard/SalesOverview.tsx
function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function SalesOverview({
  breakdown,
  topProducts,
}: {
  breakdown: { successfulPct: number; pendingPct: number; cancelledPct: number };
  topProducts: { title: string; amount: number; percentOfTotal: number }[];
}) {
  const legend = [
    { label: "Réussies", pct: breakdown.successfulPct, colorClass: "bg-status-green" },
    { label: "En attente", pct: breakdown.pendingPct, colorClass: "bg-status-amber" },
    { label: "Annulées", pct: breakdown.cancelledPct, colorClass: "bg-status-red" },
  ];

  const segments = 50;

  return (
    <div id="sales-overview" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Aperçu des Ventes</h2>

      <div className="mt-4 flex gap-4 text-xs text-text-body">
        {legend.map((item) => (
          <span key={item.label} data-legend-item className="flex items-center gap-1.5">
            <span className={"h-2 w-2 rounded-full " + item.colorClass} />
            {item.label} ({item.pct.toFixed(0)}%)
          </span>
        ))}
      </div>

      <div className="mt-3 flex h-8 items-end gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const position = (i / segments) * 100;
          const colorClass =
            position < legend[0].pct
              ? legend[0].colorClass
              : position < legend[0].pct + legend[1].pct
              ? legend[1].colorClass
              : legend[2].colorClass;
          return <span key={i} className={"h-full w-1 rounded-sm " + colorClass} />;
        })}
      </div>

      <div id="sales-overview-top-products" className="mt-6">
        <h3 className="text-sm font-medium text-text-body">Produits les plus vendus</h3>
        <div className="mt-2 divide-y divide-gray-100">
          {topProducts.length === 0 && <p className="py-3 text-sm text-text-body">Aucune vente sur cette période.</p>}
          {topProducts.map((product) => (
            <div key={product.title} data-top-product-row className="flex items-center justify-between py-2">
              <span className="text-sm text-text-heading">{product.title}</span>
              <span className="text-xs text-text-body">{product.percentOfTotal.toFixed(0)}% · {formatEUR(product.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into the dashboard page**

Add `import { SalesOverview } from "@/components/dashboard/SalesOverview";` and add as a sibling in the grid from Task 5/6:

```tsx
        <div className="lg:col-span-3">
          <SalesOverview breakdown={metrics.salesBreakdown} topProducts={metrics.topProducts} />
        </div>
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task7-salesoverview.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/dashboard/SalesOverview.tsx "nextjs/app/(admin)/dashboard/page.tsx"
git commit -m "feat(nextjs): add sales overview breakdown and top-products table"
```

---

### Task 8: CSV export button + empty states + full end-to-end verification

**Files:**
- Create: `nextjs/components/dashboard/ExportReportButton.tsx`
- Modify: `nextjs/app/(admin)/dashboard/page.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task8-export-and-e2e.js`

**Interfaces:**
- Consumes: `metrics` and `recentOrders` already fetched in the page (passed as props, no new fetching).

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task8-export-and-e2e.js
const { chromium } = require('playwright');
const { loginAsAdmin } = require('./test-utils-nextjs-login');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label);
    if (!cond) ok = false;
  };

  await loginAsAdmin(page);

  log("le bouton d'export est présent", await page.locator('#export-report-btn').count() === 1);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#export-report-btn'),
  ]);
  log('cliquer sur Exporter le rapport déclenche un téléchargement', download.suggestedFilename().startsWith('rapport-shammah-'));

  // date range with certainly zero orders: the demo catalog's 4 orders are all recent, so a fixed
  // historical window (far in the past) exercises the empty state.
  await page.goto('http://localhost:3000/dashboard?range=30d');
  log('le dashboard se charge sans erreur avec des données réelles', await page.locator('#kpi-revenue').count() === 1);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task8-export-and-e2e.js`
Expected: FAIL — `#export-report-btn` doesn't exist yet.

- [ ] **Step 3: Create `ExportReportButton`**

```tsx
// nextjs/components/dashboard/ExportReportButton.tsx
"use client";

import type { DashboardMetrics, RecentOrder } from "@/lib/dashboard-metrics";

export function ExportReportButton({
  metrics,
  recentOrders,
}: {
  metrics: DashboardMetrics;
  recentOrders: RecentOrder[];
}) {
  function handleExport() {
    const lines = [
      "Indicateur,Valeur",
      "Ventes Totales," + metrics.kpis.totalSales.value,
      "Chiffre d'Affaires," + metrics.kpis.revenue.value.toFixed(2),
      "Clients Actifs," + metrics.kpis.activeClients.value,
      "Demandes de Remboursement," + metrics.kpis.refundRequests.value,
      "",
      "Commande,Client,Date,Montant,Statut",
      ...recentOrders.map((o) =>
        [o.orderNumber, o.clientName, o.createdAt.toLocaleDateString("fr-FR"), o.total.toFixed(2), o.status].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "rapport-shammah-" + today + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      id="export-report-btn"
      onClick={handleExport}
      className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover"
    >
      Exporter le rapport
    </button>
  );
}
```

- [ ] **Step 4: Wire it into the dashboard page header**

Add `import { ExportReportButton } from "@/components/dashboard/ExportReportButton";` and place it next to `<DateRangeSelect />`:

```tsx
        <div className="flex items-center gap-3">
          <DateRangeSelect />
          <ExportReportButton metrics={metrics} recentOrders={recentOrders} />
        </div>
```

(replacing the standalone `<DateRangeSelect />` in the header's flex row from Task 3).

- [ ] **Step 5: Run the dev server and the full test suite for this chantier**

```bash
cd nextjs && npm run dev
```
Run every test created in Tasks 1, 3–8 in sequence:
```bash
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task1-navshell.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task3-kpis.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task4-revenuechart.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task5-gauge.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task6-recentorders.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task7-salesoverview.js
node C:\tmp\shammah-checkout-tests\test-nextjs-dashboard-task8-export-and-e2e.js
```
Expected: all PASS across all 7 files.

- [ ] **Step 6: Manual visual comparison**

Open `http://localhost:3000/dashboard` in a real browser next to the vanilla admin's Bloom Phase 1 dashboard (`admin/index.html`, panel-dashboard) and confirm matching layout, colors, and card styles per spec §4/§7.

- [ ] **Step 7: Commit**

```bash
git add nextjs/components/dashboard/ExportReportButton.tsx "nextjs/app/(admin)/dashboard/page.tsx"
git commit -m "feat(nextjs): add CSV report export, completing the Plan B dashboard chantier"
```

---

## Self-Review Notes

- **Spec coverage:** §3 (nav) → Task 1. §5.1 (header/date-range/export) → Tasks 3, 8. §5.2 (KPIs) → Task 3. §5.3 (revenue chart) → Task 4. §5.4 (gauge) → Task 5. §5.5 (recent orders) → Task 6. §5.6 (sales overview/top products) → Task 7. §5.7 (empty states) → handled inline in each component (`orders.length === 0` branches) rather than a separate task, since each widget's empty state is specific to its own markup. §6 (no schema changes) → confirmed, no task touches `schema.prisma`. §2 (placeholder pages, no notifications, no real profile) → Task 1.
- **Type consistency:** `DateRangeKey`, `RevenueChartMode`, `DashboardMetrics`, `RecentOrder` are all defined once in Task 2 and imported (never redefined) by every later task.
- **Trend-hidden-on-zero-baseline rule** (added during spec self-review) is implemented once in `trendPercent()` (Task 2) and automatically covers both `range=all` and any real zero-order previous period — no per-widget special-casing needed.
