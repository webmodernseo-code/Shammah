import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, email, address, phone, total, paymentMethod, items } = body;

    if (!clientName || !email || !address || !phone || !total || !paymentMethod || !items || !items.length) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // 1. Générer un numéro de commande unique (format SH-XXXXX)
    let orderNumber = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      orderNumber = `SH-${randomDigits}`;
      const existing = await prisma.order.findUnique({ where: { orderNumber } });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Impossible de générer un numéro de commande unique" }, { status: 500 });
    }

    // 2. Créer la commande et ses articles dans une transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          clientName,
          email,
          address,
          phone,
          total,
          paymentMethod,
          status: "EN_ATTENTE",
        },
      });

      // Créer chaque élément de la commande et décrémenter le stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            title: item.title,
            price: item.price,
            variantName: item.variantName || "",
            size: item.size || "",
            quantity: item.quantity,
            variantId: item.variantId || null,
          },
        });

        // Tenter de décrémenter le stock si le variant et la taille sont fournis
        if (item.variantId && item.size) {
          try {
            const stockRow = await tx.productVariantStock.findUnique({
              where: { variantId_size: { variantId: item.variantId, size: item.size } },
            });

            if (stockRow) {
              const newQuantity = Math.max(0, stockRow.quantity - item.quantity);
              await tx.productVariantStock.update({
                where: { variantId_size: { variantId: item.variantId, size: item.size } },
                data: { quantity: newQuantity },
              });
            }
          } catch (stockError) {
            console.error(`Erreur mise à jour stock pour variant ${item.variantId}:`, stockError);
            // On continue sans faire échouer la commande complète
          }
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      orderNumber: createdOrder.orderNumber,
      total: createdOrder.total,
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur création commande:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
