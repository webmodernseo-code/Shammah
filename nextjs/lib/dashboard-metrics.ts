import { prisma } from "@/lib/prisma";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

export type DateRangeKey = "7d" | "30d" | "all";
export type RevenueChartMode = "week" | "month";

export type DashboardMetrics = {
  kpis: {
    totalSales: { value: number; trendPercent: number | null };
    revenue: { value: number; trendPercent: number | null };
    activeClients: { value: number; trendPercent: number | null };
    refundRequests: { value: number; trendPercent: number | null };
  };
  successRate: { rate: number; successfulCount: number; revenue: number };
  salesBreakdown: { successfulPct: number; pendingPct: number; cancelledPct: number };
  topProducts: { title: string; amount: number; percentOfTotal: number }[];
};

export type RevenueChartPoint = { label: string; revenue: number; orderCount: number };

export type RecentOrder = {
  id: string;
  orderNumber: string;
  clientName: string;
  createdAt: Date;
  total: number;
  status: string;
  firstItemTitle: string;
  extraItemsCount: number;
  thumbnailUrl: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function resolveRangeBounds(range: DateRangeKey, now: Date) {
  if (range === "all") {
    return { currentStart: null as Date | null, currentEnd: now, previousStart: null as Date | null, previousEnd: null as Date | null };
  }
  const days = range === "7d" ? 7 : 30;
  const currentStart = new Date(now.getTime() - days * DAY_MS);
  const previousEnd = currentStart;
  const previousStart = new Date(currentStart.getTime() - days * DAY_MS);
  return { currentStart, currentEnd: now, previousStart, previousEnd };
}

async function fetchOrdersInRange(start: Date | null, end: Date): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: start ? { createdAt: { gte: start, lte: end } } : { createdAt: { lte: end } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function computeKpis(orders: OrderWithItems[]) {
  const nonCancelled = orders.filter((o) => o.status !== "ANNULEE");
  return {
    totalSales: nonCancelled.length,
    revenue: nonCancelled.reduce((sum, o) => sum + Number(o.total), 0),
    activeClients: new Set(orders.map((o) => o.email || o.phone)).size,
    refundRequests: orders.length - nonCancelled.length,
  };
}

function computeSuccessRate(orders: OrderWithItems[]) {
  const eligible = orders.filter((o) => o.status !== "ANNULEE");
  const successful = orders.filter((o) => o.status === "PAYEE" || o.status === "EXPEDIEE");
  return {
    rate: eligible.length === 0 ? 0 : (successful.length / eligible.length) * 100,
    successfulCount: successful.length,
    revenue: successful.reduce((sum, o) => sum + Number(o.total), 0),
  };
}

function computeSalesBreakdown(orders: OrderWithItems[]) {
  const total = orders.length;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return {
    successfulPct: pct(orders.filter((o) => o.status === "PAYEE" || o.status === "EXPEDIEE").length),
    pendingPct: pct(orders.filter((o) => o.status === "EN_ATTENTE").length),
    cancelledPct: pct(orders.filter((o) => o.status === "ANNULEE").length),
  };
}

function computeTopProducts(orders: OrderWithItems[], limit = 4) {
  const totals = new Map<string, number>();
  let grandTotal = 0;
  for (const order of orders) {
    for (const item of order.items) {
      const amount = Number(item.price) * item.quantity;
      totals.set(item.title, (totals.get(item.title) || 0) + amount);
      grandTotal += amount;
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([title, amount]) => ({ title, amount, percentOfTotal: grandTotal === 0 ? 0 : (amount / grandTotal) * 100 }));
}

export async function getDashboardMetrics(range: DateRangeKey, now: Date = new Date()): Promise<DashboardMetrics> {
  const { currentStart, currentEnd, previousStart, previousEnd } = resolveRangeBounds(range, now);
  const currentOrders = await fetchOrdersInRange(currentStart, currentEnd);
  const previousOrders = previousStart ? await fetchOrdersInRange(previousStart, previousEnd!) : [];

  const current = computeKpis(currentOrders);
  const previous = computeKpis(previousOrders);

  return {
    kpis: {
      totalSales: { value: current.totalSales, trendPercent: trendPercent(current.totalSales, previous.totalSales) },
      revenue: { value: current.revenue, trendPercent: trendPercent(current.revenue, previous.revenue) },
      activeClients: { value: current.activeClients, trendPercent: trendPercent(current.activeClients, previous.activeClients) },
      refundRequests: { value: current.refundRequests, trendPercent: trendPercent(current.refundRequests, previous.refundRequests) },
    },
    successRate: computeSuccessRate(currentOrders),
    salesBreakdown: computeSalesBreakdown(currentOrders),
    topProducts: computeTopProducts(currentOrders),
  };
}

export async function getRevenueChartData(mode: RevenueChartMode, now: Date = new Date()) {
  const bucketCount = mode === "week" ? 7 : 5;
  const bucketMs = mode === "week" ? DAY_MS : 7 * DAY_MS;

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getTime() - bucketCount * bucketMs);
  const previousStart = new Date(start.getTime() - bucketCount * bucketMs);

  const orders = (await fetchOrdersInRange(previousStart, end)).filter((o) => o.status !== "ANNULEE");

  const points: RevenueChartPoint[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(start.getTime() + i * bucketMs);
    const bucketEnd = new Date(bucketStart.getTime() + bucketMs);
    const bucketOrders = orders.filter((o) => o.createdAt >= bucketStart && o.createdAt < bucketEnd);
    points.push({
      label: mode === "week" ? WEEKDAY_LABELS[bucketStart.getDay()] : "S" + (i + 1),
      revenue: bucketOrders.reduce((s, o) => s + Number(o.total), 0),
      orderCount: bucketOrders.length,
    });
  }

  const previousRevenue = orders
    .filter((o) => o.createdAt < start)
    .reduce((s, o) => s + Number(o.total), 0);
  const currentRevenue = points.reduce((s, p) => s + p.revenue, 0);

  return { points, trendPercent: trendPercent(currentRevenue, previousRevenue) };
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: {
        include: { variant: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      },
    },
  });

  return orders.map((order) => {
    const firstItem = order.items[0];
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      createdAt: order.createdAt,
      total: Number(order.total),
      status: order.status,
      firstItemTitle: firstItem?.title ?? "—",
      extraItemsCount: Math.max(order.items.length - 1, 0),
      thumbnailUrl: firstItem?.variant?.images[0]?.url ?? null,
    };
  });
}
