"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Plus,
} from "lucide-react";

interface StockOverviewProps {
  totalCount: number;
  totalUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  onExportCsv?: () => void;
  onOpenQuickAdd?: () => void;
}

export default function StockOverview({
  totalCount,
  totalUnits,
  inStockCount,
  lowStockCount,
  outOfStockCount,
  onExportCsv,
  onOpenQuickAdd,
}: StockOverviewProps) {
  const stockCards = [
    {
      title: "Articles au Catalogue",
      subtitle: `${totalUnits} pièces physiques au total`,
      value: String(totalCount),
      icon: Package,
      bgClass: "bg-indigo-50/80 border border-indigo-200/80 text-indigo-950",
      iconBg: "bg-indigo-100 text-indigo-700",
      accent: "text-indigo-700",
    },
    {
      title: "En Stock Optimal",
      subtitle: "> 20 unités par modèle",
      value: String(inStockCount),
      icon: CheckCircle2,
      bgClass: "bg-emerald-50/80 border border-emerald-200/80 text-emerald-950",
      iconBg: "bg-emerald-100 text-emerald-700",
      accent: "text-emerald-700",
    },
    {
      title: "Stock Faible (Alerte)",
      subtitle: "≤ 20 pièces restantes",
      value: String(lowStockCount),
      icon: AlertTriangle,
      bgClass: "bg-amber-50/80 border border-amber-200/80 text-amber-950",
      iconBg: "bg-amber-100 text-amber-700",
      accent: "text-amber-700",
    },
    {
      title: "Rupture de Stock",
      subtitle: "0 pièce disponible",
      value: String(outOfStockCount),
      icon: XCircle,
      bgClass: "bg-rose-50/80 border border-rose-200/80 text-rose-950",
      iconBg: "bg-rose-100 text-rose-700",
      accent: "text-rose-700",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Gestion des Stocks & Tailles Mode
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Suivi des niveaux d'inventaire, déclinaisons de tailles et réassorts DivinExpress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onExportCsv}
            variant="outline"
            size="xs"
            className="rounded-full flex items-center gap-1.5 text-xs font-bold border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5" />
            <span>Exporter Inventaire CSV</span>
          </Button>

          {onOpenQuickAdd ? (
            <Button
              onClick={onOpenQuickAdd}
              size="xs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Ajuster le Stock</span>
            </Button>
          ) : (
            <Button
              href="/products/stocks/add"
              size="xs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Ajuster le Stock</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stockCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgClass} rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs transition-all hover:shadow-xs`}
          >
            <div
              className={`size-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <card.icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-600 truncate">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-gray-950">
                  {card.value}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
