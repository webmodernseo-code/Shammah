import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomerDirectMessageEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export interface InboxMessage {
  id: string;
  content: string;
  sender: "me" | "other" | "bot";
  time: string;
  type?: "text" | "order_event" | "ai_suggestion";
}

export interface InboxCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
  orderNumber?: string;
  orderStatus?: string;
  orderTotal?: number;
  shippingAddress?: string;
  itemsCount?: number;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
  category: "all" | "customers" | "support" | "ai";
  messages: InboxMessage[];
}

// ── CONSEILLER STYLE & MODE SHAMMAH AI ENGINE ──
function getShammahStyleReply(query: string, customerContext?: Partial<InboxCustomer>): string {
  const q = query.toLowerCase();

  if (q.includes("taille") || q.includes("guide") || q.includes("mesure") || q.includes("choisir")) {
    return "Nos pièces taillent conformément aux standards européens. Pour les costumes et blazers hommes, référez-vous à votre tour de poitrine (ex: Taille 50 = M). Pour les robes et vestes femmes, si vous hésitez entre deux tailles, nous vous conseillons la taille au-dessus pour un confort optimal. Les échanges de taille sont 100% gratuits sous 14 jours.";
  }

  if (q.includes("matiere") || q.includes("tissu") || q.includes("coton") || q.includes("laine") || q.includes("soie")) {
    return "Toutes nos collections Shammah sont confectionnées à partir de fibres nobles : Coton biologique brossé 450 GSM pour les hoodies, Laine italienne 120s pour les costumes, et Soie naturelle pour nos robes de soirée. Entretien : lavage délicat à 30°C ou nettoyage à sec recommandé.";
  }

  if (q.includes("costume") || q.includes("smoking") || q.includes("veston")) {
    return "Le Costume Homme Sur-Mesure Noir Impérial est confectionné en pure laine vierge avec doublure satinée respirante. Il comprend la veste 2 boutons et le pantalon à plis ajusté. Idéal pour les galas, mariages et rendez-vous d'affaires.";
  }

  if (q.includes("robe") || q.includes("soiree") || q.includes("soie")) {
    return "La Robe de Soirée Soie Rouge Rubis dispose d'une coupe fluide et drapée avec fente latérale discrète. Elle s'associe idéalement avec des escarpins nude ou noirs et des accessoires discrets en or ou argent.";
  }

  if (q.includes("livraison") || q.includes("delai") || q.includes("colissimo") || q.includes("suivi")) {
    return "Les commandes sont préparées sous 24h ouvrées dans nos ateliers en France. La livraison Colissimo à domicile prend 2 à 3 jours ouvrés en France métropolitaine (frais de port offerts dès 80 € d'achat). Vous recevez un lien de suivi en temps réel dès l'expédition.";
  }

  if (q.includes("retour") || q.includes("echange") || q.includes("remboursement")) {
    return "Vous disposez de 14 jours après réception pour essayer vos articles. Les retours et échanges de taille sont simplifiés via votre espace client avec étiquette prépayée. Le remboursement intervient sous 3 à 5 jours après contrôle qualité des articles non portés avec étiquette.";
  }

  if (q.includes("merci") || q.includes("bonjour") || q.includes("salut")) {
    return "Bonjour ! Bienvenue au service client Shammah Mode. Comment puis-je vous accompagner dans le choix de vos articles ou le suivi de votre commande ?";
  }

  return "Je note votre demande pour la boutique Shammah. N'hésitez pas à préciser s'il s'agit d'un conseil de style (guide des tailles, matières), d'un suivi de livraison Colissimo ou d'un échange de taille.";
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } catch {
      orders = [];
    }

    const customers: InboxCustomer[] = [];

    // Dedicated AI Style Assistant at the top
    customers.push({
      id: "ai-style-shammah",
      name: "Assistant Style & Vente IA (Shammah)",
      email: "assistant@shammah.eu",
      avatar: "/branding/logo-shammah.png",
      initials: "IA",
      lastMessage: "Posez-moi une question sur nos collections, tailles ou commandes...",
      time: "En direct",
      isActive: true,
      category: "ai",
      messages: [
        {
          id: "m_ai_1",
          content: "Bonjour ! Je suis votre Assistant Style & Support IA Shammah. Je peux vous aider à répondre aux questions des clients sur les tailles, conseiller des assortiments de vêtements ou rédiger des messages personnalisés.",
          sender: "bot",
          time: "En continu",
          type: "text",
        },
      ],
    });

    // Map real orders to customer conversations if any
    const seenEmails = new Set<string>();

    for (const order of orders) {
      if (!order.customerEmail || seenEmails.has(order.customerEmail.toLowerCase())) continue;
      seenEmails.add(order.customerEmail.toLowerCase());

      const itemsSummary = order.items.map((it: any) => `${it.quantity}x ${it.productName} (${it.formatLabel || it.variantInfo})`).join(", ");
      const totalFormatted = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(order.totalAmount));
      const initials = order.customerName
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CL";

      const orderTime = new Date(order.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const customerMessages: InboxMessage[] = [
        {
          id: `msg_init_${order.id}`,
          content: `Commande #${order.orderNumber} validée pour un montant de ${totalFormatted} (${order.paymentMethod.toUpperCase()}). ${itemsSummary ? `Articles : ${itemsSummary}` : ""}`,
          sender: "other",
          time: orderTime,
          type: "order_event",
        },
        {
          id: `msg_status_${order.id}`,
          content: order.status === "DELIVERED"
            ? "Commande livrée à destination. E-mail de confirmation transmis au client."
            : order.status === "SHIPPED"
            ? "Colis en cours d'acheminement Colissimo. Numéro de suivi transmis au client."
            : order.status === "PROCESSING"
            ? "Commande en cours de préparation dans les ateliers Shammah."
            : "Paiement validé. En attente de préparation en atelier.",
          sender: "me",
          time: orderTime,
          type: "text",
        },
      ];

      customers.push({
        id: order.id,
        name: order.customerName || "Client Shammah",
        email: order.customerEmail,
        phone: order.customerPhone || undefined,
        initials,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        orderTotal: Number(order.totalAmount),
        shippingAddress: `${order.shippingStreet || ""}, ${order.shippingPostal || ""} ${order.shippingCity || ""}, ${order.shippingCountry || "France"}`,
        itemsCount: order.items.reduce((sum: number, it: any) => sum + it.quantity, 0),
        lastMessage: customerMessages[customerMessages.length - 1].content,
        time: orderTime,
        isActive: order.status === "PROCESSING" || order.status === "PAID",
        category: "customers",
        messages: customerMessages,
      });
    }

    // Realistic fashion conversations fallback
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production" && customers.length <= 1) {
      customers.push(
        {
          id: "cust_demo_1",
          name: "Amélie Fontaine",
          email: "amelie.fontaine@gmail.com",
          phone: "+33 6 42 18 90 22",
          initials: "AF",
          orderNumber: "DE-2026-0891",
          orderStatus: "PROCESSING",
          orderTotal: 189.0,
          shippingAddress: "28 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
          itemsCount: 1,
          lastMessage: "Bonjour, la robe taille-t-elle normalement ou convient-il de prendre une taille au-dessus ?",
          time: "14:20",
          unreadCount: 1,
          isActive: true,
          category: "customers",
          messages: [
            {
              id: "m_d1_1",
              content: "Commande #DE-2026-0891 passée : Robe de Soirée Soie Rouge Rubis (189,00 €).",
              sender: "other",
              time: "14:15",
              type: "order_event",
            },
            {
              id: "m_d1_2",
              content: "Bonjour, j'ai bien reçu la confirmation ! La robe taille-t-elle normalement au niveau du buste ?",
              sender: "other",
              time: "14:20",
              type: "text",
            },
          ],
        },
        {
          id: "cust_demo_2",
          name: "Marc Laurent",
          email: "m.laurent@orange.fr",
          phone: "+33 6 11 89 45 67",
          initials: "ML",
          orderNumber: "DE-2026-0888",
          orderStatus: "SHIPPED",
          orderTotal: 249.99,
          shippingAddress: "12 Avenue Victor Hugo, 69006 Lyon, France",
          itemsCount: 1,
          lastMessage: "Colis en cours d'acheminement Colissimo La Poste (FR-83920194).",
          time: "Hier",
          isActive: false,
          category: "customers",
          messages: [
            {
              id: "m_d2_1",
              content: "Commande #DE-2026-0888 : Costume Homme Sur-Mesure Noir Impérial (Taille 50).",
              sender: "other",
              time: "Hier 11:30",
              type: "order_event",
            },
            {
              id: "m_d2_2",
              content: "Votre costume a été soigneusement emballé sous housse protectrice et expédié via Colissimo Suivi (FR-83920194).",
              sender: "me",
              time: "Hier 15:45",
              type: "text",
            },
          ],
        },
        {
          id: "cust_demo_3",
          name: "Sonia Benali",
          email: "sonia.benali@outlook.fr",
          phone: "+33 7 80 12 34 56",
          initials: "SB",
          orderNumber: "DE-2026-0875",
          orderStatus: "DELIVERED",
          orderTotal: 129.0,
          shippingAddress: "5 Place de la Bourse, 33000 Bordeaux, France",
          itemsCount: 1,
          lastMessage: "La montre connectée est superbe et les finitions sont impeccables !",
          time: "Il y a 2 j",
          isActive: false,
          category: "customers",
          messages: [
            {
              id: "m_d3_1",
              content: "Commande #DE-2026-0875 livrée : Montre Connectée Smartwatch Édition Rose Gold.",
              sender: "me",
              time: "Il y a 3 j",
              type: "order_event",
            },
            {
              id: "m_d3_2",
              content: "Merci infiniment pour la rapidité de l'envoi, la montre connectée est superbe et le packaging est très soigné !",
              sender: "other",
              time: "Il y a 2 j",
              type: "text",
            },
          ],
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    console.error("Inbox GET failed:", error);
    return NextResponse.json(
      { success: false, error: "Service de messagerie indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, recipientEmail, customerName, subject, message, query, customerContext } = body;

    // Action 1: Ask Shammah Style AI Engine
    if (action === "ask_ai") {
      const answer = getShammahStyleReply(query || "", customerContext);
      return NextResponse.json({
        success: true,
        answer,
      });
    }

    // Action 2: Send Real Direct Email to Customer
    if (action === "send_email") {
      if (!recipientEmail || !message) {
        return NextResponse.json({ error: "Destinataire ou message manquant." }, { status: 400 });
      }

      const emailResult = await sendCustomerDirectMessageEmail({
        to: recipientEmail,
        customerName: customerName || "Cher Client",
        subject: subject || "Message concernant votre commande — Shammah",
        message,
      });

      if (!emailResult.success) {
        return NextResponse.json({ error: emailResult.error || "Échec de l'envoi de l'e-mail." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "E-mail envoyé avec succès au client.",
      });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error: any) {
    console.error("Inbox POST Error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur." }, { status: 500 });
  }
}
