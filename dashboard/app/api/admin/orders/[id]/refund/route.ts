import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderRefundedEmail } from "@/lib/email";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.paymentStatus !== "PAID" || !order.stripePaymentId) {
    return NextResponse.json({ error: "Cette commande n'est pas remboursable automatiquement." }, { status: 409 });
  }

  const method = order.paymentMethod.toLowerCase();
  const gateway = method === "paypal" ? "paypal" : "stripe";
  const config = await prisma.paymentGatewayConfig.findUnique({ where: { gateway } });

  if (gateway === "stripe") {
    const secretKey = config?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "La clé Stripe n'est pas configurée." }, { status: 503 });
    }

    const form = new URLSearchParams({
      payment_intent: order.stripePaymentId,
      reason: "requested_by_customer",
      "metadata[orderNumber]": order.orderNumber,
    });
    const response = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `refund-${order.id}`,
      },
      body: form,
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      console.error("Stripe refund rejected:", failure?.error?.code || response.status);
      return NextResponse.json(
        { error: failure?.error?.message || "Stripe a refusé le remboursement." },
        { status: 502 },
      );
    }
  } else {
    const clientId = config?.paypalClientId || process.env.PAYPAL_CLIENT_ID;
    const secretKey = config?.paypalSecretKey || process.env.PAYPAL_SECRET_KEY || process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !secretKey) {
      return NextResponse.json({ error: "Les identifiants PayPal ne sont pas configurés." }, { status: 503 });
    }

    const host = config?.isLiveMode ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const basic = Buffer.from(`${clientId.trim()}:${secretKey.trim()}`).toString("base64");
    const tokenRes = await fetch(`${host}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) return NextResponse.json({ error: "Authentification PayPal impossible." }, { status: 502 });

    const token = (await tokenRes.json()).access_token;
    const response = await fetch(`${host}/v2/payments/captures/${order.stripePaymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `refund-${order.id}`,
      },
      body: "{}",
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      console.error("PayPal refund rejected:", failure?.name || response.status);
      return NextResponse.json(
        { error: failure?.message || "PayPal a refusé le remboursement." },
        { status: 502 },
      );
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
  });

  try {
    await sendOrderRefundedEmail({
      to: updatedOrder.customerEmail,
      customerName: updatedOrder.customerName,
      orderNumber: updatedOrder.orderNumber,
      refundAmount: Number(updatedOrder.totalAmount),
    });
  } catch (mailErr) {
    console.warn("Échec d'envoi de l'e-mail de confirmation de remboursement:", mailErr);
  }

  return NextResponse.json({ success: true, message: "Remboursement intégral effectué et e-mail client envoyé." });
}
