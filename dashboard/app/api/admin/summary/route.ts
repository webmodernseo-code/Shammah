import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);

    // Fetch live summary aggregates from PostgreSQL / Neon
    const [
      recentOrders,
      totalOrdersCount,
      productsCount,
      lowStockCount,
      customersCount,
      currentRevenueAgg,
      previousRevenueAgg,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        include: { items: { include: { product: { include: { category: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
      prisma.order.count(),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.product.count({ where: { isAvailable: true, stockQuantity: { lte: 15 } } }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        select: { customerEmail: true },
        distinct: ["customerEmail"],
      }).then((customers) => customers.length),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", createdAt: { gte: previousMonthStart, lt: monthStart } },
      }),
    ]);

    const revenue = Number(currentRevenueAgg._sum.totalAmount || 0);
    const previous = Number(previousRevenueAgg._sum.totalAmount || 0);
    const trend = previous > 0 ? ((revenue - previous) / previous) * 100 : null;
    const paidOrders = currentRevenueAgg._count;

    // Real status breakdown from live orders
    const statusCounts = {
      DELIVERED: 0,
      SHIPPED: 0,
      PROCESSING: 0,
      PAID: 0,
      PENDING: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    recentOrders.forEach((o) => {
      if (o.paymentStatus === "FAILED") return;
      const s = o.status as keyof typeof statusCounts;
      if (statusCounts[s] !== undefined) {
        statusCounts[s] += 1;
      }
    });

    const statusBreakdown = [
      { label: "Commandes Livrées", status: "DELIVERED", count: statusCounts.DELIVERED, color: "#059669" },
      { label: "Expédiées (En route)", status: "SHIPPED", count: statusCounts.SHIPPED, color: "#0284c7" },
      { label: "En préparation atelier", status: "PROCESSING", count: statusCounts.PROCESSING + statusCounts.PAID, color: "#d97706" },
      { label: "En attente de paiement", status: "PENDING", count: statusCounts.PENDING, color: "#6366f1" },
      { label: "Retours & Remboursements", status: "REFUNDED", count: statusCounts.REFUNDED + statusCounts.CANCELLED, color: "#e11d48" },
    ];

    // Rolling twelve-month revenue progression based only on paid orders.
    const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(currentYear, currentMonth - 11 + index, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const paidInMonth = recentOrders.filter(
        (order) => order.paymentStatus === "PAID" && order.createdAt >= date && order.createdAt < nextMonth,
      );
      const monthlyTotal = paidInMonth.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      return {
        month: monthFormatter.format(date).replace(".", ""),
        value: Number(monthlyTotal.toFixed(2)),
        orders: paidInMonth.length,
        full: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(monthlyTotal),
        isCurrent: date.getFullYear() === currentYear && date.getMonth() === currentMonth,
      };
    });

    const pendingOrders = recentOrders.filter(
      (order) =>
        ["UNPAID", "FAILED", "PENDING"].includes(order.paymentStatus) &&
        order.status === "PENDING" &&
        order.createdAt <= new Date(Date.now() - 60 * 60 * 1000),
    );
    const productSales = new Map<string, { id: string; name: string; code: string; category: string; image: string | null; units: number }>();
    for (const order of recentOrders) {
      if (order.paymentStatus !== "PAID") continue;
      for (const item of order.items) {
        const key = item.productId || item.productName;
        const current = productSales.get(key) || {
          id: item.productId || key,
          name: item.productName,
          code: item.product?.code || "—",
          category: item.product?.category?.name || "Catalogue",
          image: item.product?.imageRecto || null,
          units: 0,
        };
        current.units += item.quantity;
        productSales.set(key, current);
      }
    }
    const topProducts = Array.from(productSales.values())
      .sort((left, right) => right.units - left.units)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        revenueTrend: trend,
        paidOrders,
        averageOrder: paidOrders ? revenue / paidOrders : 0,
        totalCustomers: customersCount,
        activeProducts: productsCount,
        lowStock: lowStockCount,
        totalOrdersCount,
        pendingOrders: pendingOrders.length,
        pendingRevenue: pendingOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        topProducts,
        statusBreakdown,
        monthlyRevenue,
        recentOrders: recentOrders.slice(0, 8).map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: Number(order.totalAmount),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => `${item.quantity}× ${item.productName} (${item.variantInfo || item.formatLabel || "Standard"})`).join(", "),
        })),
      },
    });
  } catch (error) {
    console.error("Erreur API Summary:", error);
    return NextResponse.json({ success: false, error: "Service analytique indisponible." }, { status: 503 });
  }
}
