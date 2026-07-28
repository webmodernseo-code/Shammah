require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const email = process.env.ADMIN_EMAIL || process.env.TEST_ADMIN_EMAIL || "contact@divinexpress.fr";
  const password = process.env.ADMIN_PASSWORD || process.env.TEST_ADMIN_PASSWORD || "DivineXpress2026@";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("PASS - compte admin créé/mis à jour pour " + email);
  await prisma.$disconnect();
})();
