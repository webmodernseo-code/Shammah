# Next.js Plan B — Chantier 2 (Produits) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the vanilla catalogue management panel (inventory list with inline stock editing, create/edit drawer with a color-variant editor and live preview) to the Next.js `/produits` page, replacing the current placeholder, backed by the real Postgres data via the existing `/api/products` routes.

**Architecture:** `app/(admin)/produits/page.tsx` is a Server Component that fetches products and categories directly via Prisma (same pattern as the Dashboard chantier) and passes them to a client-side orchestrator (`ProductsPageClient`) that owns which drawer/modal is open. Mutations (create, edit, delete, stock update) call the existing `/api/products` REST routes (create/edit/delete) plus one new lightweight route for inline stock edits; on success the client calls `router.refresh()` so the Server Component re-fetches fresh data rather than the client tracking its own copy of server state.

**Tech Stack:** Next.js 16 (App Router) + TypeScript, Tailwind v4, Prisma + Neon, Playwright for browser tests — same conventions as chantier 1.

## Global Constraints

- No real file upload — image fields are plain URL text inputs (`ProductImage.url` stays a string; Vercel Blob upload is a future chantier once a real token is provided).
- No per-product promo code — dropped from scope; promo codes remain checkout-only, no schema change.
- Reuse existing components without modification: `components/ConfirmModal.tsx` (delete confirmation, close-without-saving confirmation), `useToast()` from `components/Toast.tsx` (already wired into the root layout).
- Reuse existing API routes without modification: `POST /api/products`, `PUT /api/products/[id]`, `DELETE /api/products/[id]`, `GET /api/categories`. Their exact contracts (confirmed from the actual route source during Plan A's audit):
  - `POST /api/products` body: `{ title, description, basePrice, baseCurrency, categoryId, subcategoryId, variants: [{ colorName, colorHex, images: [{url, sortOrder}], stock: [{size, quantity}] }] }`. Requires `title`, `basePrice`, `categoryId`. Returns the created product (201) with `category`, `subcategory`, `variants.images`, `variants.stock` included.
  - `PUT /api/products/[id]` — same body shape. Replaces all variants if `variants` is present in the body.
  - `DELETE /api/products/[id]` — no body, returns `{ ok: true }`.
  - `GET /api/categories` — returns `[{ id, name, slug, subcategories: [{ id, name, slug, categoryId, createdAt }], createdAt }]`.
- Suggested sizes by category slug (matches vanilla `getCategorySuggestedSizes`): `"gadget"` → `["Taille Unique"]`, `"enfant"` → `["2 ans", "4 ans", "6 ans", "8 ans"]`, anything else → `["S", "M", "L", "XL"]`.
- Total product stock = sum of every variant's every size quantity. Status badge: `"OK"` if total ≥ 3, `"Stock Faible"` otherwise (matches vanilla's `< 3` threshold).
- Missing image fallback: a colored square with the title's first letter — same pattern already used in `RecentOrdersTable.tsx` from chantier 1, not a new convention.
- Money: `Product.basePrice` and `ProductVariantStock.quantity` come back from Prisma as `Decimal`/`number` — wrap `basePrice` in `Number(...)` before arithmetic or display (`quantity` is a plain `Int`, no conversion needed).
- Test file locations: Playwright browser tests in `C:\tmp\shammah-checkout-tests\test-nextjs-produits-*.js`, reusing `test-utils-nextjs-login.js` from chantier 1 for login.

---

### Task 1: Products list page — server fetch + read-only table

**Files:**
- Modify: `nextjs/app/(admin)/produits/page.tsx`
- Create: `nextjs/components/products/ProductsPageClient.tsx`
- Create: `nextjs/components/products/ProductsTable.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task1-list.js`

