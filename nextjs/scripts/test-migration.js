require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  const exportPath = path.join(__dirname, "data", "divinexpress-export.json");
  if (!fs.existsSync(exportPath)) {
    console.log("FAIL - fichier d'export introuvable: " + exportPath);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  const productCountInDb = await prisma.product.count();
  log(
    "le nombre de produits en base correspond à l'export (" + (data.products || []).length + ")",
    productCountInDb === (data.products || []).length
  );

  const orderCountInDb = await prisma.order.count();
  log(
    "le nombre de commandes en base correspond à l'export (" + (data.orders || []).length + ")",
    orderCountInDb === (data.orders || []).length
  );

  const promoCountInDb = await prisma.promoCode.count();
  log(
    "le nombre de codes promo en base correspond à l'export (" + (data.promoCodes || []).length + ")",
    promoCountInDb === (data.promoCodes || []).length
  );

  const sampleImage = await prisma.productImage.findFirst();
  log(
    "au moins une image produit a une URL valide (Vercel Blob ou chemin local)",
    !!sampleImage && (sampleImage.url.includes("blob.vercel-storage.com") || sampleImage.url.startsWith("/images/"))
  );

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
