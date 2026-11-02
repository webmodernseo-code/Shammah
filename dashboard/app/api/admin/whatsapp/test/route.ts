import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sendWhatsAppTestAlert } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await isAdmin(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const phone = body.phone || process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_ADMIN_PHONE;
    const apikey = body.apikey || process.env.ADMIN_WHATSAPP_APIKEY || process.env.WHATSAPP_ADMIN_APIKEY;

    if (!phone || !apikey) {
      return NextResponse.json(
        {
          success: false,
          error: "Numéro de téléphone ou clé API CallMeBot manquant.",
        },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppTestAlert(phone, apikey);
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Message de test envoyé sur WhatsApp avec succès !",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || "Échec lors de l'envoi du message de test CallMeBot.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur interne serveur",
      },
      { status: 500 }
    );
  }
}