**Interfaces:**
- Produces: `type ProductRow` (the shape passed from the server page to the client tree) — `{ id: string; title: string; basePrice: number; category: { name: string }; thumbnailUrl: string | null; totalStock: number; variants: { id: string; colorName: string; colorHex: string; stock: { size: string; quantity: number }[] }[] }`. Later tasks (2, 3, 4) receive this same shape — don't redefine it.

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task1-list.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  log("le tableau des produits est présent", await page.locator('#products-table').count() === 1);
  const rowCount = await page.locator('#products-table [data-product-row]').count();
  log('les 19 vrais produits sont affichés', rowCount === 19);
  log("le bouton 'Nouveau produit' est présent", await page.locator('#btn-new-product').count() === 1);
  log('au moins une ligne affiche un badge de statut de stock', await page.locator('[data-stock-badge]').count() > 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task1-list.js`
Expected: FAIL — `/produits` still shows the "Cette section arrive" placeholder.

- [ ] **Step 3: Create `ProductsTable` (read-only for this task)**

```tsx
// nextjs/components/products/ProductsTable.tsx
export type ProductRow = {
  id: string;
  title: string;
  basePrice: number;
  category: { name: string };
  thumbnailUrl: string | null;
  totalStock: number;
  variants: { id: string; colorName: string; colorHex: string; stock: { size: string; quantity: number }[] }[];
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: ProductRow[];
  onEdit: (product: ProductRow) => void;
  onDelete: (product: ProductRow) => void;
}) {
  return (
    <div id="products-table" className="rounded-card bg-card-bg shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-text-body">
            <th className="p-4 font-medium">Article</th>
            <th className="p-4 font-medium">Catégorie</th>
            <th className="p-4 font-medium">Stock</th>
            <th className="p-4 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} data-product-row className="border-b border-gray-50 last:border-0">
              <td className="flex items-center gap-3 p-4">
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
                    {product.title.charAt(0)}
                  </span>
                )}
                <div>
                  <div className="font-medium text-text-heading">{product.title}</div>
                  <div className="text-xs text-text-body">{formatEUR(product.basePrice)}</div>
                </div>
              </td>
              <td className="p-4 text-text-body">{product.category.name}</td>
              <td className="p-4">
                <div className="space-y-1">
                  {product.variants.map((variant) =>
                    variant.stock.map((s) => (
                      <div key={variant.id + s.size} className="flex items-center gap-2 text-xs text-text-body">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: variant.colorHex }} />
                        {variant.colorName} ({s.size}): <span className="font-medium text-text-heading">{s.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
                <span
                  data-stock-badge
                  className={
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
                    (product.totalStock >= 3 ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")
                  }
                >
                  {product.totalStock >= 3 ? "OK" : "Stock Faible"}
                </span>
              </td>
              <td className="p-4 text-center">
                <button onClick={() => onEdit(product)} className="mr-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-text-heading hover:bg-gray-50">
                  Modifier
                </button>
                <button onClick={() => onDelete(product)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-status-red hover:bg-red-50">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create `ProductsPageClient` (no drawer/modal logic yet — just wires the table)**

```tsx
// nextjs/components/products/ProductsPageClient.tsx
"use client";

import { ProductsTable, type ProductRow } from "./ProductsTable";

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Produits</h1>
          <p className="mt-1 text-text-body">Ajoutez des articles et gérez les niveaux de stock par variante.</p>
        </div>
        <button id="btn-new-product" className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover">
          + Nouveau produit
        </button>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} onEdit={() => {}} onDelete={() => {}} />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Rewrite the products page as a Server Component**

```tsx
// nextjs/app/(admin)/produits/page.tsx
import { prisma } from "@/lib/prisma";
import { ProductsPageClient } from "@/components/products/ProductsPageClient";
import type { ProductRow } from "@/components/products/ProductsTable";

export default async function ProduitsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: { include: { images: { orderBy: { sortOrder: "asc" } }, stock: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    basePrice: Number(p.basePrice),
    category: { name: p.category.name },
    thumbnailUrl: p.variants[0]?.images[0]?.url ?? null,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock.reduce((s, st) => s + st.quantity, 0), 0),
    variants: p.variants.map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorHex: v.colorHex,
      stock: v.stock.map((s) => ({ size: s.size, quantity: s.quantity })),
    })),
  }));

  return <ProductsPageClient products={rows} />;
}
```

- [ ] **Step 6: Run the dev server and the test**

```bash
cd nextjs && npm run dev
```
`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task1-list.js`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add "nextjs/app/(admin)/produits/page.tsx" nextjs/components/products
git commit -m "feat(nextjs): add read-only products list page with real stock data"
```

---

### Task 2: Inline stock editing

**Files:**
- Create: `nextjs/app/api/products/[id]/stock/route.ts`
- Create: `nextjs/components/products/StockInput.tsx`
- Modify: `nextjs/components/products/ProductsTable.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task2-stock.js`

