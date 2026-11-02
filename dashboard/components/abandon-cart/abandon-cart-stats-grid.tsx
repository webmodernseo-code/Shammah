"use client";

import React from "react";
import {
  ShoppingCart,
  Users,
  Clock,
  Mail,
} from "lucide-react";

interface AbandonCartStatsGridProps {
  totalCarts?: number;
  totalCustomers?: number;
  potentialRevenue?: number;
  emailsSent?: number;
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export default function AbandonCartStatsGrid({
  totalCarts = 8,
  totalCustomers = 6,
  potentialRevenue = 1237.50,
  emailsSent = 12,
}: AbandonCartStatsGridProps) {
  const cards = [
    {
      id: "carts",
      label: "Paniers abandonnés",
      value: String(totalCarts),
      trend: "↑ +14%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: ShoppingCart,
      iconBox: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "customers",
      label: "Clients concernés",
      value: String(totalCustomers),
      trend: "↑ +20%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: Users,
      iconBox: "bg-sky-50 text-sky-600",
    },
    {
      id: "potential_revenue",
      label: "Montant potentiel",
      value: euros.format(potentialRevenue),
      trend: "↓ -8%",
      trendColor: "text-rose-600",
      context: "vs période précédente",
      icon: Clock,
      iconBox: "bg-amber-50 text-amber-600",
    },
    {
      id: "emails_sent",
      label: "Emails envoyés",
      value: String(emailsSent),
      trend: "↑ +33%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: Mail,
      iconBox: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            {/* Top row: Icon + Label + Value */}
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBox}`}
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">
                  {card.label}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Bottom: Trend and Context */}
            <div className="flex items-center gap-1.5 text-xs pt-1">
              <span className={`font-semibold ${card.trendColor}`}>
                {card.trend}
              </span>
              <span className="text-slate-400 text-[11px] font-normal truncate">
                {card.context}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
