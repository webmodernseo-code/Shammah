import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  // In Next.js, .env.local takes precedence over .env
  const possiblePaths = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "dashboard", ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "dashboard", ".env"),
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...vals] = trimmed.split("=");
        const value = vals.join("=").trim().replace(/^["']|["']$/g, "");
        // Only set if not already set by higher precedence file and not a placeholder
        if (key && value && !value.includes("coller_ici") && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }

  // Synchronize root .env and dashboard/.env with .env.local values for Prisma CLI
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("coller_ici")) {
    const rootEnv = resolve(process.cwd(), ".env");
    const dashEnv = resolve(process.cwd(), "dashboard", ".env");
    const syncContent = `# Auto-synchronized with .env.local
DATABASE_URL="${process.env.DATABASE_URL}"
DIRECT_URL="${process.env.DIRECT_URL || process.env.DATABASE_URL}"
NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || "shammah_secret_local_dev_key_super_secure_2026_paris"}"
NEXT_PUBLIC_SITE_URL="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}"
NEXT_PUBLIC_DASHBOARD_URL="${process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}"
NEXT_PUBLIC_DEMO_MODE="false"
`;
    writeFileSync(rootEnv, syncContent, "utf-8");
    writeFileSync(dashEnv, syncContent, "utf-8");
  }
}

async function check() {
  loadEnvFile();

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("coller_ici")) {
    console.log("⚠️ Aucune variable DATABASE_URL valide trouvée dans .env.local ou .env.");
    console.log("   Vérifiez que votre chaîne commence bien par 'postgresql://' ou 'postgres://'.");
    return;
  }

  // Obfuscate connection string for security logs
  const dbUrl = process.env.DATABASE_URL;
  const isSsl = dbUrl.includes("sslmode=require") || dbUrl.includes("ssl=true");
  const hostMatch = dbUrl.match(/@([^:/]+)/);
  const host = hostMatch ? hostMatch[1] : "serveur distant";

  console.log(`📡 Test de connectivité à la base PostgreSQL (${host})...`);
  console.log(`   - SSL activé : ${isSsl ? "Oui (sécurisé)" : "Non (recommandé d'ajouter ?sslmode=require)"}`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const latency = Date.now() - startTime;
    console.log(`\n✅ SUCCÈS : Connexion établie avec succès à PostgreSQL Neon ! (Latence : ${latency}ms)`);

    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log(`📊 Tables actuellement en base (${tables.length}) :`, tables.map((t) => t.table_name).join(", ") || "(base encore vierge)");
  } catch (err) {
    console.error("\n❌ Échec de la connexion à la base de données :");
    console.error("   Message :", err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
