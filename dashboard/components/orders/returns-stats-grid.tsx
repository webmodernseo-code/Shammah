"use client";

import React from "react";
import {
  RotateCcw,
  Hourglass,
  CheckCircle2,
  XCircle,
  Repeat,
} from "lucide-react";

interface ReturnsStatsGridProps {
  totalRequests?: number;
  processingCount?: number;
  refundedCount?: number;
  rejectedCount?: number;
  exchangeCount?: number;
}

export default function ReturnsStatsGrid({
  totalRequests = 5,
  processingCount = 2,
  refundedCount = 2,
  rejectedCount = 1,
  exchangeCount = 0,
}: ReturnsStatsGridProps) {
  const cards = [
    {
      id: "total",
      label: "Demandes reçues",
      value: String(totalRequests),
      trend: "↑ +25%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: RotateCcw,
      iconBox: "bg-sky-50 text-sky-600",
    },
    {
      id: "processing",
      label: "En traitement",
      value: String(processingCount),
      trend: "↑ +0%",
      trendColor: "text-amber-600",
      context: "vs période précédente",
      icon: Hourglass,
      iconBox: "bg-amber-50 text-amber-600",
    },
    {
      id: "refunded",
      label: "Remboursés",
      value: String(refundedCount),
      trend: "↑ +100%",
      trendColor: "text-emerald-600",
      context: "vs période précédente",
      icon: CheckCircle2,
      iconBox: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "rejected",
      label: "Refusés",
      value: String(rejectedCount),
      trend: "↓ -50%",
      trendColor: "text-rose-600",
      context: "vs période précédente",
      icon: XCircle,
      iconBox: "bg-rose-50 text-rose-600",
    },
    {
      id: "exchanges",
      label: "Échanges",
      value: String(exchangeCount),
      trend: "— 0%",
      trendColor: "text-slate-400",
      context: "vs période précédente",
      icon: Repeat,
      iconBox: "bg-purple-50 text-purple-600",
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
