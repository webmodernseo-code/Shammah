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

async function viewDemoData() {
  loadEnvFile();
  const prisma = new PrismaClient();

  const prods = await prisma.$queryRaw`SELECT * FROM products LIMIT 5;`;
  console.log("Anciens produits :", prods);

  const ords = await prisma.$queryRaw`SELECT * FROM orders LIMIT 5;`;
  console.log("Anciennes commandes :", ords);

  await prisma.$disconnect();
}

viewDemoData();
