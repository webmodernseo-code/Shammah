import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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
        const value = vals.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && value && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      options.email = args[++i];
    } else if (args[i] === "--password" && args[i + 1]) {
      options.password = args[++i];
    } else if (args[i] === "--name" && args[i + 1]) {
      options.name = args[++i];
    } else if (args[i] === "--role" && args[i + 1]) {
      options.role = args[++i].toUpperCase();
    }
  }
  return options;
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
  const args = parseArgs();

  let email = args.email;
  let password = args.password;
  let name = args.name || "Administrateur Principal";
  let role = args.role || "MASTER_ADMIN";

  if (!["ADMIN", "SUPER_ADMIN", "MASTER_ADMIN"].includes(role)) {
    console.warn(`⚠️ Rôle '${role}' non standard, remplacement par 'MASTER_ADMIN'.`);
    role = "MASTER_ADMIN";
  }

  // Interactive prompt if arguments are missing
  if (!email || !password) {
    const rl = readline.createInterface({ input, output });
    console.log("💎 --- SHAMMAH : CRÉATION D'UN COMPTE ADMINISTRATEUR SÉCURISÉ ---");
    
    if (!email) {
      email = await rl.question("📧 Email de l'administrateur : ");
    }
    if (!password) {
      password = await rl.question("🔑 Mot de passe (min. 10 caractères) : ");
    }
    if (!args.name) {
      const inputName = await rl.question("👤 Nom complet (laisser vide pour 'Administrateur Principal') : ");
      if (inputName.trim()) name = inputName.trim();
    }
    rl.close();
  }

  if (!email || !email.includes("@")) {
    console.error("❌ ERREUR : Adresse e-mail invalide.");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ ERREUR : Le mot de passe doit comporter au moins 8 caractères (10+ recommandé).");
    process.exit(1);
  }

  try {
    console.log(`\n⏳ Hachage sécurisé du mot de passe avec scrypt...`);
    const passwordHash = await hashPassword(password);

    console.log(`⏳ Enregistrement de l'administrateur dans PostgreSQL (${email})...`);
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        name,
        passwordHash,
        role,
        adminEnabled: true,
      },
      create: {
        email: email.toLowerCase().trim(),
        name,
        passwordHash,
        role,
        adminEnabled: true,
      },
    });

    // Enregistrement d'audit
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        action: "ADMIN_INITIALIZED",
        targetType: "User",
        targetId: user.id,
        metadata: {
          role: user.role,
          name: user.name,
          source: "cli_seed_admin",
        },
      },
    });

    console.log(`\n✅ SUCCÈS : Compte administrateur créé / mis à jour avec succès !`);
    console.log(`   - ID : ${user.id}`);
    console.log(`   - Email : ${user.email}`);
    console.log(`   - Rôle : ${user.role}`);
    console.log(`   - Statut : Actif`);
    console.log(`\n🔒 Note : Aucun mot de passe n'a été enregistré en clair.\n`);
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'administrateur :", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
