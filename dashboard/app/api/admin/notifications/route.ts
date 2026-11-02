import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} j`;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const notifications: Array<{
      id: string;
      title: string;
      time: string;
      description: string;
      type: "order" | "stock" | "payment";
      href?: string;
    }> = [];

    // 1. Fetch recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []);

    for (const order of recentOrders) {
      const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
      const formattedAmount = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(Number(order.totalAmount));

      if (order.paymentStatus === "PAID" || order.status === "PAID") {
        notifications.push({
          id: `ord-paid-${order.id}`,
          title: `Nouvelle commande reçue #${order.orderNumber}`,
          time: formatRelativeTime(new Date(order.createdAt)),
          description: `${order.customerName} (${itemsCount} article${itemsCount > 1 ? "s" : ""} — ${formattedAmount}) payée par ${order.paymentMethod.toUpperCase()}.`,
          type: "order",
          href: `/orders`,
        });
      } else if (order.status === "PENDING") {
        notifications.push({
          id: `ord-pending-${order.id}`,
          title: `Commande en attente #${order.orderNumber}`,
          time: formatRelativeTime(new Date(order.createdAt)),
          description: `${order.customerName} — ${formattedAmount} en attente de validation.`,
          type: "payment",
          href: `/orders`,
        });
      }
    }

    // 2. Fetch low stock products (stock <= 15)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isAvailable: true,
        stockQuantity: { lte: 15 },
      },
      take: 5,
      orderBy: { stockQuantity: "asc" },
    }).catch(() => []);

    for (const prod of lowStockProducts) {
      notifications.push({
        id: `stock-${prod.id}`,
        title: "Alerte Stock Bas",
        time: formatRelativeTime(new Date(prod.updatedAt)),
        description: `${prod.title} : seuil d'alerte atteint (${prod.stockQuantity} unité${prod.stockQuantity > 1 ? "s" : ""} restante${prod.stockQuantity > 1 ? "s" : ""}).`,
        type: "stock",
        href: `/products`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        count: notifications.length,
        notifications,
      },
    });
  } catch (error) {
    console.error("Erreur API notifications:", error);
    return NextResponse.json({
      success: true,
      data: { count: 0, notifications: [] },
    });
  }
}
