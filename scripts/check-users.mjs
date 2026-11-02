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
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminEnabled: true,
        createdAt: true,
      },
    });

    console.log("=== UTILISATEURS EN BASE ===");
    console.table(users);
  } catch (err) {
    console.error("Erreur :", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
