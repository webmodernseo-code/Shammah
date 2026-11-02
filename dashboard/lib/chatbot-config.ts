export interface ChatbotConfig {
  whatsappNumber: string;
  assistantName: string;
  welcomeMessage: string;
  defaultWhatsappMessage: string;
  isEnabled: boolean;
}

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  whatsappNumber: "+33612345678",
  assistantName: "Conseillère Style Shammah",
  welcomeMessage:
    "Bonjour ! Bienvenue chez Shammah Mode. Comment puis-je vous guider dans vos choix de vêtements et accessoires aujourd'hui ?",
  defaultWhatsappMessage:
    "Bonjour ! J'aimerais avoir des conseils sur une taille ou un modèle de vêtement Shammah.",
  isEnabled: true,
};

const STORAGE_KEY = "shammah_chatbot_config_v1";

export function getChatbotConfig(): ChatbotConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CHATBOT_CONFIG;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CHATBOT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_CHATBOT_CONFIG;
}

export function saveChatbotConfig(config: Partial<ChatbotConfig>): ChatbotConfig {
  const current = getChatbotConfig();
  const updated = { ...current, ...config };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("shammah_chatbot_config_updated"));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function formatWhatsappUrl(number: string, message: string): string {
  let cleanNumber = number.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("330")) {
    cleanNumber = "33" + cleanNumber.slice(3);
  } else if (cleanNumber.startsWith("0")) {
    cleanNumber = "33" + cleanNumber.slice(1);
  }
  if (!cleanNumber) {
    cleanNumber = "33612345678";
  }
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
