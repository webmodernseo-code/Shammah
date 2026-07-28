require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { put } = require("@vercel/blob");

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadLocalImage(relativePath) {
  const absolutePath = path.resolve(__dirname, "../../", relativePath.replace(/^\.\.\//, ""));
  if (!fs.existsSync(absolutePath)) {
    console.log("FAIL - image locale introuvable, ignorée: " + relativePath);
    return null;
  }

  // Fallback local si pas de jeton Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN.includes("placeholder") || process.env.BLOB_READ_WRITE_TOKEN === "vercel-blob-token-here") {
    const filename = path.basename(absolutePath);
    return "/images/" + filename;
  }

  const buffer = fs.readFileSync(absolutePath);
  const filename = path.basename(absolutePath);
  const blob = await put(filename, buffer, { access: "public", addRandomSuffix: true });
  return blob.url;
}

async function migrate() {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  const exportPath = path.join(__dirname, "data", "divinexpress-export.json");
  if (!fs.existsSync(exportPath)) {
    console.log("FAIL - fichier d'export introuvable: " + exportPath);
    console.log("INFO - Exporter vos données depuis l'admin vanilla et placer le fichier dans nextjs/scripts/data/divinexpress-export.json");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  // 1. Categories
  const categoryIdMap = {};
  for (const cat of data.categories || []) {
    const slug = cat.slug || slugify(cat.name);
    const created = await prisma.category.upsert({
      where: { slug },
      update: { name: cat.name },
      create: { name: cat.name, slug },
    });
    categoryIdMap[slug] = created.id;
  }
  log("catégories migrées (" + (data.categories || []).length + ")", true);

  // 2. Products + Variants + Images + Stock
  let productCount = 0;
  for (const product of data.products || []) {
    let categoryId = null;
    let primaryCategorySlug = null;

    const prodCats = product.categories || [product.category];
    for (const catSlug of prodCats) {
      if (catSlug && categoryIdMap[catSlug.toLowerCase()]) {
        primaryCategorySlug = catSlug.toLowerCase();
        categoryId = categoryIdMap[primaryCategorySlug];
        break;
      }
    }

    if (!categoryId) {
      console.log("FAIL - catégorie introuvable pour le produit " + product.title + " (catégories: " + JSON.stringify(product.categories) + "), ignoré");
      ok = false;
      continue;
    }

    // Création / résolution dynamique de la sous-catégorie
    let subcategoryId = null;
    if (product.subcategory) {
      const subName = product.subcategory;
      const subSlug = slugify(subName);
      const subcategoryKey = primaryCategorySlug + "::" + subSlug;

      if (categoryIdMap[subcategoryKey]) {
        subcategoryId = categoryIdMap[subcategoryKey];
      } else {
        const createdSub = await prisma.subcategory.upsert({
          where: { categoryId_slug: { categoryId, slug: subSlug } },
          update: {},
          create: { name: subName, slug: subSlug, categoryId },
        });
        subcategoryId = createdSub.id;
        categoryIdMap[subcategoryKey] = createdSub.id;
      }
    }

    const baseSlug = slugify(product.title) + "-" + Math.random().toString(36).slice(2, 7);

    const createdProduct = await prisma.product.create({
      data: {
        title: product.title,
        slug: baseSlug,
        description: product.desc || product.description || "",
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
          colorHex: variant.color || "#000000",
        },
      });

      const imagePaths = variant.images && variant.images.length ? variant.images : [variant.img].filter(Boolean);
      let sortOrder = 0;
      for (const imgPath of imagePaths) {
        if (!imgPath) continue;
        const uploadedUrl = await uploadLocalImage(imgPath);
        if (uploadedUrl) {
          await prisma.productImage.create({
            data: { variantId: createdVariant.id, url: uploadedUrl, sortOrder: sortOrder++ },
          });
        }
      }

      const stockMap = variant.sizesStock || variant.stock || {};
      for (const [size, quantity] of Object.entries(stockMap)) {
        await prisma.productVariantStock.create({
          data: { variantId: createdVariant.id, size, quantity: Number(quantity) || 0 },
        });
      }
    }
    productCount++;
  }
  log(
    "produits migrés (" + productCount + "/" + (data.products || []).length + ")",
    productCount === (data.products || []).length
  );

  // 3. Promo codes
  let promoCount = 0;
  for (const promo of data.promoCodes || []) {
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
  log("codes promo migrés (" + promoCount + ")", promoCount === (data.promoCodes || []).length);

  // 4. Orders
  const statusMap = {
    "En attente": "EN_ATTENTE",
    "Payée": "PAYEE",
    "Expédiée": "EXPEDIEE",
    "Annulée": "ANNULEE",
  };
  let orderCount = 0;
  for (const order of data.orders || []) {
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: order.id,
        clientName: order.client,
        email: order.email || "",
        address: order.address || "",
        phone: order.phone || "",
        total: order.total,
        paymentMethod: order.method || "",
        status: statusMap[order.status] || "EN_ATTENTE",
        createdAt: order.date ? new Date(order.date.split("/").reverse().join("-")) : undefined,
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
  log("commandes migrées (" + orderCount + ")", orderCount === (data.orders || []).length);

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

migrate();
