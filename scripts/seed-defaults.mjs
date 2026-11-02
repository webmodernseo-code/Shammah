import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const possiblePaths = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
  ];
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...vals] = trimmed.split("=");
        const value = vals.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && value && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

async function main() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    console.error("❌ ERREUR : La variable DATABASE_URL n'est pas définie dans .env.local ou .env.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    console.log("⏳ Initialisation des catégories et configurations par défaut...");

    // 1. Catégories de base
    const categories = [
      { slug: "hommes", name: "Homme", description: "Collection Prêt-à-porter & Sur-mesure Homme" },
      { slug: "femmes", name: "Femme", description: "Collection Haute Couture & Prêt-à-porter Femme" },
      { slug: "enfants", name: "Enfant", description: "Collection Vêtements & Accessoires Enfant" },
      { slug: "accessoires", name: "Accessoires", description: "Maroquinerie, Bijoux & Accessoires de Luxe" },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat,
      });
    }
    console.log("   ✅ Catégories initialisées : Homme, Femme, Enfant, Accessoires");

    // 2. Configuration Maintenance
    await prisma.maintenanceConfig.upsert({
      where: { id: "site" },
      update: {},
      create: {
        id: "site",
        enabled: false,
        message: "Notre boutique Shammah est momentanément en maintenance. Nous revenons très vite.",
      },
    });
    console.log("   ✅ Configuration Maintenance initialisée");

    // 3. Configurations Passerelles Paiement
    const gateways = ["stripe", "paypal", "apple_pay"];
    for (const gw of gateways) {
      await prisma.paymentGatewayConfig.upsert({
        where: { gateway: gw },
        update: {},
        create: {
          gateway: gw,
          isEnabled: false,
          isLiveMode: false,
        },
      });
    }
    console.log("   ✅ Passerelles de paiement (Stripe, PayPal, Apple Pay) initialisées");

    // 4. Configuration Stockage Média Cloudinary
    await prisma.mediaStorageConfig.upsert({
      where: { provider: "cloudinary" },
      update: {},
      create: {
        provider: "cloudinary",
        cloudName: "shammah",
        apiKey: "",
        apiSecret: "",
        uploadFolder: "shammah/products",
        isEnabled: false,
      },
    });
    console.log("   ✅ Configuration Stockage Médias (Cloudinary) initialisée");

    // 5. Configuration SMTP E-mails
    await prisma.smtpEmailConfig.upsert({
      where: { id: "default_smtp" },
      update: {},
      create: {
        id: "default_smtp",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: "",
        password: "",
        fromName: "Shammah",
        fromEmail: "contact@shammah.eu",
        isEnabled: false,
      },
    });
    console.log("   ✅ Configuration SMTP E-mails initialisée");

    // 6. Coupons d'accueil par défaut
    const defaultCoupons = [
      { code: "DIVINE10", description: "Remise de bienvenue 10%", discountPercent: 10.0, isActive: true },
      { code: "VIP15", description: "Offre Privilège 15%", discountPercent: 15.0, isActive: true, minOrderAmount: 150 },
    ];
    for (const cp of defaultCoupons) {
      await prisma.coupon.upsert({
        where: { code: cp.code },
        update: {},
        create: cp,
      });
    }
    console.log("   ✅ Coupons de bienvenue initialisés (DIVINE10, VIP15)");

    console.log("\n✨ Initialisation des données système terminée avec succès !\n");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des données système :", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
