/**
 * Module de notification WhatsApp instantanée pour l'administrateur
 * Utilise l'API CallMeBot (Gratuit, sans frais, 100% sécurisé)
 */

export interface WhatsAppOrderAlertParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: string;
  items?: Array<{
    productName: string;
    variantInfo?: string;
    formatLabel?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
}

export function normalizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  // Numéro français à 10 chiffres débutant par 0 (06, 07, etc.)
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = "33" + cleaned.substring(1);
  }
  return cleaned;
}

export async function sendWhatsAppNewOrderAlert(params: WhatsAppOrderAlertParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const rawPhone = process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_ADMIN_PHONE || null;
  const apikey = process.env.ADMIN_WHATSAPP_APIKEY || process.env.WHATSAPP_ADMIN_APIKEY || null;

  if (!rawPhone || !apikey) {
    console.log(
      `[WhatsApp Alert en attente de configuration] Commande #${params.orderNumber} (${params.totalAmount} €)`
    );
    return {
      success: false,
      error: "ADMIN_WHATSAPP_PHONE ou ADMIN_WHATSAPP_APIKEY non renseigné.",
    };
  }

  try {
    const formattedAmount = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(params.totalAmount);

    let itemsList = "";
    if (params.items && params.items.length > 0) {
      itemsList = params.items
        .map(
          (it) =>
            `• ${it.productName}${it.variantInfo ? ` (${it.variantInfo})` : it.formatLabel ? ` (${it.formatLabel})` : ""} x ${it.quantity}`
        )
        .join("\n");
    }

    const message = `*NOUVELLE COMMANDE SHAMMAH !*

*Commande :* #${params.orderNumber}
*Client :* ${params.customerName}
*Email :* ${params.customerEmail}
${params.customerPhone ? `*Tél :* ${params.customerPhone}\n` : ""}*Montant :* ${formattedAmount} (${params.paymentMethod.toUpperCase()})

*Articles à préparer :*
${itemsList || "• Détails dans le cockpit"}

*Adresse de livraison :*
${params.shippingAddress || "Non spécifiée"}

*Cockpit Commandes :* http://localhost:3000/orders`;

    const cleanPhone = normalizePhoneForWhatsApp(rawPhone);

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
      cleanPhone
    )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey.trim())}`;

    const res = await fetch(url, {
      method: "GET",
    });

    if (res.ok) {
      console.log(`Notification WhatsApp envoyée pour la commande #${params.orderNumber}`);
      return { success: true };
    } else {
      const errText = await res.text();
      console.warn("Échec envoi WhatsApp CallMeBot:", errText);
      return { success: false, error: errText };
    }
  } catch (error: any) {
    console.warn("Erreur réseau notification WhatsApp:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsAppTestAlert(phone: string, apikey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cleanPhone = normalizePhoneForWhatsApp(phone);
    const testMessage = `*TEST WHATSAPP SHAMMAH RÉUSSI !*
    
Votre boutique *Shammah* est désormais connectée à votre WhatsApp.
Vous recevrez instantanément une alerte détaillée dès qu'un client passera une commande !`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
      cleanPhone
    )}&text=${encodeURIComponent(testMessage)}&apikey=${encodeURIComponent(apikey.trim())}`;

    const res = await fetch(url, { method: "GET" });
    if (res.ok) {
      return { success: true };
    }
    const errText = await res.text();
    return { success: false, error: errText };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
