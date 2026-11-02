import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

function loadEnvFile() {
  const p = resolve(process.cwd(), ".env.local");
  if (existsSync(p)) {
    const content = readFileSync(p, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

async function deploy() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL non trouvée dans .env.local.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    console.log("🚀 Déploiement de la structure canonique sur Neon PostgreSQL...");

    // 1. Nettoyage des anciennes tables de démo incompatibles si présentes
    const legacyTables = [
      "ProductVariantStock", "ProductVariant", "ProductImage", "Product",
      "OrderItem", "Order", "PromoCode", "Subcategory", "Category", "AdminUser",
      "product_variants", "order_items", "orders", "products", "categories",
      "admin_sessions", "admin_users", "customer_addresses", "customers",
      "inventory_movements", "notification_deliveries", "payment_events",
      "payments", "playing_with_neon", "product_media", "promo_codes",
      "promotion_slides", "refunds", "returns", "schema_migrations", "shipments",
      "store_settings", "messages", "conversations", "contact_messages", "audit_events"
    ];

    console.log("🧹 Assainissement des anciennes tables obsolètes...");
    for (const t of legacyTables) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${t}" CASCADE;`).catch(() => {});
    }
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role" CASCADE;`).catch(() => {});
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "OrderStatus" CASCADE;`).catch(() => {});
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "PaymentStatus" CASCADE;`).catch(() => {});

    // 2. Exécution de la migration baseline (20260915000000_baseline_init)
    const baselineSqlPath = resolve(process.cwd(), "dashboard", "prisma", "migrations", "20260915000000_baseline_init", "migration.sql");
    const baselineSql = readFileSync(baselineSqlPath, "utf-8");

    console.log("⏳ Application de la migration baseline 20260915000000_baseline_init...");
    await prisma.$executeRawUnsafe(baselineSql);

    // 3. Exécution de la migration de durcissement (20260916000000_security_hardening)
    const securitySqlPath = resolve(process.cwd(), "dashboard", "prisma", "migrations", "20260916000000_security_hardening", "migration.sql");
    const securitySql = readFileSync(securitySqlPath, "utf-8");

    console.log("⏳ Application de la migration sécurité 20260916000000_security_hardening...");
    await prisma.$executeRawUnsafe(securitySql);

    // 4. Création et enregistrement de l'historique Prisma (_prisma_migrations)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);

    const checksum1 = createHash("sha256").update(baselineSql).digest("hex");
    const checksum2 = createHash("sha256").update(securitySql).digest("hex");

    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', '${checksum1}', NOW(), '20260915000000_baseline_init', 1),
        ('b0000000-0000-0000-0000-000000000002', '${checksum2}', NOW(), '20260916000000_security_hardening', 1)
      ON CONFLICT ("id") DO NOTHING;
    `);

    console.log("\n✅ SUCCÈS : Toutes les tables canoniques et migrations Prisma ont été appliquées avec succès sur Neon !");
  } catch (err) {
    console.error("\n❌ Erreur lors du déploiement :", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deploy();
