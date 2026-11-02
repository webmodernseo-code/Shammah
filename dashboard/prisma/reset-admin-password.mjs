import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function setPasswordViaNeonHttp(email, newPassword) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL doit être définie dans l'environnement.");
  
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^/:]+)(?::\d+)?\/([^?]+)/);
  if (!match) throw new Error("Format d'URL de base de données invalide.");
  
  const [, user, pass, host, db] = match;
  const endpoint = `https://${host}/sql`;
  const connectionString = `postgresql://${user}:${pass}@${host}/${db}?sslmode=require`;
  const passwordHash = await hashPassword(newPassword);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": connectionString,
    },
    body: JSON.stringify({
      query: `
        INSERT INTO public.users (id, email, name, role, "adminEnabled", "passwordHash", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, LOWER($1), 'Administrateur DivinExpress', 'MASTER_ADMIN', true, $2, NOW(), NOW())
        ON CONFLICT (email) 
        DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "adminEnabled" = true, role = 'MASTER_ADMIN', "updatedAt" = NOW()
        RETURNING id, email, role, "adminEnabled";
      `,
      params: [email.toLowerCase().trim(), passwordHash],
    }),
  });

  const data = await res.json();
  if (!res.ok || data.message) {
    throw new Error(data.message || "Erreur de mise à jour Neon HTTP");
  }
  return data.rows?.[0];
}

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || "contact@divinexpress.fr").toLowerCase().trim();
  const password = args[1];

  if (!password || password.length < 8) {
    console.error("Usage: npm --prefix dashboard run reset-password <email> <newPassword(min 8 chars)>");
    console.error("Exemple: npm --prefix dashboard run reset-password contact@divinexpress.fr MonSuperMotDePasse123!");
    process.exit(1);
  }

  console.log(`Mise à jour du mot de passe pour : ${email}...`);
  try {
    const user = await setPasswordViaNeonHttp(email, password);
    console.log(`✅ Mot de passe mis à jour avec succès pour ${user.email} (Rôle: ${user.role}, Admin: ${user.adminEnabled})`);
  } catch (err) {
    console.error("❌ Échec de la mise à jour :", err.message || err);
    process.exit(1);
  }
}

main();
