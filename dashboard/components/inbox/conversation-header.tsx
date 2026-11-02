"use client";

import React from "react";
import Link from "next/link";
import { User } from "./data";
import {
  Sparkles,
  ExternalLink,
  Mail,
  Menu as MenuIcon,
  Phone,
  ShieldCheck,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConversationHeader({
  user,
  onMobileMenuClick,
  onOpenEmailModal,
}: {
  user: User;
  onMobileMenuClick?: () => void;
  onOpenEmailModal?: () => void;
}) {
  const isAi = user.category === "ai";
  const whatsappUrl = user.phone
    ? `https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Bonjour ${user.name}, je vous contacte au sujet de votre commande ${user.orderNumber || ""} sur DivinExpress Mode.`,
      )}`
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-white gap-3">
      {/* Left: User Identity */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
        >
          <MenuIcon className="size-4" />
        </button>

        <div className="relative shrink-0">
          {isAi ? (
            <div className="size-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="size-6 text-amber-300" />
            </div>
          ) : (
            <div className="size-11 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 font-bold text-sm flex items-center justify-center shadow-2xs">
              {user.initials}
            </div>
          )}
          {user.isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {user.name}
            </h3>
            {user.orderNumber && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                Commande #{user.orderNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {user.email} {user.phone ? `• ${user.phone}` : ""}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isAi && whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs font-bold whitespace-nowrap"
          >
            <span>WhatsApp</span>
            <ExternalLink className="size-3 text-emerald-700" />
          </a>
        )}

        {!isAi && (
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            <Mail className="size-3.5 text-gray-600" />
            <span>Envoyer E-mail</span>
          </button>
        )}

        {user.orderNumber && (
          <Link
            href={`/orders`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors text-xs font-bold whitespace-nowrap"
          >
            <Package className="size-3.5 text-gray-600" />
            <span>Fiche Commande</span>
          </Link>
        )}
      </div>
    </div>
  );
}
