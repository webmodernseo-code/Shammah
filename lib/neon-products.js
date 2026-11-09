import fs from "node:fs";
import path from "node:path";

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const candidateFiles = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "dashboard", ".env.local"),
    path.join(process.cwd(), "dashboard", ".env"),
  ];

  for (const filePath of candidateFiles) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        const match = content.match(/^DATABASE_URL\s*=\s*(.+)$/m);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, "");
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return "";
}

async function queryNeonSql(query, params = []) {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const url = new URL(databaseUrl);
    const endpoint = `https://${url.hostname}/sql`;
    const response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": databaseUrl,
      },
      body: JSON.stringify({ query, params }),
    });

    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.rows) ? payload.rows : [];
  } catch {
    return [];
  }
}

function mapCategoryToSlugs(catSlug, catName) {
  const raw = `${catSlug || ""} ${catName || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (raw.includes("sweat") || raw.includes("hoodie") || raw.includes("capuche")) {
    return ["sweats", "sweats-a-capuche", "hoodies"];
  }
  if (raw.includes("casquette") || raw.includes("bonnet") || raw.includes("chapeau")) {
    return ["casquettes", "bonnets-casquettes"];
  }
  if (raw.includes("accessoire") || raw.includes("mug") || raw.includes("tasse") || raw.includes("sac")) {
    return ["accessoires", "gadgets"];
  }
  return ["t-shirts"];
}

function mapColorToSwatchClass(colorName) {
  const lower = String(colorName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (lower.includes("blanc") || lower.includes("white")) return { filter: "White", swatch: "bg-white" };
  if (lower.includes("vert") || lower.includes("green")) return { filter: "Dark Green", swatch: "bg-dark-green" };
  if (lower.includes("gris") || lower.includes("grey")) return { filter: "Grey", swatch: "bg-grey-4" };
  if (lower.includes("beige") || lower.includes("sable")) return { filter: "Beige", swatch: "bg-light-orange" };
  if (lower.includes("jaune") || lower.includes("or")) return { filter: "Yellow", swatch: "bg-yellow" };
  if (lower.includes("bleu") || lower.includes("marine")) return { filter: "Blue", swatch: "bg-primary" };
  if (lower.includes("rouge") || lower.includes("bordeaux")) return { filter: "Red", swatch: "bg-red" };
  return { filter: "Black", swatch: "bg-dark" };
}

export function mapDbRowToStoreProduct(row, variants = []) {
  const price = Number(row.basePrice) || 29;
  const oldPrice =
    row.baseOldPrice && Number(row.baseOldPrice) > price
      ? Number(row.baseOldPrice)
      : null;

  const discountPct =
    oldPrice && oldPrice > price
      ? `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`
      : null;

  const imgSrc = row.imageRecto || "/images/cls-categories/pod/t-shirts-jesus.jpg";
  const imageHover = row.imageVerso || imgSrc;

  const sizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean))
  );
  const finalSizes = sizes.length > 0 ? sizes : ["Unique"];

  const uniqueColorNames = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  );
  const filterColor = [];
  const colors = [];

  if (uniqueColorNames.length > 0) {
    uniqueColorNames.forEach((cName) => {
      const { filter, swatch } = mapColorToSwatchClass(cName);
      if (!filterColor.includes(filter)) filterColor.push(filter);
      colors.push({
        label: cName,
        value: swatch,
        img: imgSrc,
      });
    });
  } else {
    filterColor.push("Black");
    colors.push({
      label: "Noir",
      value: "bg-dark",
      img: imgSrc,
    });
  }

  const categories = mapCategoryToSlugs(row.categorySlug, row.categoryName);

  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || "",
    description: row.description || row.title,
    material: row.material || "100% Coton Biologique",
    price,
    oldPrice,
    discount: discountPct,
    imgSrc,
    imageHover,
    filterSizes: finalSizes,
    sizes: finalSizes,
    filterColor,
    colors,
    filterBrands: ["Shammah"],
    categories,
    tabFilterCategories: ["What's Hot?", "Best Sellers", "Just Arrivals"],
    inStock: (Number(row.stockQuantity) ?? 10) > 0 && row.isAvailable !== false,
    isFromDb: true,
  };
}

export async function fetchDatabaseProducts() {
  const rows = await queryNeonSql(`
    SELECT
      p.id,
      p.code,
      p.slug,
      p.title,
      p.subtitle,
      p.description,
      p.material,
      p."basePrice",
      p."baseOldPrice",
      p."imageRecto",
      p."imageVerso",
      p."stockQuantity",
      p."isAvailable",
      p."isFeatured",
      p."createdAt",
      c.slug AS "categorySlug",
      c.name AS "categoryName"
    FROM public.products p
    LEFT JOIN public.categories c ON p."categoryId" = c.id
    WHERE p."isAvailable" = true
    ORDER BY p."createdAt" DESC
  `);

  if (!rows || rows.length === 0) return [];

  const variantRows = await queryNeonSql(`
    SELECT
      "productId",
      size,
      color,
      "colorHex",
      stock,
      price,
      "oldPrice",
      "inStock"
    FROM public.product_variants
  `);

  const variantsByProduct = new Map();
  for (const v of variantRows) {
    if (!variantsByProduct.has(v.productId)) {
      variantsByProduct.set(v.productId, []);
    }
    variantsByProduct.get(v.productId).push(v);
  }

  return rows.map((r) =>
    mapDbRowToStoreProduct(r, variantsByProduct.get(r.id) || [])
  );
}

export async function fetchDatabaseProductById(idOrCode) {
  if (!idOrCode) return null;
  const clean = decodeURIComponent(String(idOrCode));

  const rows = await queryNeonSql(
    `
    SELECT
      p.id,
      p.code,
      p.slug,
      p.title,
      p.subtitle,
      p.description,
      p.material,
      p."basePrice",
      p."baseOldPrice",
      p."imageRecto",
      p."imageVerso",
      p."stockQuantity",
      p."isAvailable",
      p."isFeatured",
      p."createdAt",
      c.slug AS "categorySlug",
      c.name AS "categoryName"
    FROM public.products p
    LEFT JOIN public.categories c ON p."categoryId" = c.id
    WHERE p.id = $1 OR p.code = $1 OR p.slug = $1
    LIMIT 1
  `,
    [clean]
  );

  if (!rows || rows.length === 0) return null;
  const row = rows[0];

  const variantRows = await queryNeonSql(
    `
    SELECT
      "productId",
      size,
      color,
      "colorHex",
      stock,
      price,
      "oldPrice",
      "inStock"
    FROM public.product_variants
    WHERE "productId" = $1
  `,
    [row.id]
  );

  return mapDbRowToStoreProduct(row, variantRows || []);
}

