import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { restoreOrderStock } from "@/lib/stock-service";

export const dynamic = "force-dynamic";

const allowedTransitions: Record<string, OrderStatus[]> = {
  PENDING: ["PAID", "PROCESSING", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { orderNumber: decodedId },
          { orderNumber: decodedId.toUpperCase() },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((it) => ({
          ...it,
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
          image: it.product?.imageRecto || "/images/products/costume-femme.jpg",
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de la récupération de la commande." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);
  const body = await req.json();
  const { status, trackingNumber, carrier = "Colissimo" } = body;

  try {
    const current = await prisma.order.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { orderNumber: decodedId },
          { orderNumber: decodedId.toUpperCase() },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!current) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    // If order is cancelled and wasn't cancelled before, restore reserved inventory
    if (status === "CANCELLED" && current.status !== "CANCELLED") {
      await restoreOrderStock(current.id);
    }

    const updated = await prisma.order.update({
      where: { id: current.id },
      data: {
        status: status || current.status,
      },
      include: {
        items: true,
      },
    });

    // Send transactional status notification email to customer on any status transition
    if (status && status !== current.status) {
      try {
        await sendOrderStatusUpdateEmail({
          to: updated.customerEmail,
          customerName: updated.customerName,
          orderNumber: updated.orderNumber,
          newStatus: status,
          carrier: carrier || "Colissimo La Poste",
          trackingNumber: trackingNumber || ("FR-" + Math.floor(10000000 + Math.random() * 90000000)),
          trackingUrl: trackingNumber ? `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}` : undefined,
          totalAmount: Number(updated.totalAmount),
        });
      } catch (mailErr) {
        console.warn("Échec de l'envoi de l'e-mail de mise à jour de commande:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour : ${updated.status}`,
      data: {
        ...updated,
        subtotal: Number(updated.subtotal),
        shippingCost: Number(updated.shippingCost),
        discountAmount: Number(updated.discountAmount),
        totalAmount: Number(updated.totalAmount),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
