import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/encryption";

const LOGO_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/branding/logo-divinexpress.png`
  : "https://www.divinexpress.fr/branding/logo-divinexpress.png";
const BRAND_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.divinexpress.fr";

export interface OrderItemSummary {
  productName: string;
  formatLabel?: string;
  variantInfo?: string;
  quantity: number;
  totalPrice: number;
}

export interface SendOrderConfirmationParams {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  shippingStreet: string;
  shippingCity: string;
  shippingPostal: string;
  items?: OrderItemSummary[];
  invoiceUrl?: string;
}

export interface SendOrderProcessingParams {
  to: string;
  customerName: string;
  orderNumber: string;
  items?: OrderItemSummary[];
  shippingCity?: string;
}

export interface SendOrderShippedParams {
  to: string;
  customerName: string;
  orderNumber: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingAddress?: string;
}

export interface SendOrderDeliveredParams {
  to: string;
  customerName: string;
  orderNumber: string;
  reviewUrl?: string;
}

export interface SendOrderRefundedParams {
  to: string;
  customerName: string;
  orderNumber: string;
  refundAmount?: number;
  reason?: string;
}

export interface SendPasswordResetParams {
  to?: string;
  recipients?: string[];
  resetUrl: string;
  accountEmail?: string;
}

export interface SendAdminInvitationParams {
  to: string;
  name?: string;
  invitationUrl: string;
  expiresAt: Date;
}

export interface SendAbandonedCartReminderParams {
  to: string;
  customerName: string;
  cartUrl: string;
  discountCode?: string;
}

export async function getSmtpTransporter() {
  let host = process.env.SMTP_HOST || "smtp.gmail.com";
  let port = parseInt(process.env.SMTP_PORT || "465", 10);
  let secure = port === 465;
  let user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  let pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  let fromName = process.env.SMTP_FROM_NAME || "DivinExpress Mode";
  let fromEmail = process.env.SMTP_FROM_EMAIL || user || "contact@divinexpress.fr";

  try {
    const config = await prisma.smtpEmailConfig
      .findFirst({
        where: { isEnabled: true },
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => null);

    if (config && config.host && config.user && config.password) {
      host = config.host;
      port = config.port;
      secure = config.secure;
      user = config.user;
      pass = decryptSecret(config.password);
      fromName = config.fromName || fromName;
      fromEmail = config.fromEmail || fromEmail;
    }
  } catch {
    // Fallback to env
  }

  if (!user || !pass) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_ALLOW_INSECURE_TLS === "true" ? false : true,
    },
  });

  return {
    transporter,
    fromAddress: `"${fromName}" <${fromEmail}>`,
  };
}

function buildEmailTemplate({
  title,
  preheader,
  contentHtml,
}: {
  title: string;
  preheader?: string;
  contentHtml: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${title} — DivinExpress</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px; background-color: #0f172a; text-align: center;">
              <a href="${BRAND_SITE}" target="_blank" style="text-decoration: none; display: inline-block;">
                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">DIVINEXPRESS</span>
              </a>
              ${
                preheader
                  ? `<p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">${preheader}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 30px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px;">
                © ${new Date().getFullYear()} DivinExpress • Mode &amp; Prêt-à-Porter d'Exception<br>
                Une question ? Contactez notre atelier : <a href="mailto:contact@divinexpress.fr" style="color: #0f172a; text-decoration: none; font-weight: 600;">contact@divinexpress.fr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ── 1. CONFIRMATION DE COMMANDE ──
