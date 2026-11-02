import React from "react";
import ChatbotSettingsForm from "@/components/settings/chatbot/chatbot-settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support WhatsApp & Chatbot | Shammah",
  description: "Configurez le numéro WhatsApp et les réponses du chatbot d'assistance.",
};

export default function ChatbotSettingsPage() {
  return <ChatbotSettingsForm />;
}