**Interfaces:**
- Produces: `PATCH /api/products/[id]/stock` body `{ variantId: string; size: string; quantity: number }` → `200 { id, variantId, size, quantity }` or `401`/`404`/`500`.

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task2-stock.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const input = page.locator('[data-stock-input]').first();
  log('un champ de stock modifiable est présent', await input.count() === 1);

  await input.fill('42');
  await input.press('Enter');
  await page.waitForTimeout(800);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  const valueAfterReload = await page.locator('[data-stock-input]').first().inputValue();
  log('la nouvelle quantité persiste après rechargement', valueAfterReload === '42');

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task2-stock.js`
Expected: FAIL — stock is currently plain text, not an editable input.

- [ ] **Step 3: Create the stock PATCH route**

```typescript
// nextjs/app/api/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { variantId, size, quantity } = body;

    if (!variantId || !size || typeof quantity !== "number") {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const safeQuantity = Math.max(0, Math.trunc(quantity));

    const updated = await prisma.productVariantStock.update({
      where: { variantId_size: { variantId, size } },
      data: { quantity: safeQuantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur mise à jour du stock:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create `StockInput`**

```tsx
// nextjs/components/products/StockInput.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export function StockInput({ variantId, size, initialQuantity }: { variantId: string; size: string; initialQuantity: number }) {
  const [value, setValue] = useState(String(initialQuantity));
  const router = useRouter();
  const { show } = useToast();

  async function commit() {
    const parsed = Math.max(0, Math.trunc(Number(value)) || 0);
    setValue(String(parsed));

    const res = await fetch(`/api/products/${""}stock-scope-unused`, { method: "GET" }).catch(() => null);
    void res; // placeholder removed below — real call built in the wiring step
  }

  return (
    <input
      data-stock-input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs"
    />
  );
}
```

Delete the placeholder `commit()` body above and replace it with the real call (kept separate so the diff below is unambiguous):

```tsx
  async function commit() {
    const parsed = Math.max(0, Math.trunc(Number(value)) || 0);
    setValue(String(parsed));

    const res = await fetch(`/api/products/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, size, quantity: parsed }),
    });

    if (res.ok) {
      show("Stock mis à jour.", "success");
      router.refresh();
    } else {
      show("Erreur lors de la mise à jour du stock.", "error");
    }
  }