export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  totalAmount,
  shippingStreet,
  shippingCity,
  shippingPostal,
  items = [],
  invoiceUrl,
}: SendOrderConfirmationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();
    const finalInvoiceUrl = invoiceUrl || `${BRAND_SITE}/api/orders/${orderNumber}/invoice`;

    const itemsRows = items
      .map(
        (it) => `
      <tr>
        <td style="padding: 12px 0; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
          <strong>${it.quantity}x</strong> ${it.productName} <span style="color: #64748b; font-size: 12px;">(${it.formatLabel || it.variantInfo || ""})</span>
        </td>
        <td style="padding: 12px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
          ${it.totalPrice.toFixed(2)} €
        </td>
      </tr>
    `
      )
      .join("");

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Merci pour votre commande, ${customerName} !</h2>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
        Nous avons bien validé votre règlement pour la commande <strong>#${orderNumber}</strong>. Vos pièces exclusives vont être préparées avec le plus grand soin dans notre atelier.
      </p>

      ${
        items.length > 0
          ? `
      <table role="presentation" width="100%" style="margin: 20px 0; border-collapse: collapse;">
        ${itemsRows}
        <tr>
          <td style="padding: 16px 0 0 0; font-size: 16px; font-weight: 800; color: #0f172a;">Total TTC réglé</td>
          <td style="padding: 16px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a; text-align: right;">${totalAmount.toFixed(2)} €</td>
        </tr>
      </table>`
          : ""
      }

      <div style="text-align: center; margin: 32px 0 28px 0;">
        <a href="${finalInvoiceUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 30px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;">
          Consulter ma Facture (PDF)
        </a>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: `Confirmation de commande ${orderNumber}`,
      preheader: "Commande validée avec succès",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `Confirmation de votre commande #${orderNumber} — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur sendOrderConfirmationEmail:", error);
    return { success: false, error: error.message };
  }
}

// ── 2. COMMANDE EN PRÉPARATION ──
export async function sendOrderProcessingEmail({
  to,
  customerName,
  orderNumber,
  items = [],
}: SendOrderProcessingParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Votre commande est en cours de préparation</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        Bonjour <strong>${customerName}</strong>,<br><br>
        Nos stylistes et artisans préparent actuellement vos pièces pour la commande <strong>#${orderNumber}</strong>. Chaque création fait l'objet d'un contrôle qualité rigoureux avant son conditionnement.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 14px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 20px;">
          Vous recevrez un numéro de suivi dès la prise en charge de votre colis par le transporteur.
        </p>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: `Commande #${orderNumber} en préparation`,
      preheader: "Préparation soignée en atelier",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `Votre commande #${orderNumber} est en cours de préparation — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur sendOrderProcessingEmail:", error);
    return { success: false, error: error.message };
  }
}

// ── 3. COMMANDE EXPÉDIÉE ──
export async function sendOrderShippedEmail({
  to,
  customerName,
  orderNumber,
  carrier = "Colissimo Expert",
  trackingNumber,
  trackingUrl,
}: SendOrderShippedParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Votre colis est en route !</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        Bonjour <strong>${customerName}</strong>,<br><br>
        Votre commande <strong>#${orderNumber}</strong> a été expédiée via <strong>${carrier}</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 14px; margin: 24px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Numéro de suivi :</p>
        <p style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace;">${trackingNumber || "En cours de génération"}</p>
      </div>

      ${
        trackingUrl
          ? `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 30px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;">
          Suivre mon colis en direct
        </a>
      </div>`
          : ""
      }
    `;

    const fullHtml = buildEmailTemplate({
      title: `Commande #${orderNumber} expédiée`,
      preheader: `Expédition via ${carrier}`,
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `Votre commande #${orderNumber} a été expédiée — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur sendOrderShippedEmail:", error);
    return { success: false, error: error.message };
  }
}

// ── 4. COMMANDE LIVRÉE ──
export async function sendOrderDeliveredEmail({
  to,
  customerName,
  orderNumber,
  reviewUrl,
}: SendOrderDeliveredParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();
    const finalReviewUrl = reviewUrl || `${BRAND_SITE}/avis`;

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Votre commande a été livrée !</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        Bonjour <strong>${customerName}</strong>,<br><br>
        Le transporteur nous confirme la bonne livraison de votre commande <strong>#${orderNumber}</strong>. 
        Nous espérons que vos nouvelles pièces vous apporteront entière satisfaction.
      </p>

      <div style="text-align: center; margin: 30px 0 24px 0;">
        <a href="${finalReviewUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 30px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;">
          Donner mon avis sur mes articles
        </a>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: `Commande #${orderNumber} livrée`,
      preheader: "Colis remis à destination",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `Votre commande #${orderNumber} a été livrée — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur sendOrderDeliveredEmail:", error);
    return { success: false, error: error.message };
  }
}

// ── 5. COMMANDE REMBOURSÉE ──
export async function sendOrderRefundedEmail({
  to,
  customerName,
  orderNumber,
  refundAmount,
}: SendOrderRefundedParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Confirmation de remboursement</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        Bonjour <strong>${customerName}</strong>,<br><br>
        Nous vous confirmons le traitement du remboursement pour votre commande <strong>#${orderNumber}</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 14px; margin: 24px 0;">
        <table role="presentation" width="100%" style="font-size: 14px; color: #334155;">
          ${
            refundAmount !== undefined
              ? `
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Montant remboursé :</td>
            <td style="padding: 4px 0; font-weight: 800; color: #0f172a; text-align: right; font-size: 16px;">${refundAmount.toFixed(2)} €</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Mode de recrédit :</td>
            <td style="padding: 4px 0; font-weight: 600; color: #0f172a; text-align: right;">Moyen de paiement initial</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Délai interbancaire :</td>
            <td style="padding: 4px 0; font-weight: 600; color: #0f172a; text-align: right;">3 à 5 jours ouvrés</td>
          </tr>
        </table>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: `Remboursement commande #${orderNumber}`,
      preheader: "Notification de remboursement",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `Confirmation de remboursement pour la commande #${orderNumber} — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur sendOrderRefundedEmail:", error);
    return { success: false, error: error.message };
  }
}

// ── 6. GESTIONNAIRE UNIVERSEL DE CHANGEMENT D'ÉTAT ──
export async function sendOrderStatusUpdateEmail({
  to,
  customerName,
  orderNumber,
  newStatus,
  carrier,
  trackingNumber,
  trackingUrl,
  totalAmount,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  newStatus: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  totalAmount?: number;
}): Promise<{ success: boolean; error?: string }> {
  switch (newStatus) {
    case "PROCESSING":
      return sendOrderProcessingEmail({ to, customerName, orderNumber });
    case "SHIPPED":
      return sendOrderShippedEmail({
        to,
        customerName,
        orderNumber,
        carrier: carrier || "Colissimo Expert",
        trackingNumber: trackingNumber || "FR-" + Math.floor(10000000 + Math.random() * 90000000),
        trackingUrl,
      });
    case "DELIVERED":
      return sendOrderDeliveredEmail({ to, customerName, orderNumber });
    case "REFUNDED":
    case "CANCELLED":
      return sendOrderRefundedEmail({ to, customerName, orderNumber, refundAmount: totalAmount });
    case "PAID":
      return sendOrderConfirmationEmail({
        to,
        customerName,
        orderNumber,
        totalAmount: totalAmount || 0,
        shippingStreet: "Adresse enregistrée",
        shippingCity: "France",
        shippingPostal: "",
      });
    default:
      return { success: true };
  }
}

// ── 7. MOT DE PASSE OUBLIÉ ──
export async function sendPasswordResetEmail({
  to,
  recipients,
  resetUrl,
  accountEmail,
}: SendPasswordResetParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();

    const bodyHtml = `
      <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Réinitialisation de votre accès</h1>
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #475569;">
        Bonjour,<br><br>
        Une demande de réinitialisation de mot de passe a été initiée pour le compte <strong>${accountEmail || to}</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px;">
          Définir un nouveau mot de passe
        </a>
      </div>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Ce lien sécurisé est valable pendant 1 heure.</p>
    `;

    const fullHtml = buildEmailTemplate({
      title: "Réinitialisation de mot de passe",
      preheader: "Cockpit Administrateur DivinExpress",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    const targets = recipients && recipients.length > 0 ? recipients : (to ? [to] : []);
    const uniqueRecipients = [...new Set(targets.map((email) => email.trim().toLowerCase()))].filter(Boolean);

    if (uniqueRecipients.length === 0) {
      return { success: false, error: "Aucun destinataire de récupération configuré." };
    }

    await Promise.all(
      uniqueRecipients.map((recipient) =>
        smtp.transporter.sendMail({
          from: smtp.fromAddress,
          to: recipient,
          subject: "Réinitialisation de votre mot de passe — DivinExpress",
          html: fullHtml,
        })
      )
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 8. INVITATION ADMINISTRATEUR ──
export async function sendAdminInvitationEmail({
  to,
  name,
  invitationUrl,
  expiresAt,
}: SendAdminInvitationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();
    if (!smtp) return { success: false, error: "Configuration SMTP absente." };

    const contentHtml = `
      <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">Invitation au tableau de bord DivinExpress</h1>
      <p style="font-size:14px;line-height:24px;color:#475569;">Bonjour ${name || ""},<br><br>Vous avez été invité à rejoindre l'équipe d'administration de DivinExpress avec le rôle Administrateur.</p>
      <div style="text-align:center;margin:30px 0;"><a href="${invitationUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;">Accepter l'invitation</a></div>
      <p style="font-size:12px;color:#64748b;">Ce lien personnel expire le ${expiresAt.toLocaleString("fr-FR")} et ne peut être utilisé qu'une fois.</p>`;
    
    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: "Invitation administrateur — DivinExpress",
      html: buildEmailTemplate({ title: "Invitation administrateur", preheader: "Accès au cockpit DivinExpress", contentHtml }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 9. RELANCE PANIER ABANDONNÉ ──
export async function sendAbandonedCartReminderEmail({
  to,
  customerName,
  cartUrl,
  discountCode,
}: SendAbandonedCartReminderParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();
    if (!smtp) return { success: false, error: "Configuration SMTP absente." };

    const discountBlock = discountCode
      ? `<div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569; font-weight: 600;">Votre avantage réservé :</p>
        <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 2px;">${discountCode}</span>
      </div>`
      : "";

    const bodyHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 19px; color: #0f172a;">Bonjour ${customerName || ""},</h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
        Vous avez laissé des créations d'exception dans votre panier. Nous les avons réservées pour vous pendant quelques instants.
      </p>

      ${discountBlock}

      <div style="text-align: center; margin: 28px 0;">
        <a href="${cartUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px;">
          Finaliser ma commande
        </a>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: "Vos créations vous attendent",
      preheader: "Votre panier a été réservé",
      contentHtml: bodyHtml,
    });

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: discountCode
        ? `Vos articles DivinExpress vous attendent (avantage ${discountCode})`
        : "Vos articles DivinExpress vous attendent",
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 10. NOTIFICATION NOUVELLE COMMANDE POUR L'ADMINISTRATEUR ──
export async function sendAdminNewOrderAlertEmail({
  to,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  totalAmount,
  paymentMethod,
  shippingAddress,
  items = [],
  dashboardUrl = "http://localhost:3000/orders",
}: {
  to?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: string;
  items?: OrderItemSummary[];
  dashboardUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();
    const recipient = to || process.env.ADMIN_EMAIL || process.env.SMTP_USER || "contact@divinexpress.fr";

    const itemsHtml = items.length > 0
      ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a;">Articles commandés :</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">
            ${items.map(it => `<li style="margin-bottom: 4px;"><strong>${it.quantity}x</strong> ${it.productName} <em>(${it.formatLabel || it.variantInfo || ""})</em></li>`).join("")}
          </ul>
        </div>
      `
      : "";

    const bodyHtml = `
      <div style="border-left: 4px solid #0f172a; padding-left: 14px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Cockpit DivinExpress</span>
        <h1 style="margin: 4px 0 0 0; font-size: 21px; font-weight: 700; color: #0f172a;">Nouvelle commande reçue #${orderNumber}</h1>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
        Une nouvelle commande vient d'être validée sur la boutique en ligne.
      </p>

      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 18px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Client :</td>
            <td style="padding: 4px 0; font-weight: 700; color: #0f172a; text-align: right;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">E-mail :</td>
            <td style="padding: 4px 0; text-align: right;"><a href="mailto:${customerEmail}" style="color: #0f172a; text-decoration: none;">${customerEmail}</a></td>
          </tr>
          ${customerPhone ? `
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Téléphone :</td>
            <td style="padding: 4px 0; text-align: right;">${customerPhone}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Montant encaissé :</td>
            <td style="padding: 4px 0; font-weight: 800; color: #0f172a; font-size: 15px; text-align: right;">${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Moyen de paiement :</td>
            <td style="padding: 4px 0; text-align: right; text-transform: uppercase; font-weight: 600;">${paymentMethod}</td>
          </tr>
          ${shippingAddress ? `
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Adresse de livraison :</td>
            <td style="padding: 4px 0; text-align: right;">${shippingAddress}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      ${itemsHtml}

      <div style="text-align: center; margin: 28px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 30px; border-radius: 12px;">
          Ouvrir la commande dans le Cockpit
        </a>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: `Nouvelle commande #${orderNumber}`,
      preheader: `Montant : ${totalAmount.toFixed(2)} € par ${customerName}`,
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to: recipient,
      subject: `[Nouvelle Commande] #${orderNumber} reçue (${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalAmount)}) — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.warn("Erreur alerte email admin:", error);
    return { success: false, error: error.message };
  }
}

// ── 11. MESSAGE DIRECT AU CLIENT DEPUIS LE DESK SUPPORT ──
export async function sendCustomerDirectMessageEmail({
  to,
  customerName,
  subject,
  message,
}: {
  to: string;
  customerName: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const smtp = await getSmtpTransporter();

    const bodyHtml = `
      <h2 style="margin: 0 0 14px 0; font-size: 19px; color: #0f172a;">Bonjour ${customerName || ""},</h2>
      <div style="font-size: 14px; line-height: 24px; color: #334155; margin-bottom: 24px; white-space: pre-line;">
        ${message}
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0;"><strong>L'équipe DivinExpress</strong></p>
        <p style="margin: 0;">Besoin d'un conseil ? Répondez simplement à cet e-mail.</p>
      </div>
    `;

    const fullHtml = buildEmailTemplate({
      title: subject,
      preheader: "Message du service client DivinExpress",
      contentHtml: bodyHtml,
    });

    if (!smtp) {
      return { success: false, error: "Configuration SMTP absente." };
    }

    await smtp.transporter.sendMail({
      from: smtp.fromAddress,
      to,
      subject: `${subject} — DivinExpress`,
      html: fullHtml,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
