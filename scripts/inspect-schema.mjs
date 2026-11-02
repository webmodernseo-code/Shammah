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

async function inspect() {
  loadEnvFile();
  const prisma = new PrismaClient();

  try {
    // 1. Check if _prisma_migrations table exists
    const migrations = await prisma.$queryRaw`
      SELECT * FROM information_schema.tables WHERE table_name = '_prisma_migrations';
    `;
    console.log("Prisma migrations table exists:", migrations.length > 0);

    if (migrations.length > 0) {
      const history = await prisma.$queryRaw`SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at ASC;`;
      console.log("Migration history:", history);
    }

    // 2. Check canonical tables
    const canonical = [
      "users", "categories", "products", "product_variants", "orders", 
      "order_items", "coupons", "audit_logs", "password_reset_tokens", 
      "blog_posts", "payment_gateway_configs"
    ];

    console.log("\nInspection des tables canoniques :");
    for (const t of canonical) {
      const exists = await prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables WHERE table_name = ${t};
      `;
      if (exists.length > 0) {
        const count = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM "${t}"`);
        console.log(`   ✅ Table '${t}' existe (${count[0].count} lignes)`);
      } else {
        console.log(`   ❌ Table '${t}' MANQUANTE`);
      }
    }
  } catch (err) {
    console.error("Erreur inspection:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