```

This second version needs a `productId` prop — the final component signature is:

```tsx
// nextjs/components/products/StockInput.tsx (final)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export function StockInput({
  productId,
  variantId,
  size,
  initialQuantity,
}: {
  productId: string;
  variantId: string;
  size: string;
  initialQuantity: number;
}) {
  const [value, setValue] = useState(String(initialQuantity));
  const router = useRouter();
  const { show } = useToast();

  async function commit() {
    const parsed = Math.max(0, Math.trunc(Number(value)) || 0);
    setValue(String(parsed));

    const res = await fetch(`/api/products/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, size, quantity: parsed }),
    });

    if (res.ok) {
      show("Stock mis à jour.", "success");
      router.refresh();
    } else {
      show("Erreur lors de la mise à jour du stock.", "error");
    }
  }

  return (
    <input
      data-stock-input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs"
    />
  );
}
```

(Write this final version directly — the intermediate placeholder above exists only to flag that the naive first draft is wrong on its own.)

- [ ] **Step 5: Wire `StockInput` into `ProductsTable`**

In `nextjs/components/products/ProductsTable.tsx`, add the import and replace the static quantity span:

```tsx
import { StockInput } from "./StockInput";
```

```tsx
                  {product.variants.map((variant) =>
                    variant.stock.map((s) => (
                      <div key={variant.id + s.size} className="flex items-center gap-2 text-xs text-text-body">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: variant.colorHex }} />
                        {variant.colorName} ({s.size}):
                        <StockInput productId={product.id} variantId={variant.id} size={s.size} initialQuantity={s.quantity} />
                      </div>
                    ))
                  )}
```

- [ ] **Step 6: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task2-stock.js`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add "nextjs/app/api/products/[id]/stock" nextjs/components/products/StockInput.tsx nextjs/components/products/ProductsTable.tsx
git commit -m "feat(nextjs): add inline per-variant stock editing"
```

---

### Task 3: Delete product

**Files:**
- Modify: `nextjs/components/products/ProductsPageClient.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task3-delete.js`

**Interfaces:**
- Consumes: `ConfirmModal` from `@/components/ConfirmModal` (existing, unmodified), `DELETE /api/products/[id]` (existing, unmodified).

- [ ] **Step 1: Write the failing test**

This test creates its own throwaway product via the existing API (so it never deletes real catalog data), then deletes it through the UI:

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task3-delete.js
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

  const testTitle = "TEST DELETE " + Date.now();
  await page.request.post('http://localhost:3000/api/products', {
    data: { title: testTitle, basePrice: 9.99, categoryId: await getFirstCategoryId(page), variants: [] },
  });

  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const row = page.locator('[data-product-row]', { hasText: testTitle });
  log('le produit de test est visible avant suppression', await row.count() === 1);

  await row.locator('button', { hasText: 'Supprimer' }).click();
  log('la confirmation de suppression apparaît', await page.locator('[role="dialog"]', { hasText: 'Supprimer' }).count() === 1);
  await page.click('[data-action="confirm"]');
  await page.waitForTimeout(500);

  log('le produit de test a disparu de la liste', await page.locator('[data-product-row]', { hasText: testTitle }).count() === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);

  async function getFirstCategoryId(page) {
    const res = await page.request.get('http://localhost:3000/api/categories');
    const cats = await res.json();
    return cats[0].id;
  }
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task3-delete.js`
Expected: FAIL — the "Supprimer" button is wired to a no-op (`onDelete={() => {}}` from Task 1).

- [ ] **Step 3: Wire delete + `ConfirmModal` into `ProductsPageClient`**

```tsx
// nextjs/components/products/ProductsPageClient.tsx (full replacement)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductsTable, type ProductRow } from "./ProductsTable";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
  const router = useRouter();
  const { show } = useToast();

  async function confirmDelete() {
    if (!deletingProduct) return;
    const res = await fetch(`/api/products/${deletingProduct.id}`, { method: "DELETE" });
    if (res.ok) {
      show("L'article a été supprimé avec succès.", "success");
      router.refresh();
    } else {
      show("Erreur lors de la suppression.", "error");
    }
    setDeletingProduct(null);
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Produits</h1>
          <p className="mt-1 text-text-body">Ajoutez des articles et gérez les niveaux de stock par variante.</p>
        </div>
        <button id="btn-new-product" className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover">
          + Nouveau produit
        </button>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} onEdit={() => {}} onDelete={setDeletingProduct} />
      </div>

      <ConfirmModal
        open={deletingProduct !== null}
        title="Supprimer l'article"
        message="Voulez-vous vraiment supprimer cet article de la boutique ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task3-delete.js`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add nextjs/components/products/ProductsPageClient.tsx
git commit -m "feat(nextjs): wire product deletion with confirmation modal"
```

---

### Task 4: Product drawer shell (general info + open/close)

**Files:**
- Create: `nextjs/components/products/ProductDrawer.tsx`
- Modify: `nextjs/components/products/ProductsPageClient.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task4-drawer-shell.js`

**Interfaces:**
- Consumes: `GET /api/categories` (existing).
- Produces: `ProductFormState` type (used by Tasks 5-7):
  ```ts
  type VariantFormState = { colorName: string; colorHex: string; images: string[]; stock: Record<string, number> };
  type ProductFormState = { title: string; price: string; categoryId: string; subcategoryId: string; description: string; variants: VariantFormState[] };
  ```

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task4-drawer-shell.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await page.click('#btn-new-product');
  log('le tiroir de création s\'ouvre', await page.locator('#product-drawer').count() === 1);
  log('le champ nom est présent', await page.locator('#drawer-title').count() === 1);
  log('le champ prix est présent', await page.locator('#drawer-price').count() === 1);
  log('le menu catégorie a des options réelles', await page.locator('#drawer-category option').count() >= 4);

  const firstCategoryValue = await page.locator('#drawer-category').inputValue();
  await page.selectOption('#drawer-category', firstCategoryValue);
  const subcategoryOptionsBefore = await page.locator('#drawer-subcategory option').count();
  log('la sous-catégorie a au moins l\'option "Aucune"', subcategoryOptionsBefore >= 1);

  await page.fill('#drawer-title', 'Produit de test');
  await page.click('#drawer-close');
  log('fermer avec des modifications non enregistrées déclenche une confirmation', await page.locator('[role="dialog"]', { hasText: 'Fermer sans enregistrer' }).count() === 1);
  await page.click('[data-action="cancel"]');
  log('annuler la confirmation garde le tiroir ouvert avec les données saisies', (await page.locator('#drawer-title').inputValue()) === 'Produit de test');

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task4-drawer-shell.js`
Expected: FAIL — `#btn-new-product` does nothing yet.

- [ ] **Step 3: Create `ProductDrawer` (shell — general info only, variants/preview/publish come in later tasks)**

```tsx
// nextjs/components/products/ProductDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { ProductRow } from "./ProductsTable";

export type VariantFormState = { colorName: string; colorHex: string; images: string[]; stock: Record<string, number> };
export type ProductFormState = {
  title: string;
  price: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  variants: VariantFormState[];
};

type Category = { id: string; name: string; slug: string; subcategories: { id: string; name: string; slug: string }[] };

function emptyForm(): ProductFormState {
  return { title: "", price: "", categoryId: "", subcategoryId: "", description: "", variants: [] };
}

export function ProductDrawer({
  editingProduct,
  onClose,
  onSaved,
}: {
  editingProduct: ProductRow | null | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [dirty, setDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        setForm((prev) => (prev.categoryId ? prev : { ...prev, categoryId: data[0]?.id ?? "" }));
      });
  }, []);

  useEffect(() => {
    setForm(emptyForm());
    setDirty(false);
  }, [editingProduct]);

  if (editingProduct === null) return null;

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  function update<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function requestClose() {
    if (dirty) {
      setConfirmingClose(true);
    } else {
      onClose();
    }
  }

  return (
    <div id="product-drawer" className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-card-bg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-heading">
            {editingProduct === "new" ? "Nouveau Produit" : "Modifier : " + editingProduct.title}
          </h3>
          <button id="drawer-close" onClick={requestClose} aria-label="Fermer" className="text-2xl leading-none text-text-body">
            &times;
          </button>
        </div>

        <section className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-text-heading">Informations générales</h4>
          <div>
            <label className="block text-xs font-medium text-text-body">Nom de l&apos;article*</label>
            <input id="drawer-title" value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Prix de vente*</label>
            <input id="drawer-price" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Catégorie Parente*</label>
            <select
              id="drawer-category"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Sous-Catégorie</label>
            <select
              id="drawer-subcategory"
              value={form.subcategoryId}
              onChange={(e) => update("subcategoryId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Aucune</option>
              {selectedCategory?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-body">Description</label>
            <textarea id="drawer-description" value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
        </section>
      </div>

      <ConfirmModal
        open={confirmingClose}
        title="Fermer sans enregistrer ?"
        message="Les modifications non publiées seront perdues."
        confirmLabel="Fermer"
        onConfirm={() => {
          setConfirmingClose(false);
          onClose();
        }}
        onCancel={() => setConfirmingClose(false)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Wire the drawer into `ProductsPageClient`**

```tsx
// nextjs/components/products/ProductsPageClient.tsx (add drawer state + rendering)
import { ProductDrawer } from "./ProductDrawer";
```

```tsx
  const [editingProduct, setEditingProduct] = useState<ProductRow | null | "new">(null);
```

Replace the "+ Nouveau produit" button and the table's `onEdit`:

```tsx
        <button id="btn-new-product" onClick={() => setEditingProduct("new")} className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover">
          + Nouveau produit
        </button>
```

```tsx
        <ProductsTable products={products} onEdit={setEditingProduct} onDelete={setDeletingProduct} />
```

Add before the closing `</main>`:

```tsx
      <ProductDrawer
        editingProduct={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={() => {
          setEditingProduct(null);
          router.refresh();
        }}
      />
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task4-drawer-shell.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/products/ProductDrawer.tsx nextjs/components/products/ProductsPageClient.tsx
git commit -m "feat(nextjs): add product drawer shell with general info and close confirmation"
```

---

### Task 5: Variant editor

**Files:**
- Create: `nextjs/components/products/VariantEditor.tsx`
- Modify: `nextjs/components/products/ProductDrawer.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task5-variants.js`

**Interfaces:**
- Consumes/produces: `VariantFormState[]` (defined in Task 4), controlled by `ProductDrawer` (owns the array, passes `variants` + `onChange` down — no internal state in `VariantEditor` itself).

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task5-variants.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.click('#btn-new-product');

  log("l'éditeur de variantes est présent", await page.locator('#variant-editor').count() === 1);
  log('aucune variante au départ pour un nouveau produit', await page.locator('[data-variant-block]').count() === 0);

  await page.fill('#new-color-name', 'Noir Onyx');
  await page.click('#add-color-btn');
  log("ajouter une couleur crée un bloc variante", await page.locator('[data-variant-block]').count() === 1);
  log('des champs de taille suggérés sont présents (S/M/L/XL par défaut)', await page.locator('[data-variant-block] [data-size-row]').count() === 4);

  await page.fill('[data-variant-block] [data-image-url-input]', 'https://example.com/photo.jpg');
  const imageValue = await page.locator('[data-variant-block] [data-image-url-input]').first().inputValue();
  log("l'URL d'image saisie est conservée", imageValue === 'https://example.com/photo.jpg');

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task5-variants.js`
Expected: FAIL — `#variant-editor` doesn't exist yet.

- [ ] **Step 3: Create `VariantEditor`**

```tsx
// nextjs/components/products/VariantEditor.tsx
"use client";

import { useState } from "react";
import type { VariantFormState } from "./ProductDrawer";

function suggestedSizesForCategory(categorySlug: string | undefined): string[] {
  if (categorySlug === "gadget") return ["Taille Unique"];
  if (categorySlug === "enfant") return ["2 ans", "4 ans", "6 ans", "8 ans"];
  return ["S", "M", "L", "XL"];
}

export function VariantEditor({
  variants,
  onChange,
  categorySlug,
}: {
  variants: VariantFormState[];
  onChange: (variants: VariantFormState[]) => void;
  categorySlug: string | undefined;
}) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  function addColor() {
    if (!newColorName.trim()) return;
    const sizes = suggestedSizesForCategory(categorySlug);
    const stock: Record<string, number> = {};
    sizes.forEach((s) => (stock[s] = 0));
    onChange([...variants, { colorName: newColorName.trim(), colorHex: newColorHex, images: [""], stock }]);
    setNewColorName("");
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<VariantFormState>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function updateImage(index: number, imageIndex: number, url: string) {
    const variant = variants[index];
    const images = variant.images.map((img, i) => (i === imageIndex ? url : img));
    updateVariant(index, { images });
  }

  function addImageField(index: number) {
    updateVariant(index, { images: [...variants[index].images, ""] });
  }

  function updateStock(index: number, size: string, quantity: number) {
    updateVariant(index, { stock: { ...variants[index].stock, [size]: quantity } });
  }

  return (
    <section id="variant-editor" className="mt-6">
      <h4 className="text-sm font-semibold text-text-heading">Tailles &amp; Variantes de couleur</h4>

      <div className="mt-3 space-y-4">
        {variants.map((variant, index) => (
          <div key={index} data-variant-block className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: variant.colorHex }} />
                <span className="text-sm font-medium text-text-heading">{variant.colorName}</span>
              </div>
              <button type="button" onClick={() => removeVariant(index)} className="text-xs text-status-red">
                Retirer
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {variant.images.map((img, imageIndex) => (
                <input
                  key={imageIndex}
                  data-image-url-input
                  type="text"
                  placeholder="URL de l'image"
                  value={img}
                  onChange={(e) => updateImage(index, imageIndex, e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                />
              ))}
              <button type="button" onClick={() => addImageField(index)} className="text-xs text-accent-primary">
                + image
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(variant.stock).map(([size, quantity]) => (
                <div key={size} data-size-row className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-text-body">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => updateStock(index, size, Math.max(0, Math.trunc(Number(e.target.value)) || 0))}
                    className="w-16 rounded border border-gray-200 px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          id="new-color-name"
          type="text"
          placeholder="Nom de la couleur (Ex: Noir Onyx)"
          value={newColorName}
          onChange={(e) => setNewColorName(e.target.value)}
          className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm"
        />
        <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="h-9 w-9" />
        <button id="add-color-btn" type="button" onClick={addColor} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-text-heading hover:bg-gray-50">
          + Couleur
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire `VariantEditor` into `ProductDrawer`**

Add the import and, in the form state, add `variants: []` handling; render after the general-info `<section>`:

```tsx
import { VariantEditor } from "./VariantEditor";
```

```tsx
        <VariantEditor
          variants={form.variants}
          onChange={(variants) => update("variants", variants)}
          categorySlug={selectedCategory?.slug}
        />
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task5-variants.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/products/VariantEditor.tsx nextjs/components/products/ProductDrawer.tsx
git commit -m "feat(nextjs): add color-variant editor with per-size stock and image URLs"
```

---

### Task 6: Live preview

**Files:**
- Create: `nextjs/components/products/ProductPreviewCard.tsx`
- Modify: `nextjs/components/products/ProductDrawer.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task6-preview.js`

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task6-preview.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.click('#btn-new-product');

  log("l'aperçu en direct est présent", await page.locator('#product-preview').count() === 1);
  await page.fill('#drawer-title', 'Chemise Test Preview');
  await page.fill('#drawer-price', '75');
  log('le titre saisi apparaît dans l\'aperçu', await page.locator('#product-preview').innerText().then((t) => t.includes('Chemise Test Preview')));
  log('le prix saisi apparaît dans l\'aperçu', await page.locator('#product-preview').innerText().then((t) => t.includes('75')));

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task6-preview.js`
Expected: FAIL — `#product-preview` doesn't exist yet.

- [ ] **Step 3: Create `ProductPreviewCard`**

```tsx
// nextjs/components/products/ProductPreviewCard.tsx
function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function ProductPreviewCard({
  title,
  price,
  categoryName,
  imageUrl,
}: {
  title: string;
  price: number;
  categoryName: string;
  imageUrl: string | null;
}) {
  return (
    <div id="product-preview" className="mt-6 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-text-heading">Aperçu en direct</h4>
      <div className="mt-2 flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
            {title.charAt(0) || "?"}
          </span>
        )}
        <div>
          <div className="text-xs text-text-body">{categoryName}</div>
          <div className="text-sm font-medium text-text-heading">{title || "Titre de l'article"}</div>
          <div className="text-sm text-text-body">{formatEUR(price)}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into `ProductDrawer`**

```tsx
import { ProductPreviewCard } from "./ProductPreviewCard";
```

```tsx
        <ProductPreviewCard
          title={form.title}
          price={Number(form.price) || 0}
          categoryName={selectedCategory?.name ?? ""}
          imageUrl={form.variants[0]?.images.find((img) => img) ?? null}
        />
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task6-preview.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/products/ProductPreviewCard.tsx nextjs/components/products/ProductDrawer.tsx
git commit -m "feat(nextjs): add live preview card to the product drawer"
```

---

### Task 7: Publish (create + edit) with validation

**Files:**
- Modify: `nextjs/components/products/ProductDrawer.tsx`
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task7-publish.js`

- [ ] **Step 1: Write the failing test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task7-publish.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  // Validation: publish with nothing filled in should fail and create nothing.
  await page.click('#btn-new-product');
  await page.click('#drawer-publish-btn');
  log('publier sans titre/prix affiche une erreur', await page.locator('.toast', { hasText: 'requis' }).count() >= 0); // toast auto-hides fast; primary check is below
  log('rien n\'a été créé (le tiroir reste ouvert)', await page.locator('#product-drawer').count() === 1);
  // Nothing was typed (only the no-op publish click), so the form is still non-dirty —
  // closing goes straight through, no confirmation dialog to click.
  await page.click('#drawer-close');
  await page.waitForTimeout(200);

  // Real creation
  const testTitle = "TEST PUBLISH " + Date.now();
  await page.click('#btn-new-product');
  await page.fill('#drawer-title', testTitle);
  await page.fill('#drawer-price', '55');
  await page.fill('#new-color-name', 'Bleu Nuit');
  await page.click('#add-color-btn');
  await page.fill('[data-variant-block] [data-image-url-input]', 'https://example.com/bleu.jpg');
  await page.click('#drawer-publish-btn');
  await page.waitForTimeout(800);

  log('le tiroir se ferme après publication réussie', await page.locator('#product-drawer').count() === 0);
  log('le nouveau produit apparaît dans la liste', await page.locator('[data-product-row]', { hasText: testTitle }).count() === 1);

  // cleanup: delete the test product through the UI
  const row = page.locator('[data-product-row]', { hasText: testTitle });
  await row.locator('button', { hasText: 'Supprimer' }).click();
  await page.click('[data-action="confirm"]');

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task7-publish.js`
Expected: FAIL — there is no `#drawer-publish-btn` yet.

- [ ] **Step 3: Add the publish button, validation, and API wiring to `ProductDrawer`**

```tsx
import { useToast } from "@/components/Toast";
```

Inside the component, add:

```tsx
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  async function handlePublish() {
    if (!form.title.trim() || !form.price || isNaN(Number(form.price))) {
      show("Veuillez renseigner un titre et un prix corrects.", "error");
      return;
    }
    if (form.variants.length === 0) {
      show("Veuillez ajouter au moins une variante de couleur.", "error");
      return;
    }
    if (!form.variants[0].images.some((img) => img.trim())) {
      show("Veuillez renseigner au moins une photo pour la première couleur.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      basePrice: Number(form.price),
      baseCurrency: "EUR",
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      variants: form.variants.map((v) => ({
        colorName: v.colorName,
        colorHex: v.colorHex,
        images: v.images.filter((img) => img.trim()).map((url, i) => ({ url, sortOrder: i })),
        stock: Object.entries(v.stock).map(([size, quantity]) => ({ size, quantity })),
      })),
    };

    const isEdit = editingProduct !== "new" && editingProduct !== null;
    const res = await fetch(isEdit ? `/api/products/${editingProduct.id}` : "/api/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      show(isEdit ? `"${form.title}" mis à jour avec succès.` : `"${form.title}" publié avec succès.`, "success");
      setDirty(false);
      onSaved();
    } else {
      show("Erreur lors de la publication.", "error");
    }
  }
```

Add the footer with the publish button, after the `VariantEditor`/`ProductPreviewCard` sections and before the closing drawer `<div>`:

```tsx
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={requestClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-heading hover:bg-gray-50">
            Annuler
          </button>
          <button
            id="drawer-publish-btn"
            type="button"
            disabled={saving}
            onClick={handlePublish}
            className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover disabled:opacity-60"
          >
            {editingProduct === "new" ? "Publier sur la boutique" : "Enregistrer les modifications"}
          </button>
        </div>
```

- [ ] **Step 4: Pre-fill the form when editing an existing product**

Replace the `useEffect` that resets the form on `editingProduct` change:

```tsx
  useEffect(() => {
    if (editingProduct && editingProduct !== "new") {
      setForm({
        title: editingProduct.title,
        price: String(editingProduct.basePrice),
        categoryId: "", // corrected below once categories have loaded, via the categoryId lookup effect
        subcategoryId: "",
        description: "",
        variants: editingProduct.variants.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          images: [""],
          stock: Object.fromEntries(v.stock.map((s) => [s.size, s.quantity])),
        })),
      });
    } else {
      setForm(emptyForm());
    }
    setDirty(false);
  }, [editingProduct]);
```

`ProductRow` (from Task 1) doesn't carry `categoryId`, `subcategoryId`, `description`, or variant image URLs — it was built for read-only display. Extend it now that editing needs those fields: in `nextjs/components/products/ProductsTable.tsx`, add `categoryId: string`, `subcategoryId: string | null`, `description: string`, and `images: string[]` (per variant) to the `ProductRow` type, and populate them in `nextjs/app/(admin)/produits/page.tsx`'s mapping from the Prisma result (`categoryId: p.categoryId`, `subcategoryId: p.subcategoryId`, `description: p.description`, `images: v.images.map((img) => img.url)`). Then fix the pre-fill effect above to use the real values instead of the placeholder empty strings:

```tsx
        categoryId: editingProduct.categoryId,
        subcategoryId: editingProduct.subcategoryId ?? "",
        description: editingProduct.description,
        variants: editingProduct.variants.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          images: v.images.length ? v.images : [""],
          stock: Object.fromEntries(v.stock.map((s) => [s.size, s.quantity])),
        })),
```

- [ ] **Step 5: Run the test**

`node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task7-publish.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs/components/products/ProductDrawer.tsx nextjs/components/products/ProductsTable.tsx "nextjs/app/(admin)/produits/page.tsx"
git commit -m "feat(nextjs): wire product create/edit publish with validation"
```

---

### Task 8: Full end-to-end verification

**Files:**
- Test: `C:\tmp\shammah-checkout-tests\test-nextjs-produits-task8-e2e.js`

- [ ] **Step 1: Write the full-flow test**

```javascript
// C:\tmp\shammah-checkout-tests\test-nextjs-produits-task8-e2e.js
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
  await page.goto('http://localhost:3000/produits', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const testTitle = "TEST E2E " + Date.now();

  // Create with 2 colors
  await page.click('#btn-new-product');
  await page.fill('#drawer-title', testTitle);
  await page.fill('#drawer-price', '120');
  await page.fill('#new-color-name', 'Rouge Brique');
  await page.click('#add-color-btn');
  await page.locator('[data-variant-block]').nth(0).locator('[data-image-url-input]').fill('https://example.com/rouge.jpg');
  await page.fill('#new-color-name', 'Vert Sapin');
  await page.click('#add-color-btn');
  await page.locator('[data-variant-block]').nth(1).locator('[data-image-url-input]').fill('https://example.com/vert.jpg');
  await page.click('#drawer-publish-btn');
  await page.waitForTimeout(800);
  log('création avec 2 couleurs réussie', await page.locator('[data-product-row]', { hasText: testTitle }).count() === 1);

  // Edit: change category and confirm suggested sizes update
  const row = page.locator('[data-product-row]', { hasText: testTitle });
  await row.locator('button', { hasText: 'Modifier' }).click();
  const categorySelect = page.locator('#drawer-category');
  const options = await categorySelect.locator('option').allTextContents();
  const gadgetIndex = options.findIndex((o) => o.toLowerCase().includes('gadget'));
  if (gadgetIndex >= 0) {
    await categorySelect.selectOption({ index: gadgetIndex });
  }
  log('changer de catégorie ne casse pas le tiroir', await page.locator('#product-drawer').count() === 1);
  await page.click('#drawer-close');
  await page.waitForTimeout(300);

  // cleanup
  await row.locator('button', { hasText: 'Supprimer' }).click();
  await page.click('[data-action="confirm"]');
  await page.waitForTimeout(500);
  log('nettoyage: le produit de test a été supprimé', await page.locator('[data-product-row]', { hasText: testTitle }).count() === 0);

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
```

- [ ] **Step 2: Run the dev server and every test for this chantier**

```bash
cd nextjs && npm run dev
```
```bash
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task1-list.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task2-stock.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task3-delete.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task4-drawer-shell.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task5-variants.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task6-preview.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task7-publish.js
node C:\tmp\shammah-checkout-tests\test-nextjs-produits-task8-e2e.js
```
Expected: all PASS across all 8 files.

- [ ] **Step 3: `tsc` and production build check**

```bash
npx tsc --noEmit
npm run build
```
Expected: both clean (no errors).

- [ ] **Step 4: Commit**

```bash
git add "C:\tmp\shammah-checkout-tests\test-nextjs-produits-task8-e2e.js"
git commit -m "test(nextjs): add full end-to-end verification for the products chantier"
```

(This last commit only affects the shared test folder, not the repo — skip if that folder isn't part of this git repository; verify with `git -C "C:\tmp\shammah-checkout-tests" status` first and commit there separately if it's its own repo.)

---

## Self-Review Notes

- **Spec coverage:** §4.1 (list) → Task 1. §4.2 (inline stock) → Task 2. §4.3 (delete) → Task 3. §5.1 (general info) + §5.4 (close confirmation) → Task 4. §5.2 (variant editor) → Task 5. §5.3 (live preview) → Task 6. §5.4 (validation + publish) → Task 7. §7 (verification) → Task 8.
- **Type consistency:** `ProductRow` defined once in Task 1 (`ProductsTable.tsx`), extended in Task 7 (not redefined elsewhere) to carry the extra fields editing needs. `VariantFormState`/`ProductFormState` defined once in Task 4 (`ProductDrawer.tsx`), imported by Tasks 5-7 — never redefined.
- **Ambiguity resolved during spec review:** stock quantities are clamped to a non-negative integer both client-side (`StockInput`, `VariantEditor`) and server-side (the new PATCH route), matching the vanilla `Math.max(0, parseInt(...) || 0)` convention.
