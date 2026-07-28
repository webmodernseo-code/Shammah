# Next.js Foundations (Plan A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a real, deployed Next.js + Tailwind project (in `nextjs/` at the repo root) backed by a real Neon Postgres database via Prisma, with working email/password admin authentication, Vercel Blob file storage, and a one-time migration that imports the current vanilla site's real product/category/promo/order data — with no dashboard UI beyond a protected empty shell (that's Plan B).

**Architecture:** A brand-new Next.js (App Router, TypeScript) project lives in `nextjs/`, fully separate from the existing vanilla site at the repo root, which keeps running untouched. Data flows: existing browser `localStorage` → JSON export (new button added to the *existing* vanilla admin) → Node.js migration script → Neon (via Prisma) + Vercel Blob (for images). Auth.js (NextAuth v5) with a Credentials provider protects everything under `nextjs/app/(admin)/`.

**Tech Stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, Prisma + Neon (Postgres), Auth.js v5 (next-auth beta) with bcryptjs, Vercel Blob (`@vercel/blob`), Playwright for E2E tests, plain Node scripts (same PASS/FAIL console convention as the rest of this project) for non-browser tests.

## Global Constraints

- New project lives entirely under `nextjs/` at the repo root — the existing vanilla site (`index.html`, `admin/`, `js/`, `css/`, `images/`) is untouched and keeps running independently until a future phase replaces it.
- TypeScript throughout the new project.
- `order_items` rows are a snapshot (copy) of title/price/variant/size at purchase time — never a live foreign-key join to current product data (spec §4).
- Product photos: multiple images per color variant, via a separate `product_images` table — never a single "main photo" field (spec §4).
- Pricing: one base price + base currency per product; multi-currency display is a configurable exchange-rate conversion, not per-market manual prices (spec §2).
- Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, admin credentials) are supplied by the user, who already has Neon and Vercel accounts — never fabricate or guess a real credential value. If a task needs one and it hasn't been provided, stop and ask (report `NEEDS_CONTEXT` if running under subagent-driven-development).
- Design tokens carried forward from the existing Bloom dashboard (spec §6, for future visual consistency in Plan B): `--accent-primary: #6C63FF`, `--accent-primary-hover: #5A52E0`, `--status-blue: #3B82F6`, `--status-amber: #F59E0B`, `--status-green: #22C55E`, `--status-red: #EF4444`, `--text-heading: #111827`, `--text-body: #6B7280`, `--page-bg: #F6F6FB`, `--card-bg: #FFFFFF`.
- Testing convention: Playwright for anything with an HTTP/browser surface, using the same `console.log('PASS - ...')`/`console.log('FAIL - ...')` style already used throughout this project (see `C:\tmp\shammah-checkout-tests\test-bloom-p1-task1-navshell.js` for the established pattern). Plain Node scripts with the identical PASS/FAIL convention for anything that doesn't need a browser (database round-trips, the migration script, the Blob upload helper).
- Icons: inline SVG only, matching the existing project-wide convention — no icon library, no raster icons.

---

### Task 1: Next.js + Tailwind scaffold, deployed to Vercel

Creates the new project and proves the full deploy pipeline works end-to-end before anything else is built on top of it.

**Files:**
- Create: `nextjs/` (via `create-next-app`)
- Modify: `nextjs/tailwind.config.ts` (Bloom design tokens)
- Create: `nextjs/app/page.tsx` (placeholder home page)
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-task1-scaffold.js`

**Interfaces:**
- Produces: a running Next.js dev server on `http://localhost:3000` and a live Vercel deployment URL, both serving `nextjs/app/page.tsx`.

- [ ] **Step 1: Scaffold the project**

From the repo root:
```bash
npx create-next-app@latest nextjs --typescript --tailwind --eslint --app --import-alias "@/*"
```
For any option not covered by these flags (src directory, Turbopack, etc.), accept the CLI's default when prompted. This creates `nextjs/package.json`, `nextjs/app/`, `nextjs/tailwind.config.ts`, `nextjs/tsconfig.json`, etc. If the generated project places `app/` under `nextjs/src/app/` instead of `nextjs/app/` (depends on the prompt answer), adjust every file path in this plan and Plan B accordingly — the rest of this plan assumes no `src/` directory.

- [ ] **Step 2: Add the Bloom design tokens to the Tailwind config**

