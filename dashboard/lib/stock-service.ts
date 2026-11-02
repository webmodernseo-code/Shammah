import { prisma } from "@/lib/prisma";

export async function restoreOrderStock(orderId: string): Promise<boolean> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) return false;

      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          stockRestoredAt: null,
          paymentStatus: { notIn: ["PAID", "REFUNDED"] },
        },
        data: { stockRestoredAt: new Date() },
      });
      if (claimed.count !== 1) return false;

      for (const item of order.items) {
        if (!item.productId) continue;
        const variants = await tx.productVariant.findMany({ where: { productId: item.productId } });
        const variant = variants.find((candidate) => {
          const sizeMatches = item.formatLabel === candidate.size || item.variantInfo?.includes(`Taille ${candidate.size}`);
          const colorMatches = item.variantInfo?.includes(candidate.color);
          return sizeMatches && colorMatches;
        });

        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { increment: item.quantity }, inStock: true },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity }, isAvailable: true },
          });
        }
      }

      if (order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: order.couponCode, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } },
        });
      }
      return true;
    });
  } catch (error) {
    console.error("Failed to restore order stock in dashboard:", error);
    return false;
  }
}
