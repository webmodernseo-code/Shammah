require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  // Chosen far from any real order date (the real migrated catalog's orders are all
  // July 17-20, 2026) so this test's 7d/previous-7d windows never overlap real data.
  const now = new Date("2026-09-15T12:00:00Z");
  const category = await prisma.category.create({
    data: { name: "Test Metrics", slug: "test-metrics-" + Date.now() },
  });

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "TESTM-1-" + Date.now(),
        clientName: "Client A", email: "a@test.com", address: "-", phone: "-",
        total: 100, paymentMethod: "test", status: "PAYEE",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: { create: [{ title: "Produit Test 1", price: 100, variantName: "", size: "", quantity: 1 }] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-2-" + Date.now(),
        clientName: "Client B", email: "b@test.com", address: "-", phone: "-",
        total: 50, paymentMethod: "test", status: "EXPEDIEE",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        items: { create: [{ title: "Produit Test 2", price: 50, variantName: "", size: "", quantity: 1 }] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-3-" + Date.now(),
        clientName: "Client C", email: "c@test.com", address: "-", phone: "-",
        total: 999, paymentMethod: "test", status: "ANNULEE",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: { create: [] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TESTM-4-" + Date.now(),
        clientName: "Client D", email: "d@test.com", address: "-", phone: "-",
        total: 20, paymentMethod: "test", status: "PAYEE",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        items: { create: [] },
      },
    }),
  ]);

  try {
    const { getDashboardMetrics, getRevenueChartData, getRecentOrders } = require("../lib/dashboard-metrics");

    const metrics = await getDashboardMetrics("7d", now);
    log("Ventes Totales (hors annulée) sur 7j = 2", metrics.kpis.totalSales.value === 2);
    log("Chiffre d'Affaires sur 7j = 150", metrics.kpis.revenue.value === 150);
    log("Demandes de remboursement sur 7j = 1", metrics.kpis.refundRequests.value === 1);
    log("tendance CA vs période précédente (20) = 650%", metrics.kpis.revenue.trendPercent === 650);
    log("répartition ventes: 2/3 réussies", Math.abs(metrics.salesBreakdown.successfulPct - 66.666) < 0.01);
    log("répartition ventes: 1/3 annulées", Math.abs(metrics.salesBreakdown.cancelledPct - 33.333) < 0.01);
    log("produit le plus vendu = Produit Test 1 (100€, 66.7%)", metrics.topProducts[0]?.title === "Produit Test 1" && Math.abs(metrics.topProducts[0].percentOfTotal - 66.666) < 0.01);

    const allTime = await getDashboardMetrics("all", now);
    log("badge de tendance masqué (null) pour range=all", allTime.kpis.revenue.trendPercent === null);

    const chart = await getRevenueChartData("week", now);
    log("le graphique semaine a 7 points", chart.points.length === 7);
    log("le CA total du graphique semaine = 150", chart.points.reduce((s, p) => s + p.revenue, 0) === 150);

    const recent = await getRecentOrders(5);
    log("commandes récentes limitées à 5 max", recent.length <= 5);
    log("commande sans variant a thumbnailUrl null", recent.find((o) => o.orderNumber.startsWith("TESTM-2"))?.thumbnailUrl === null);
  } finally {
    await Promise.all(orders.map((o) => prisma.order.delete({ where: { id: o.id } }).catch(() => {})));
    await prisma.category.delete({ where: { id: category.id } }).catch(() => {});
  }

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})();