Open `nextjs/tailwind.config.ts` and replace its `theme.extend` with:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "page-bg": "#F6F6FB",
        "card-bg": "#FFFFFF",
        "accent-primary": "#6C63FF",
        "accent-primary-hover": "#5A52E0",
        "status-blue": "#3B82F6",
        "status-amber": "#F59E0B",
        "status-green": "#22C55E",
        "status-red": "#EF4444",
        "text-heading": "#111827",
        "text-body": "#6B7280",
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(17, 24, 39, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Replace the default home page with a minimal placeholder**

Replace `nextjs/app/page.tsx` entirely with:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-bg">
      <div className="rounded-card bg-card-bg p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-heading">SHAMMAH</h1>
        <p className="text-text-body">Next.js foundation — under construction.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify the dev server locally**

```bash
cd nextjs && npm run dev
```
In another terminal, once it's up:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
```
Expected: `200`.

- [ ] **Step 5: Write and run the verification test**

Create `C:\tmp\shammah-checkout-tests\test-nextjs-task1-scaffold.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(BASE);

  log('la page affiche le titre SHAMMAH', await page.locator('h1').innerText().then(t => t.includes('SHAMMAH')));
  log('les classes Tailwind personnalisées sont appliquées (fond de page)', await page.evaluate(() => {
    const main = document.querySelector('main');
    return main && getComputedStyle(main).backgroundColor === 'rgb(246, 246, 251)';
  }));
  log('aucune erreur JS au chargement', errors.length === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

Run: `node "C:\tmp\shammah-checkout-tests\test-nextjs-task1-scaffold.js"`
Expected: all PASS.

- [ ] **Step 6: Deploy to Vercel and verify the live URL**

From `nextjs/`:
```bash
npx vercel --yes
```
This links/creates a Vercel project and deploys it (follow the CLI's prompts for project name if this is the first deploy). Note the deployment URL it prints, then verify:
```bash
curl -s -o /dev/null -w "%{http_code}\n" <deployment-url>
```
Expected: `200`. If you have the Vercel MCP tools available, you may use `mcp__claude_ai_Vercel__deploy_to_vercel` / `mcp__claude_ai_Vercel__get_deployment` instead of the CLI to confirm the deployment's status.

- [ ] **Step 7: Commit**

```bash
git add nextjs/ .gitignore
git commit -m "feat(nextjs): scaffold Next.js + Tailwind project with Bloom design tokens"
```
(Check `nextjs/.gitignore`, generated by `create-next-app`, already excludes `node_modules/`, `.next/`, `.env*.local` — do not commit those.)

---

### Task 2: Shared UI kit — Toast + ConfirmModal (React)

Ports the two foundational UI primitives every later dashboard feature depends on (matching `admin/js/ui-kit.js`'s `Toast`/`ConfirmModal` from the vanilla site), plus a temporary demo page so they're independently testable before any real feature uses them.

**Files:**
- Create: `nextjs/components/Toast.tsx`
- Create: `nextjs/components/ConfirmModal.tsx`
- Create: `nextjs/app/dev-uikit-test/page.tsx` (temporary — deleted in Task 4 once real pages exist to exercise these components)
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-task2-uikit.js`

**Interfaces:**
- Produces: `<ToastProvider>` (wraps the app, holds toast state) + `useToast()` hook returning `{ show(message: string, type?: "info" | "success" | "error") => void }`. `<ConfirmModal>` exported as a component with props `{ open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }`.

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-nextjs-task2-uikit.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());
  await page.goto(BASE + '/dev-uikit-test');

  await page.click('#trigger-toast');
  log('le toast apparaît avec le bon texte', await page.locator('.toast').innerText().then(t => t.includes('Ceci est un test')));

  await page.click('#trigger-confirm');
  log('le modal de confirmation apparaît', await page.locator('[role="dialog"]').isVisible());
  await page.click('[data-action="confirm"]');
  log('le modal se ferme après confirmation', await page.locator('[role="dialog"]').count() === 0);
  log('le résultat de la confirmation est affiché', await page.locator('#confirm-result').innerText().then(t => t.includes('true')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-nextjs-task2-uikit.js"`
Expected: FAIL — `/dev-uikit-test` doesn't exist (404).

- [ ] **Step 3: Create the Toast component**

Create `nextjs/components/Toast.tsx`:
```tsx
"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "info" | "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType; visible: boolean };

const ToastContext = createContext<{ show: (message: string, type?: ToastType) => void } | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, visible: false }]);

    requestAnimationFrame(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
    });

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 250);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "toast rounded-lg px-4 py-3 text-sm font-medium text-white shadow-card transition-all duration-200 " +
              (t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0") +
              " " +
              (t.type === "success" ? "bg-status-green" : t.type === "error" ? "bg-status-red" : "bg-text-heading")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
```

- [ ] **Step 4: Create the ConfirmModal component**

Create `nextjs/components/ConfirmModal.tsx`:
```tsx
"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ open, title, message, confirmLabel = "Confirmer", danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div role="dialog" className="w-full max-w-sm rounded-card bg-card-bg p-6 shadow-card">
        <h3 className="text-lg font-bold text-text-heading">{title}</h3>
        <p className="mt-2 text-sm text-text-body">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            data-action="cancel"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-heading"
          >
            Annuler
          </button>
          <button
            type="button"
            data-action="confirm"
            onClick={onConfirm}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium text-white " +
              (danger ? "bg-status-red" : "bg-accent-primary")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire `ToastProvider` into the root layout**

Modify `nextjs/app/layout.tsx` — wrap `{children}` with `<ToastProvider>`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "SHAMMAH",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create the temporary demo page**

Create `nextjs/app/dev-uikit-test/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function DevUikitTestPage() {
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string>("(none)");

  return (
    <main className="p-8">
      <button id="trigger-toast" onClick={() => show("Ceci est un test", "success")}>
        Trigger Toast
      </button>
      <button id="trigger-confirm" onClick={() => setConfirmOpen(true)}>
        Trigger Confirm
      </button>
      <p id="confirm-result">{confirmResult}</p>
      <ConfirmModal
        open={confirmOpen}
        title="Test"
        message="Confirmer ce test ?"
        onConfirm={() => { setConfirmResult("true"); setConfirmOpen(false); }}
        onCancel={() => { setConfirmResult("false"); setConfirmOpen(false); }}
      />
    </main>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Restart the dev server if needed (`cd nextjs && npm run dev`), then:
Run: `node "C:\tmp\shammah-checkout-tests\test-nextjs-task2-uikit.js"`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add nextjs/components/Toast.tsx nextjs/components/ConfirmModal.tsx nextjs/app/dev-uikit-test nextjs/app/layout.tsx
git commit -m "feat(nextjs): add Toast and ConfirmModal shared UI components"
```

---

### Task 3: Prisma schema + Neon connection

Establishes the real database schema and connection — every later task's data access depends on this.

**Files:**
- Create: `nextjs/prisma/schema.prisma`
- Create: `nextjs/lib/prisma.ts`
- Create: `nextjs/.env.example`
- Test: `nextjs/scripts/test-db-roundtrip.js`

**Interfaces:**
- Consumes: `DATABASE_URL` environment variable (Neon connection string, user-supplied).
- Produces: `import { prisma } from "@/lib/prisma"` — a singleton `PrismaClient` instance. Prisma models: `Category`, `Subcategory`, `Product`, `ProductVariant`, `ProductImage`, `ProductVariantStock`, `PromoCode`, `Order`, `OrderItem`, `AdminUser` (exact fields below).

- [ ] **Step 1: Install Prisma and initialize**

From `nextjs/`:
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init --datasource-provider postgresql
```
This creates `nextjs/prisma/schema.prisma` (starter) and `nextjs/.env` (git-ignored by the scaffold's `.gitignore`).

- [ ] **Step 2: Ask for the Neon connection string if not already provided**

If you don't already have the user's Neon `DATABASE_URL` for this project, stop and ask for it now (report `NEEDS_CONTEXT` if running under subagent-driven-development). Do not proceed with a fabricated or placeholder connection string. Once provided, set it in `nextjs/.env`:
```
DATABASE_URL="<the real Neon connection string, with ?sslmode=require>"
```

- [ ] **Step 3: Write the complete schema**

Replace `nextjs/prisma/schema.prisma` entirely with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id            String         @id @default(cuid())
  name          String
  slug          String         @unique
  subcategories Subcategory[]
  products      Product[]
  createdAt     DateTime       @default(now())
}

model Subcategory {
  id         String    @id @default(cuid())
  name       String
  slug       String
  category   Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  products   Product[]
  createdAt  DateTime  @default(now())

  @@unique([categoryId, slug])
}

model Product {
  id            String        @id @default(cuid())
  title         String
  slug          String        @unique
  description   String        @default("")
  basePrice     Decimal       @db.Decimal(10, 2)
  baseCurrency  String        @default("EUR")
  category      Category      @relation(fields: [categoryId], references: [id])
  categoryId    String
  subcategory   Subcategory?  @relation(fields: [subcategoryId], references: [id])
  subcategoryId String?
  variants      ProductVariant[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model ProductVariant {
  id         String                @id @default(cuid())
  product    Product               @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId  String
  colorName  String
  colorHex   String
  images     ProductImage[]
  stock      ProductVariantStock[]
  orderItems OrderItem[]
}

model ProductImage {
  id        String         @id @default(cuid())
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId String
  url       String
  sortOrder Int            @default(0)
}

model ProductVariantStock {
  id        String         @id @default(cuid())
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId String
  size      String
  quantity  Int            @default(0)

  @@unique([variantId, size])
}

model PromoCode {
  id           String    @id @default(cuid())
  code         String    @unique
  discountType String
  discountValue Decimal  @db.Decimal(10, 2)
  active       Boolean   @default(true)
  expiresAt    DateTime?
  createdAt    DateTime  @default(now())
}

enum OrderStatus {
  EN_ATTENTE
  PAYEE
  EXPEDIEE
  ANNULEE
}

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  clientName    String
  email         String
  address       String
  phone         String
  total         Decimal     @db.Decimal(10, 2)
  paymentMethod String
  status        OrderStatus @default(EN_ATTENTE)
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id          String          @id @default(cuid())
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  // Snapshot fields — copied at purchase time, never a live join to current product data.
  title       String
  price       Decimal         @db.Decimal(10, 2)
  variantName String
  size        String
  quantity    Int
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  variantId   String?
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

Note: `OrderItem.variantId` is an optional pointer back to the current variant (nice-to-have, for a future "view this product" link), but `title`/`price`/`variantName`/`size`/`quantity` are the authoritative snapshot and must never be overwritten from live product data after creation.

- [ ] **Step 4: Run the migration against the real Neon database**

```bash
cd nextjs && npx prisma migrate dev --name init
```
Expected: Prisma reports the migration applied successfully and generates the client.

- [ ] **Step 5: Create the Prisma client singleton**

Create `nextjs/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Add `.env.example`**

Create `nextjs/.env.example`:
```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="vercel-blob-token-here"
```

- [ ] **Step 7: Write and run the round-trip test**

Create `nextjs/scripts/test-db-roundtrip.js`:
```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const category = await prisma.category.create({ data: { name: "Test Category", slug: "test-category-" + Date.now() } });
  log("la catégorie de test est créée avec un id", !!category.id);

  const fetched = await prisma.category.findUnique({ where: { id: category.id } });
  log("la catégorie relue correspond au nom créé", fetched?.name === "Test Category");

  await prisma.category.delete({ where: { id: category.id } });
  const afterDelete = await prisma.category.findUnique({ where: { id: category.id } });
  log("la catégorie de test est bien supprimée", afterDelete === null);

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
```

Run: `node nextjs/scripts/test-db-roundtrip.js`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add nextjs/prisma nextjs/lib/prisma.ts nextjs/.env.example nextjs/scripts/test-db-roundtrip.js
git commit -m "feat(nextjs): add Prisma schema and Neon database connection"
```
(`nextjs/.env` itself must NOT be committed — verify it's covered by `nextjs/.gitignore`, which `create-next-app` already sets up to ignore `.env*.local`; since we used a plain `.env`, explicitly confirm it's also ignored, and add `.env` to `nextjs/.gitignore` if it isn't already.)

---

### Task 4: NextAuth email/password authentication + protected layout

**Files:**
- Create: `nextjs/lib/auth.ts`
- Create: `nextjs/app/api/auth/[...nextauth]/route.ts`
- Create: `nextjs/app/login/page.tsx`
- Create: `nextjs/middleware.ts`
- Create: `nextjs/app/(admin)/layout.tsx`
- Create: `nextjs/app/(admin)/dashboard/page.tsx` (placeholder — Plan B replaces its content)
- Create: `nextjs/scripts/seed-admin-user.js`
- Modify: `nextjs/app/page.tsx` (redirect to `/login`)
- Delete: `nextjs/app/dev-uikit-test/` (no longer needed — real protected pages now exist to exercise Toast/ConfirmModal)
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-task4-auth.js`

**Interfaces:**
- Consumes: `prisma` (Task 3), `AdminUser` model (Task 3).
- Produces: `/login` (public), `/dashboard` (protected, redirects to `/login` if unauthenticated), a `getServerSession`-compatible session available to Server Components under `app/(admin)/`.

- [ ] **Step 1: Write the failing test**

Create `C:\tmp\shammah-checkout-tests\test-nextjs-task4-auth.js`:
```javascript
const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const page = await browser.newContext().then(c => c.newPage());

  await page.goto(BASE + '/dashboard');
  await page.waitForURL('**/login**');
  log('accéder à /dashboard sans connexion redirige vers /login', page.url().includes('/login'));

  await page.fill('#email', 'wrong@example.com');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-submit');
  log('des identifiants invalides affichent une erreur', await page.locator('#login-error').isVisible());

  await page.fill('#email', process.env.TEST_ADMIN_EMAIL || 'admin@shammah.test');
  await page.fill('#password', process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard**');
  log('des identifiants valides redirigent vers /dashboard', page.url().includes('/dashboard'));
  log('la page dashboard affiche du contenu protégé', await page.locator('h1').innerText().then(t => t.length > 0));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node "C:\tmp\shammah-checkout-tests\test-nextjs-task4-auth.js"`
Expected: FAIL — `/login` doesn't exist yet (404).

- [ ] **Step 3: Install NextAuth and bcryptjs**

```bash
cd nextjs && npm install next-auth@beta bcryptjs
npm install --save-dev @types/bcryptjs
```

- [ ] **Step 4: Write the Auth.js configuration**

Create `nextjs/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
```

- [ ] **Step 5: Wire the Auth.js route handler**

Create `nextjs/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 6: Create the middleware protecting `/dashboard`**

Create `nextjs/middleware.ts`:
```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- [ ] **Step 7: Create the login page**

Create `nextjs/app/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page-bg">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card bg-card-bg p-8 shadow-card">
        <h1 className="text-xl font-bold text-text-heading">Connexion Administrateur</h1>
        <label className="mt-6 block text-sm font-medium text-text-body" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" />
        <label className="mt-4 block text-sm font-medium text-text-body" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" />
        {error && <p id="login-error" className="mt-3 text-sm text-status-red">{error}</p>}
        <button id="login-submit" type="submit" className="mt-6 w-full rounded-lg bg-accent-primary py-2 font-medium text-white">
          Se connecter
        </button>
      </form>
    </main>
  );
}
```

Note: `next-auth/react`'s `SessionProvider` isn't required for this single `signIn()` call to work client-side, but later pages reading the session client-side would need it. Since Task 4's dashboard placeholder reads the session server-side only (Step 9), this is deferred — Plan B should wrap the app in `<SessionProvider>` if/when a client component needs `useSession()`.

- [ ] **Step 8: Create the protected admin layout**

Create `nextjs/app/(admin)/layout.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return <div className="min-h-screen bg-page-bg">{children}</div>;
}
```

- [ ] **Step 9: Create the placeholder dashboard page**

Create `nextjs/app/(admin)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-text-heading">Dashboard</h1>
      <p className="text-text-body">Fondations posées — le contenu réel arrive dans une prochaine étape.</p>
    </main>
  );
}
```

- [ ] **Step 10: Update the home page to redirect to `/login`**

Replace `nextjs/app/page.tsx` entirely with:
```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
```

- [ ] **Step 11: Remove the temporary UI-kit test page**

```bash
rm -rf nextjs/app/dev-uikit-test
```

- [ ] **Step 12: Add `NEXTAUTH_SECRET` to `.env`**

If not already present, add to `nextjs/.env`:
```
NEXTAUTH_SECRET="<generate via: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 13: Seed the one admin user**

Create `nextjs/scripts/seed-admin-user.js`:
```javascript
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const email = process.env.TEST_ADMIN_EMAIL || "admin@shammah.test";
  const password = process.env.TEST_ADMIN_PASSWORD || "TestPassword123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("PASS - compte admin créé/mis à jour pour " + email);
  await prisma.$disconnect();
})();
```

Run: `node nextjs/scripts/seed-admin-user.js`

(This seeds a real admin account for testing. Ask the user whether they want the real production admin email/password used here instead of the test defaults — do not silently ship a hardcoded `TestPassword123!` as the real credential; if this is meant to be the real account, ask for the real email and either a real password to hash or confirm the user will reset it after first login.)

- [ ] **Step 14: Run test to verify it passes**

Restart the dev server (`cd nextjs && npm run dev`), then:
Run: `node "C:\tmp\shammah-checkout-tests\test-nextjs-task4-auth.js"`
Expected: all PASS.

- [ ] **Step 15: Commit**

```bash
git add nextjs/lib/auth.ts nextjs/app/api/auth nextjs/app/login nextjs/middleware.ts "nextjs/app/(admin)" nextjs/app/page.tsx nextjs/scripts/seed-admin-user.js
git rm -r nextjs/app/dev-uikit-test
git commit -m "feat(nextjs): add email/password admin authentication and protected dashboard route"
```

---

### Task 5: Vercel Blob upload helper

**Files:**
- Create: `nextjs/lib/blob.ts`
- Create: `nextjs/scripts/test-blob-upload.js`

**Interfaces:**
- Consumes: `BLOB_READ_WRITE_TOKEN` environment variable (user-supplied).
- Produces: `uploadImage(buffer: Buffer, filename: string) => Promise<{ url: string }>` and `deleteImage(url: string) => Promise<void>`, both exported from `nextjs/lib/blob.ts`. Later tasks (product photo upload, migration script) import these.

- [ ] **Step 1: Install the Vercel Blob SDK and dotenv**

```bash
cd nextjs && npm install @vercel/blob
npm install --save-dev dotenv
```
(`dotenv` is needed because standalone Node scripts run via plain `node script.js` — used throughout this task and Task 6 — don't get `.env` loaded automatically the way `next dev`/`next build` do.)

- [ ] **Step 2: Ask for the Blob token if not already provided**

If `BLOB_READ_WRITE_TOKEN` isn't already in `nextjs/.env`, stop and ask for it now (report `NEEDS_CONTEXT` if running under subagent-driven-development) — it's generated from the user's Vercel project's Storage tab. Add it to `nextjs/.env`:
```
BLOB_READ_WRITE_TOKEN="<the real token>"
```

- [ ] **Step 3: Write the upload/delete helper**

Create `nextjs/lib/blob.ts`:
```typescript
import { put, del } from "@vercel/blob";

export async function uploadImage(buffer: Buffer, filename: string): Promise<{ url: string }> {
  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url };
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
```

- [ ] **Step 4: Write and run the round-trip test**

Create `nextjs/scripts/test-blob-upload.js`:
```javascript
require("dotenv").config();
const { put, del } = require("@vercel/blob");

(async () => {
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const testContent = Buffer.from("test image content " + Date.now());
  const blob = await put("test-upload.txt", testContent, { access: "public", addRandomSuffix: true });
  log("le fichier de test est uploadé avec une URL", !!blob.url && blob.url.startsWith("https://"));

  const response = await fetch(blob.url);
  const fetchedContent = await response.text();
  log("le contenu uploadé est bien celui attendu une fois re-téléchargé", fetchedContent === testContent.toString());

  await del(blob.url);
  const afterDelete = await fetch(blob.url);
  log("le fichier de test est bien supprimé après del()", afterDelete.status === 404);

  process.exit(ok ? 0 : 1);
})();
```

Run: `node nextjs/scripts/test-blob-upload.js`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add nextjs/lib/blob.ts nextjs/scripts/test-blob-upload.js nextjs/package.json nextjs/package-lock.json
git commit -m "feat(nextjs): add Vercel Blob upload/delete helper"
```

---

### Task 6: Data export tool + migration script

Migrates the real, currently-live catalog data from the vanilla site's browser `localStorage` into Neon + Vercel Blob. Two parts: a small export button added to the *existing* vanilla admin (browser-only data needs a browser to read it out), and a Node.js import script that consumes the exported file.

**Files:**
- Modify: `admin/index.html` (add an "Exporter toutes les données (JSON)" button to the existing Configuration/Attributs panel)
- Modify: `admin/js/ui-kit.js` (wire the export button)
- Create: `nextjs/scripts/migrate-legacy-data.js`
- Test: `C:\tmp\shammah-checkout-tests\test-export-legacy-data.js` and `nextjs/scripts/test-migration.js`

**Interfaces:**
- Consumes: `uploadImage` (Task 5), `prisma` (Task 3).
- Produces: a downloaded `shammah-export-<date>.json` file (shape: `{ products: [...], categories: [...], promoCodes: [...], orders: [...] }`, mirroring `js/db.js`'s existing in-memory shapes) and a populated Neon database once the import script runs against it.

- [ ] **Step 1: Write the failing test for the export button**

Create `C:\tmp\shammah-checkout-tests\test-export-legacy-data.js`:
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

  const downloadPromise = page.waitForEvent('download');
  await page.click('#btn-export-legacy-data');
  const download = await downloadPromise;

  log('le fichier téléchargé est un .json', /\.json$/.test(download.suggestedFilename()));

  const path = await download.path();
  const fs = require('fs');
  const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
  log('le JSON exporté contient les clés attendues', ['products', 'categories', 'promoCodes', 'orders'].every(k => k in content));
  log('les produits exportés ont un titre et un prix', content.products.length === 0 || (content.products[0].title && content.products[0].price));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

A static server must be running at `http://127.0.0.1:8811` from the repo root (`npx --yes serve -l 8811 .` if not already running).
Run: `node "C:\tmp\shammah-checkout-tests\test-export-legacy-data.js"`
Expected: FAIL — `#btn-export-legacy-data` doesn't exist yet.

- [ ] **Step 3: Add the export button to the existing Attributs/Configuration panel**

In `admin/index.html`, inside `#panel-settings`'s `.panel-header` (the existing Configuration panel — read the current file to find the exact header block), add:
```html
<button class="btn-secondary" id="btn-export-legacy-data">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
  Exporter toutes les données (JSON)
</button>
```

- [ ] **Step 4: Wire the export button in `admin/js/ui-kit.js`**

Add, inside the existing IIFE:
```javascript
  function setupLegacyDataExport() {
    const btn = document.getElementById("btn-export-legacy-data");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const payload = {
        products: window.db.getProducts(),
        categories: window.db.getCategories(),
        promoCodes: window.db.getPromoCodes ? window.db.getPromoCodes() : [],
        orders: window.db.getOrders(),
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = "shammah-export-" + today + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      window.Toast.show("Export terminé.", "success");
    });
  }
```
And call it from the existing `DOMContentLoaded` listener, alongside the other `setup*()` calls already there.

(`window.db.getCategories()`, `.getProducts()`, `.getOrders()`, `.getPromoCodes()` are all confirmed existing methods on `js/db.js`'s `ShammahDB` class — lines 373, 401, 416, 452.)

- [ ] **Step 5: Run test to verify it passes**

Run: `node "C:\tmp\shammah-checkout-tests\test-export-legacy-data.js"`
Expected: all PASS.

- [ ] **Step 6: Commit the export button**

```bash
git add admin/index.html admin/js/ui-kit.js
git commit -m "feat(admin): add JSON export of all site data, for Next.js migration"
```

- [ ] **Step 7: Obtain the real export file**

Ask the user to open their live vanilla admin (the one with their real product catalog in `localStorage`, not necessarily this dev checkout's demo data), click the new export button, and provide the resulting `shammah-export-*.json` file. Save it to `nextjs/scripts/data/shammah-export.json` (create the `data/` directory; add `nextjs/scripts/data/` to `.gitignore` — this file contains the user's real business data and must never be committed).

- [ ] **Step 8: Write the migration script**

Create `nextjs/scripts/migrate-legacy-data.js`:
```javascript
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { put } = require("@vercel/blob");

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadLocalImage(relativePath) {
  const absolutePath = path.resolve(__dirname, "../../", relativePath.replace(/^\.\.\//, ""));
  if (!fs.existsSync(absolutePath)) {
    console.log("FAIL - image locale introuvable, ignorée: " + relativePath);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  const filename = path.basename(absolutePath);
  const blob = await put(filename, buffer, { access: "public", addRandomSuffix: true });
  return blob.url;
}

async function migrate() {
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const exportPath = path.join(__dirname, "data", "shammah-export.json");
  if (!fs.existsSync(exportPath)) {
    console.log("FAIL - fichier d'export introuvable: " + exportPath);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  const categoryIdMap = {};
  for (const cat of data.categories) {
    const created = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: { name: cat.name },
      create: { name: cat.name, slug: slugify(cat.name) },
    });
    categoryIdMap[cat.name] = created.id;

    for (const sub of cat.subcategories || []) {
      const createdSub = await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: created.id, slug: slugify(sub.name || sub) } },
        update: {},
        create: { name: sub.name || sub, slug: slugify(sub.name || sub), categoryId: created.id },
      });
      categoryIdMap[cat.name + "::" + (sub.name || sub)] = createdSub.id;
    }
  }
  log("catégories/sous-catégories migrées (" + data.categories.length + ")", true);

  let productCount = 0;
  for (const product of data.products) {
    const categoryId = categoryIdMap[product.category];
    if (!categoryId) {
      console.log("FAIL - catégorie introuvable pour le produit " + product.title + ", ignoré");
      ok = false;
      continue;
    }
    const subcategoryKey = product.category + "::" + product.subcategory;
    const subcategoryId = categoryIdMap[subcategoryKey] || null;

    const createdProduct = await prisma.product.create({
      data: {
        title: product.title,
        slug: slugify(product.title) + "-" + Math.random().toString(36).slice(2, 7),
        description: product.description || "",
        basePrice: product.price,
        baseCurrency: "EUR",
        categoryId,
        subcategoryId,
      },
    });

    for (const variant of product.variants || []) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          colorName: variant.name,
          colorHex: variant.color,
        },
      });

      const imagePaths = variant.images && variant.images.length ? variant.images : [variant.img];
      let sortOrder = 0;
      for (const imgPath of imagePaths) {
        const uploadedUrl = await uploadLocalImage(imgPath);
        if (uploadedUrl) {
          await prisma.productImage.create({
            data: { variantId: createdVariant.id, url: uploadedUrl, sortOrder: sortOrder++ },
          });
        }
      }

      for (const [size, quantity] of Object.entries(variant.stock || {})) {
        await prisma.productVariantStock.create({
          data: { variantId: createdVariant.id, size, quantity: Number(quantity) || 0 },
        });
      }
    }
    productCount++;
  }
  log("produits migrés (" + productCount + "/" + data.products.length + ")", productCount === data.products.length);

  let promoCount = 0;
  for (const promo of data.promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: {
        code: promo.code,
        discountType: promo.type || "percentage",
        discountValue: promo.value,
        active: promo.active !== false,
      },
    });
    promoCount++;
  }
  log("codes promo migrés (" + promoCount + ")", promoCount === data.promoCodes.length);

  const statusMap = {
    "En attente": "EN_ATTENTE",
    "Payée": "PAYEE",
    "Expédiée": "EXPEDIEE",
    "Annulée": "ANNULEE",
  };
  let orderCount = 0;
  for (const order of data.orders) {
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: order.id,
        clientName: order.client,
        email: order.email,
        address: order.address,
        phone: order.phone,
        total: order.total,
        paymentMethod: order.method,
        status: statusMap[order.status] || "EN_ATTENTE",
        createdAt: new Date(order.date.split("/").reverse().join("-")),
      },
    });

    for (const item of order.items || []) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          title: item.title,
          price: item.price,
          variantName: item.variant?.name || "",
          size: item.size || "",
          quantity: item.qty || 1,
        },
      });
    }
    orderCount++;
  }
  log("commandes migrées (" + orderCount + ")", orderCount === data.orders.length);

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

migrate();
```

- [ ] **Step 9: Run the migration against the real database**

```bash
node nextjs/scripts/migrate-legacy-data.js
```
Review the PASS/FAIL output line by line. Any FAIL (missing category, missing local image) must be investigated against the actual export file's content before considering this task done — do not ignore FAIL lines.

- [ ] **Step 10: Write and run a verification script confirming row counts in Neon**

Create `nextjs/scripts/test-migration.js`:
```javascript
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  const exportPath = path.join(__dirname, "data", "shammah-export.json");
  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  const productCountInDb = await prisma.product.count();
  log("le nombre de produits en base correspond à l'export (" + data.products.length + ")", productCountInDb === data.products.length);

  const orderCountInDb = await prisma.order.count();
  log("le nombre de commandes en base correspond à l'export (" + data.orders.length + ")", orderCountInDb === data.orders.length);

  const promoCountInDb = await prisma.promoCode.count();
  log("le nombre de codes promo en base correspond à l'export (" + data.promoCodes.length + ")", promoCountInDb === data.promoCodes.length);

  const sampleImage = await prisma.productImage.findFirst();
  log("au moins une image produit a une URL Vercel Blob valide", !!sampleImage && sampleImage.url.includes("blob.vercel-storage.com"));

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
```

Run: `node nextjs/scripts/test-migration.js`
Expected: all PASS.

- [ ] **Step 11: Add the export data file to `.gitignore` and commit the script**

Add to `nextjs/.gitignore` (if not already covered):
```
scripts/data/
```

```bash
git add nextjs/scripts/migrate-legacy-data.js nextjs/scripts/test-migration.js nextjs/.gitignore
git commit -m "feat(nextjs): add legacy data migration script (products, categories, promos, orders)"
```

---

## Self-Review Notes

**Spec coverage:** §3 (architecture: Next.js/Tailwind/Vercel/Neon/Prisma/Blob/auth) → Tasks 1, 3, 4, 5. §4 (schema, including the `order_items` snapshot rule and the `product_images` table) → Task 3. §5 (migration) → Task 6. §2's pricing decision (base price + base currency) → `Product.basePrice`/`baseCurrency` in Task 3's schema. Dashboard portage (spec §6) and hors-périmètre items (spec §7) are explicitly Plan B and are not duplicated here.

**Type consistency check:** `prisma` singleton from Task 3 is imported the same way (`import { prisma } from "@/lib/prisma"`) in Task 4's `auth.ts`. `uploadImage`/`deleteImage` from Task 5 are defined but Task 6's migration script uses the raw `put` call directly instead of importing `uploadImage` from `lib/blob.ts` — this is intentional, since the migration script runs as a standalone Node script outside the Next.js module resolution the `@/` import alias depends on; it duplicates the same `put(...)` call inline rather than importing the app's `lib/blob.ts`, which is an accepted, minor inconsistency for a one-time script (noted here rather than silently papered over).

**Placeholder scan:** no TBD/TODO left. Two explicit "ask the user" gates remain by design (Neon `DATABASE_URL` in Task 3, Blob token in Task 5, and the real export file in Task 6) — these are genuine external dependencies only the user can supply, not deferred implementation detail.
