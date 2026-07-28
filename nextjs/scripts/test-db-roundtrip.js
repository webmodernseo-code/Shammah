require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  const slug = "test-category-" + Date.now();
  const category = await prisma.category.create({ data: { name: "Test Category", slug } });
  log("la catégorie de test est créée avec un id", !!category.id);

  const fetched = await prisma.category.findUnique({ where: { id: category.id } });
  log("la catégorie relue correspond au nom créé", fetched?.name === "Test Category");

  await prisma.category.delete({ where: { id: category.id } });
  const afterDelete = await prisma.category.findUnique({ where: { id: category.id } });
  log("la catégorie de test est bien supprimée", afterDelete === null);

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
