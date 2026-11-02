import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

async function inspectColumns() {
  loadEnvFile();
  const prisma = new PrismaClient();

  const tables = ["products", "orders", "product_variants", "categories"];
  for (const t of tables) {
    const cols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${t}
      ORDER BY ordinal_position;
    `;
    console.log(`\nColonnes de '${t}' :`, cols.map(c => `${c.column_name} (${c.data_type})`).join(", "));
  }

  await prisma.$disconnect();
}

inspectColumns();
