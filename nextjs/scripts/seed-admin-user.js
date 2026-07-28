require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.log("FAIL - ADMIN_SEED_EMAIL et ADMIN_SEED_PASSWORD doivent être définis dans .env");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("PASS - compte admin créé/mis à jour pour " + email);
  await prisma.$disconnect();
})();
