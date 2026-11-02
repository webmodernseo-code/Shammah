"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MessageItem {
  id: string;
  sender: string;
  initials: string;
  time: string;
  preview: string;
}

const recentMessages: MessageItem[] = [
  {
    id: "msg-1",
    sender: "Marie Dupont",
    initials: "MD",
    time: "10:24",
    preview: "Bonjour, ma commande sera-t-elle livrée avant samedi ?",
  },
  {
    id: "msg-2",
    sender: "Thomas Leroy",
    initials: "TL",
    time: "09:17",
    preview: "Merci pour la rapidité !",
  },
  {
    id: "msg-3",
    sender: "Aissatou Diallo",
    initials: "AD",
    time: "Hier",
    preview: "Puis-je échanger la taille de cet article ?",
  },
];

export default function RecentMessagesWidget() {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
          Messages récents
        </h2>
        <Link
          href="/inbox"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#2b6b61] hover:text-[#22564e] transition-colors"
        >
          <span>Voir tous</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5 my-auto">
        {recentMessages.map((msg) => (
          <Link
            key={msg.id}
            href="/inbox"
            className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-gray-50/80 transition-colors group"
          >
            {/* Avatar Initials Circle */}
            <div className="size-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-300 transition-colors">
              {msg.initials}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {msg.sender}
                </p>
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                  {msg.time}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-700">
                {msg.preview}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
