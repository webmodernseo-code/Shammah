"use client";

import React from "react";
import {
  ShoppingCart,
  Coins,
  ShoppingBag,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface OrdersStatsGridProps {
  totalCount?: number;
  totalRevenue?: number;
  avgOrderValue?: number;
  toShipCount?: number;
  deliveredCount?: number;
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export default function OrdersStatsGrid({
  totalCount = 3,
  totalRevenue = 671.89,
  avgOrderValue = 223.96,
  toShipCount = 1,
  deliveredCount = 1,
}: OrdersStatsGridProps) {
  const cards = [
    {
      id: "total",
      label: "Total commandes",
      value: String(totalCount),
      trend: "↑ +50%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: ShoppingCart,
      iconBox: "bg-emerald-50 text-[#2b6b61]",
    },
    {
      id: "revenue",
      label: "Chiffre d'affaires",
      value: euros.format(totalRevenue),
      trend: "↑ +12%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: Coins,
      iconBox: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "avg",
      label: "Panier moyen",
      value: euros.format(avgOrderValue),
      trend: "↑ +8%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: ShoppingBag,
      iconBox: "bg-teal-50 text-teal-600",
    },
    {
      id: "to_ship",
      label: "À expédier",
      value: String(toShipCount),
      trend: "→ 0%",
      trendColor: "text-amber-600",
      context: "en attente",
      icon: Truck,
      iconBox: "bg-amber-50 text-amber-600",
    },
    {
      id: "delivered",
      label: "Livrées",
      value: String(deliveredCount),
      trend: "↑ +100%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: CheckCircle2,
      iconBox: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            {/* Top row: pastel icon box + label */}
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

            {/* Bottom: Trend and context */}
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
