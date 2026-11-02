export interface Message {
  id: string;
  content: string;
  sender: "me" | "other" | "bot";
  time: string;
  type?: "text" | "order_event" | "ai_suggestion";
}

export interface User {
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
  messages: Message[];
}

export const INITIAL_AI_USER: User = {
  id: "ai-stylist-divinexpress",
  name: "Conseillère Style IA (DivinExpress Pro)",
  email: "styliste@divinexpress.com",
  avatar: "/branding/logo-divinexpress.png",
  initials: "IA",
  lastMessage: "Posez-moi une question sur le guide des tailles, les matières ou les commandes clients...",
  time: "En direct",
  isActive: true,
  category: "ai",
  messages: [
    {
      id: "m_ai_1",
      content: "Bonjour ! Je suis votre Conseillère Style & Support IA DivinExpress. Je peux vous aider à rédiger des réponses aux questions clients (guide des tailles, conseils d'entretien matières nobles, expéditions Colissimo et politique d'échange).",
      sender: "bot",
      time: "En direct",
      type: "text",
    },
  ],
};
