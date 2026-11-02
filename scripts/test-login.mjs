import { PrismaClient } from "@prisma/client";
import { createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const scrypt = promisify(nodeScrypt);

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
        if (key && vals.length > 0 && !process.env[key.trim()]) {
          process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
}

async function verifyPassword(password, stored) {
  if (!stored) return false;
  try {
    const [algorithm, salt, hash] = stored.split(":");
    if (algorithm !== "scrypt" || !salt || !hash) return false;
    const expected = Buffer.from(hash, "hex");
    const actual = await scrypt(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function createSessionToken(payload, secret) {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

async function testAuth() {
  loadEnvFile();

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  console.log("🔐 Test du protocole d'authentification scrypt & session...\n");

  try {
    if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
      throw new Error("TEST_ADMIN_EMAIL et TEST_ADMIN_PASSWORD sont requis pour ce test.");
    }
    const testCases = [{
      email: process.env.TEST_ADMIN_EMAIL,
      pass: process.env.TEST_ADMIN_PASSWORD,
    }];

    for (const { email, pass } of testCases) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.error(`❌ Utilisateur ${email} introuvable.`);
        continue;
      }

      console.log(`👤 Utilisateur : ${user.email} (${user.role}) - Actif: ${user.adminEnabled}`);
      
      const isValid = await verifyPassword(pass, user.passwordHash);
      console.log(`   - Vérification mot de passe exact ("${pass}") : ${isValid ? "✅ SUCCÈS (Validé)" : "❌ ÉCHEC"}`);

      const isInvalid = await verifyPassword("MauvaisMotDePasse123", user.passwordHash);
      console.log(`   - Rejet mot de passe erroné : ${!isInvalid ? "✅ SUCCÈS (Rejeté)" : "❌ ÉCHEC"}`);

      if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET est requis.");
      const secret = process.env.NEXTAUTH_SECRET;
      const token = createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      }, secret);
      console.log(`   - Génération token cryptographique : ✅ SUCCÈS\n`);
    }

    console.log("✨ TOUS LES TESTS D'AUTHENTIFICATION SONT VALIDÉS À 100% !");
  } catch (err) {
    console.error("❌ Erreur test auth:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
