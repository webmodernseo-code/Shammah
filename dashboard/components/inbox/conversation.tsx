"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Mail,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConversationHeader from "./conversation-header";
import { User, Message } from "./data";

const QUICK_AI_PROMPTS = [
  { label: "📏 Guide des Tailles", prompt: "Comment orienter un client indécis entre les tailles M et L ?" },
  { label: "🚚 Délais Colissimo", prompt: "Quels sont les délais d'expédition et conditions de livraison offerte ?" },
  { label: "✨ Entretien Laine/Soie", prompt: "Quels sont les conseils d'entretien pour costume en laine vierge et robe en soie ?" },
  { label: "🧾 Facture PDF", prompt: "Comment générer et transmettre la facture officielle d'une commande ?" },
  { label: "🔄 Retours & Échanges", prompt: "Quelle est la procédure pour un échange de taille ou retour sous 14 jours ?" },
];

export function ChatWindow({
  selectedUser,
  onMobileMenuClick,
  onUpdateUserMessages,
}: {
  selectedUser: User;
  onMobileMenuClick?: () => void;
  onUpdateUserMessages?: (userId: string, newMsg: Message) => void;
}) {
  const [messages, setMessages] = useState<Message[]>(selectedUser.messages || []);
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    selectedUser.orderNumber
      ? `Information concernant votre commande #${selectedUser.orderNumber} — DivinExpress`
      : "Message du service client — DivinExpress",
  );
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAiChannel = selectedUser.category === "ai";

  // Sync messages when selected user changes
  useEffect(() => {
    setMessages(selectedUser.messages || []);
    setEmailSubject(
      selectedUser.orderNumber
        ? `Information concernant votre commande #${selectedUser.orderNumber} — DivinExpress`
        : "Message du service client — DivinExpress",
    );
  }, [selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  // Send Message logic
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      content: text,
      sender: "me",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessages((prev) => [...prev, newMsg]);
    onUpdateUserMessages?.(selectedUser.id, newMsg);
    if (!textToSend) setInputText("");

    // If AI channel or requesting AI support
    if (isAiChannel) {
      setIsAiLoading(true);
      try {
        const res = await fetch("/api/admin/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ai_ask",
            question: text,
            customerContext: {
              name: selectedUser.name,
              orderNumber: selectedUser.orderNumber,
              orderStatus: selectedUser.orderStatus,
            },
          }),
        });

        const data = await res.json();
        if (data.success && data.answer) {
          const botReply: Message = {
            id: `msg_bot_${Date.now()}`,
            content: data.answer,
            sender: "bot",
            time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            type: "ai_suggestion",
          };
          setMessages((prev) => [...prev, botReply]);
          onUpdateUserMessages?.(selectedUser.id, botReply);
        }
      } catch (err) {
        console.warn("AI generation failed:", err);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  // Quick Prompt Click
  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Send Real Email Modal Submit
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody.trim()) {
      toast.error("Veuillez saisir le contenu du message.");
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_email",
          recipientEmail: selectedUser.email,
          customerName: selectedUser.name,
          subject: emailSubject,
          message: emailBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`E-mail envoyé avec succès à ${selectedUser.email} !`);

      const sentMsg: Message = {
        id: `email_sent_${Date.now()}`,
        content: `[E-mail envoyé à ${selectedUser.email}]\nObjet : ${emailSubject}\n\n${emailBody}`,
        sender: "me",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };

      setMessages((prev) => [...prev, sentMsg]);
      onUpdateUserMessages?.(selectedUser.id, sentMsg);

      setEmailBody("");
      setIsEmailModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Impossible d'envoyer l'e-mail.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Conversation Header */}
      <ConversationHeader
        user={selectedUser}
        onMobileMenuClick={onMobileMenuClick}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
      />

      {/* Main Area: Chat + Collapsible Customer Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gray-50/40">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                <Sparkles className="size-8 text-primary mb-2 opacity-50" />
                <p className="text-sm font-semibold text-gray-700">Début de la conversation</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Échangez directement avec le client ou posez vos questions à la Conseillère Style IA DivinExpress.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === "me";
                const isBot = msg.sender === "bot";
                const isEvent = msg.type === "order_event";

                if (isEvent) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs px-4 py-2 rounded-2xl max-w-md text-center font-medium shadow-2xs">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[75%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs",
                        isMe
                          ? "bg-primary text-white rounded-br-none"
                          : isBot
                          ? "bg-white border border-emerald-200 text-gray-900 rounded-bl-none shadow-xs"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none",
                      )}
                    >
                      {isBot && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1.5 pb-1 border-b border-gray-100">
                          <Sparkles className="size-3 text-amber-500" />
                          <span>Conseillère Style DivinExpress</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })
            )}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-2xl w-fit">
                <RefreshCw className="size-3.5 animate-spin text-primary" />
                <span>Conseillère Style IA formule une recommandation...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick AI Suggestions Bar */}
          <div className="px-4 sm:px-6 py-2 bg-white/90 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-primary whitespace-nowrap flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" />
              <span>Suggestions IA :</span>
            </span>
            {QUICK_AI_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(qp.prompt)}
                className="text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-primary border border-gray-200 hover:border-emerald-300 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-gray-50 border border-gray-300 focus-within:border-primary focus-within:bg-white rounded-2xl px-3 py-1.5 transition-all shadow-xs"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isAiChannel
                    ? "Posez une question sur le style, les tailles ou les commandes..."
                    : `Répondre à ${selectedUser.name} ou demander une suggestion...`
                }
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 focus:outline-none placeholder:text-gray-400 py-1.5"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="size-9 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Customer Summary Panel (Desktop Only) */}
        {!isAiChannel && (
          <div className="w-72 border-l border-gray-200 bg-white p-5 space-y-5 hidden xl:block overflow-y-auto">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Fiche Récapitulative Client
            </h4>

            {/* Profile */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary-dark text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {selectedUser.initials}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">{selectedUser.name}</h5>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="text-xs text-gray-600 flex items-center gap-2 pt-1 border-t border-gray-200/80">
                  <Phone className="size-3.5 text-gray-400" />
                  <span>{selectedUser.phone}</span>
                </div>
              )}
            </div>

            {/* Order Overview */}
            {selectedUser.orderNumber && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">
                    Commande #{selectedUser.orderNumber}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedUser.orderStatus || "Payée"}
                  </span>
                </div>

                {selectedUser.orderTotal && (
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span>Montant total :</span>
                    <strong className="text-sm font-black text-gray-950">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                        selectedUser.orderTotal,
                      )}
                    </strong>
                  </div>
                )}

                {selectedUser.shippingAddress && (
                  <div className="text-xs text-gray-600 pt-2 border-t border-emerald-200/80 flex items-start gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-snug">{selectedUser.shippingAddress}</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Email Action */}
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Mail className="size-4" />
              <span>Rédiger un E-mail au Client</span>
            </button>
          </div>
        )}
      </div>

      {/* Direct Email Compose Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Envoyer un E-mail au Client</h3>
                  <p className="text-xs text-gray-500">Destinataire : {selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Objet du message
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Contenu du message
                </label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={`Bonjour ${selectedUser.name},\n\nNous faisons suite à votre demande concernant...`}
                  className="w-full p-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Envoyer l'e-mail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
