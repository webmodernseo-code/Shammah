"use client";

import React from "react";
import {
  CreditCard,
  Wallet,
  Clock,
  XCircle,
} from "lucide-react";

interface PaymentsStatsGridProps {
  totalCount?: number;
  totalRevenue?: number;
  avgPayment?: number;
  pendingCount?: number;
  failedOrRefundedCount?: number;
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export default function PaymentsStatsGrid({
  totalCount = 3,
  totalRevenue = 553.89,
  avgPayment = 184.63,
  pendingCount = 0,
  failedOrRefundedCount = 0,
}: PaymentsStatsGridProps) {
  const cards = [
    {
      id: "received",
      label: "Paiements reçus",
      value: String(totalCount),
      trend: "↑ +50%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: CreditCard,
      iconBox: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "total_revenue",
      label: "Montant total encaissé",
      value: euros.format(totalRevenue),
      trend: "↑ +28%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: Wallet,
      iconBox: "bg-sky-50 text-sky-600",
    },
    {
      id: "avg_payment",
      label: "Paiement moyen",
      value: euros.format(avgPayment),
      trend: "↑ +12%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: CreditCard,
      iconBox: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "pending",
      label: "En attente",
      value: String(pendingCount),
      trend: "→ 0%",
      trendColor: "text-amber-600",
      context: "vs période précédente",
      icon: Clock,
      iconBox: "bg-amber-50 text-amber-600",
    },
    {
      id: "failed",
      label: "Échoués / Remboursés",
      value: String(failedOrRefundedCount),
      trend: "→ 0%",
      trendColor: "text-rose-600",
      context: "vs période précédente",
      icon: XCircle,
      iconBox: "bg-rose-50 text-rose-600",
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
