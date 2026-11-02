import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/encryption";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const config = await prisma.smtpEmailConfig
      .findFirst({
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => null);

    if (config) {
      const decryptedPassword = decryptSecret(config.password);
      return NextResponse.json({
        success: true,
        data: {
          id: config.id,
          host: config.host,
          port: config.port,
          secure: config.secure,
          user: config.user,
          password: maskSecret(decryptedPassword),
          hasPassword: Boolean(decryptedPassword),
          fromName: config.fromName,
          fromEmail: config.fromEmail,
          isEnabled: config.isEnabled,
          source: "database",
        },
      });
    }

    // Fallback to env
    const envHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const envPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const envUser = process.env.SMTP_USER || process.env.SMTP_EMAIL || "";
    const envPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
    const envFromName = process.env.SMTP_FROM_NAME || "DivinExpress";
    const envFromEmail = process.env.SMTP_FROM_EMAIL || envUser || "contact@divinexpress.fr";

    return NextResponse.json({
      success: true,
      data: {
        host: envHost,
        port: envPort,
        secure: envPort === 465,
        user: envUser,
        password: maskSecret(envPass),
        hasPassword: Boolean(envPass),
        fromName: envFromName,
        fromEmail: envFromEmail,
        isEnabled: Boolean(envUser && envPass),
        source: "env",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération de la configuration SMTP." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.smtpEmailConfig
      .findFirst({
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => null);

    // Resolve plain password (keep existing if masked or omitted)
    let passwordToUse = "";
    if (body.password && !body.password.includes("••••")) {
      passwordToUse = body.password.trim();
    } else if (existing?.password) {
      passwordToUse = decryptSecret(existing.password);
    } else {
      passwordToUse = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
    }

    const host = body.host?.trim() || existing?.host || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(body.port) || existing?.port || 465;
    const secure = typeof body.secure === "boolean" ? body.secure : port === 465;
    const user = body.user?.trim() || existing?.user || process.env.SMTP_USER || "";
    const fromName = body.fromName?.trim() || existing?.fromName || "DivinExpress";
    const fromEmail = body.fromEmail?.trim() || existing?.fromEmail || user || "contact@divinexpress.fr";
    const isEnabled = typeof body.isEnabled === "boolean" ? body.isEnabled : true;

    // ── ACTION: TEST SMTP CONNECTION & SEND TEST EMAIL ──
    if (body.action === "test") {
      if (!user || !passwordToUse) {
        return NextResponse.json(
          {
            success: false,
            error: "Veuillez renseigner un identifiant (e-mail) et un mot de passe SMTP pour effectuer le test.",
          },
          { status: 400 }
        );
      }

      const testTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass: passwordToUse,
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_ALLOW_INSECURE_TLS === "true" ? false : true,
        },
      });

      // 1. Verify transporter credentials
      try {
        await testTransporter.verify();
      } catch (verifyErr: any) {
        let cleanErr = verifyErr?.message || "Échec de connexion au serveur SMTP.";
        if (cleanErr.includes("535") || cleanErr.includes("Authentication failed") || cleanErr.includes("BadCredentials")) {
          cleanErr = "Erreur d'authentification (535) : Identifiant ou mot de passe SMTP incorrect. (Pour Gmail, utilisez un Mot de passe d'application 16 caractères).";
        } else if (cleanErr.includes("ETIMEDOUT") || cleanErr.includes("ECONNREFUSED")) {
          cleanErr = `Impossible de contacter l'hôte ${host} sur le port ${port}. Vérifiez l'adresse et le port.`;
        }
        return NextResponse.json(
          {
            success: false,
            error: cleanErr,
          },
          { status: 400 }
        );
      }

      // 2. Dispatch a real test email if a recipient is specified
      const recipient = body.testRecipient?.trim() || user || fromEmail;
      const testHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Test de Connexion SMTP Réussi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding: 32px; background-color: #047857; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">🌿 DivinExpress</h1>
              <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 12px; font-weight: 600;">Validation du Serveur SMTP Transactionnel</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 9999px; margin-bottom: 16px;">
                <span style="color: #047857; font-size: 12px; font-weight: 700;">✓ Connexion SMTP Opérationnelle</span>
              </div>
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">Félicitations !</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Votre serveur SMTP est correctement configuré et authentifié. Votre boutique <strong>DivinExpress</strong> peut désormais distribuer en temps réel :
              </p>
              <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 22px;">
                <li>Les <strong>confirmations de commande avec facture PDF acquittée</strong></li>
                <li>Les <strong>notifications d'expédition avec numéro de suivi Colissimo</strong></li>
                <li>Les <strong>liens de réinitialisation de mot de passe administrateur</strong></li>
                <li>Les <strong>relances de paniers abandonnés</strong></li>
              </ul>
              <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; font-size: 12px; color: #64748b;">
                <strong>Paramètres testés :</strong><br>
                • Hôte : <span style="font-family: monospace; color: #0f172a;">${host}:${port}</span> (${secure ? "SSL" : "TLS"})<br>
                • Compte expéditeur : <span style="font-family: monospace; color: #0f172a;">${user}</span><br>
                • Nom affiché : <span style="color: #0f172a;">${fromName} &lt;${fromEmail}&gt;</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">© ${new Date().getFullYear()} DivinExpress — Système de messagerie transactionnelle</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await testTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient,
        subject: `✓ Test SMTP Réussi — DivinExpress (${new Date().toLocaleTimeString("fr-FR")})`,
        html: testHtml,
      });

      return NextResponse.json({
        success: true,
        message: `E-mail de test envoyé avec succès à ${recipient} ! Votre configuration SMTP fonctionne parfaitement.`,
      });
    }

    // ── ACTION: SAVE CONFIGURATION (ENCRYPTED) ──
    const encryptedPassword = encryptSecret(passwordToUse) || "";

    if (existing) {
      await prisma.smtpEmailConfig.update({
        where: { id: existing.id },
        data: {
          host,
          port,
          secure,
          user,
          password: encryptedPassword,
          fromName,
          fromEmail,
          isEnabled,
        },
      });
    } else {
      await prisma.smtpEmailConfig.create({
        data: {
          host,
          port,
          secure,
          user,
          password: encryptedPassword,
          fromName,
          fromEmail,
          isEnabled,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Configuration du serveur SMTP enregistrée avec succès !",
    });
  } catch (error: any) {
    console.error("Erreur enregistrement SMTP:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'enregistrement de la configuration SMTP." },
      { status: 500 }
    );
  }
}
