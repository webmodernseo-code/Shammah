import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const configs = await prisma.paymentGatewayConfig.findMany();
    const stripe = configs.find((c) => c.gateway === "stripe");
    const paypal = configs.find((c) => c.gateway === "paypal");

    const plainStripeSecret = decryptSecret(stripe?.stripeSecretKey) || process.env.STRIPE_SECRET_KEY || "";
    const plainStripeWebhook = decryptSecret(stripe?.stripeWebhookSecret) || process.env.STRIPE_WEBHOOK_SECRET || "";
    const plainPaypalSecret = decryptSecret(paypal?.paypalSecretKey) || process.env.PAYPAL_SECRET_KEY || process.env.PAYPAL_CLIENT_SECRET || "";

    return NextResponse.json({
      success: true,
      data: {
        stripe: {
          gateway: "stripe",
          isEnabled: stripe ? stripe.isEnabled : Boolean(plainStripeSecret && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
          isLiveMode: stripe ? stripe.isLiveMode : false,
          publishableKey: stripe?.stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
          secretKey: maskSecret(plainStripeSecret),
          webhookSecret: maskSecret(plainStripeWebhook),
          hasSecretKey: Boolean(plainStripeSecret),
        },
        paypal: {
          gateway: "paypal",
          isEnabled: paypal ? paypal.isEnabled : false,
          isLiveMode: paypal ? paypal.isLiveMode : false,
          clientId: paypal?.paypalClientId || process.env.PAYPAL_CLIENT_ID || "",
          secretKey: maskSecret(plainPaypalSecret),
          hasSecretKey: Boolean(plainPaypalSecret),
        },
      },
    });
  } catch (err: any) {
    console.error("Erreur lecture payment-gateways:", err);
    return NextResponse.json(
      { success: false, error: "Service de configuration des paiements indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const gateway = body.gateway;

    if (!["stripe", "paypal"].includes(gateway)) {
      return NextResponse.json({ error: "Passerelle de paiement inconnue." }, { status: 400 });
    }

    const existing = await prisma.paymentGatewayConfig.findUnique({
      where: { gateway },
    }).catch(() => null);

    const resolveSecret = (next: unknown, currentEncrypted?: string | null): string | null => {
      if (typeof next === "string" && !next.includes("••••") && next.trim().length > 0) {
        return next.trim();
      }
      if (currentEncrypted) {
        return decryptSecret(currentEncrypted);
      }
      return null;
    };

    // Action = Test Connection
    if (body.action === "test") {
      if (gateway === "stripe") {
        const key = resolveSecret(body.secretKey, existing?.stripeSecretKey) || process.env.STRIPE_SECRET_KEY;
        if (!key) {
          return NextResponse.json({ success: false, error: "Veuillez renseigner votre clé secrète Stripe (sk_test_... ou sk_live_...)." }, { status: 400 });
        }
        const response = await fetch("https://api.stripe.com/v1/balance", {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: errJson.error?.message || "Clé secrète Stripe invalide.",
          }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Connexion Stripe validée (${key.startsWith("sk_live_") ? "Production" : "Mode Test"}).`,
        });
      }

      if (gateway === "paypal") {
        const clientId = typeof body.clientId === "string" && !body.clientId.includes("••••") && body.clientId.trim()
          ? body.clientId.trim()
          : existing?.paypalClientId || process.env.PAYPAL_CLIENT_ID;
        const secret = resolveSecret(body.secretKey, existing?.paypalSecretKey) || process.env.PAYPAL_SECRET_KEY;
        if (!clientId || !secret) {
          return NextResponse.json({ success: false, error: "Client ID et Secret PayPal requis pour le test." }, { status: 400 });
        }
        const host = body.isLiveMode ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
        const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
        const response = await fetch(`${host}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });
        if (!response.ok) {
          return NextResponse.json({
            success: false,
            error: "Identifiants PayPal invalides pour cet environnement.",
          }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Connexion PayPal validée (${body.isLiveMode ? "Production" : "Sandbox"}).`,
        });
      }
    }

    // Action = Save
    if (gateway === "stripe") {
      const pubKey = body.publishableKey?.trim() || null;
      const plainSecret = resolveSecret(body.secretKey, existing?.stripeSecretKey);
      const plainWebhook = resolveSecret(body.webhookSecret, existing?.stripeWebhookSecret);
      const isLive = plainSecret ? plainSecret.startsWith("sk_live_") : Boolean(body.isLiveMode);

      const encryptedSecret = plainSecret ? encryptSecret(plainSecret) : null;
      const encryptedWebhook = plainWebhook ? encryptSecret(plainWebhook) : null;

      await prisma.paymentGatewayConfig.upsert({
        where: { gateway },
        update: {
          isEnabled: Boolean(body.isEnabled),
          isLiveMode: isLive,
          stripePublishableKey: pubKey,
          stripeSecretKey: encryptedSecret,
          stripeWebhookSecret: encryptedWebhook,
        },
        create: {
          gateway,
          isEnabled: Boolean(body.isEnabled),
          isLiveMode: isLive,
          stripePublishableKey: pubKey,
          stripeSecretKey: encryptedSecret,
          stripeWebhookSecret: encryptedWebhook,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Configuration Stripe enregistrée avec succès !",
      });
    } else {
      const clientId = typeof body.clientId === "string" && !body.clientId.includes("••••") && body.clientId.trim()
        ? body.clientId.trim()
        : existing?.paypalClientId || null;
      const plainSecret = resolveSecret(body.secretKey, existing?.paypalSecretKey);
      const encryptedSecret = plainSecret ? encryptSecret(plainSecret) : null;

      await prisma.paymentGatewayConfig.upsert({
        where: { gateway },
        update: {
          isEnabled: Boolean(body.isEnabled),
          isLiveMode: Boolean(body.isLiveMode),
          paypalClientId: clientId,
          paypalSecretKey: encryptedSecret,
        },
        create: {
          gateway,
          isEnabled: Boolean(body.isEnabled),
          isLiveMode: Boolean(body.isLiveMode),
          paypalClientId: clientId,
          paypalSecretKey: encryptedSecret,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Configuration PayPal enregistrée avec succès !",
      });
    }
  } catch (error: any) {
    console.error("Erreur enregistrement payment-gateways:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'enregistrement de la passerelle." },
      { status: 500 }
    );
  }
}
