"use client";

import { useEffect, useState } from "react";
import { BadgeEuro, ChartNoAxesCombined, ShoppingBag, UsersRound } from "lucide-react";

type Summary = {
  revenue: number;
  revenueTrend: number | null;
  paidOrders: number;
  averageOrder: number;
  totalCustomers: number;
};

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const cards = [
  { id: "revenue", label: "Chiffre d’affaires", icon: ChartNoAxesCombined, iconBox: "bg-[#2b6b61]/10 text-[#2b6b61] border-[#2b6b61]/20" },
  { id: "orders", label: "Commandes payées", icon: ShoppingBag, iconBox: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { id: "basket", label: "Panier moyen", icon: BadgeEuro, iconBox: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { id: "customers", label: "Clients enregistrés", icon: UsersRound, iconBox: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
] as const;

export default function DashboardStatsGrid() {
  const [data, setData] = useState<Summary | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        if (!payload?.data) throw new Error("summary_empty");
        setData(payload.data as Summary);
      })
      .catch(() => setUnavailable(true));
  }, []);

  if (unavailable) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Les indicateurs sont momentanément indisponibles. Aucune donnée de démonstration n’est affichée.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = !data
          ? "—"
          : card.id === "revenue"
            ? euros.format(data.revenue)
            : card.id === "orders"
              ? data.paidOrders.toLocaleString("fr-FR")
              : card.id === "basket"
                ? euros.format(data.averageOrder)
                : data.totalCustomers.toLocaleString("fr-FR");
        const showTrend = card.id === "revenue" && data?.revenueTrend !== null && data?.revenueTrend !== undefined;

        return (
          <article key={card.id} className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105 ${card.iconBox}`}>
                <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-tight text-slate-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-900">{value}</p>
              </div>
            </div>
            <div className="mt-4 min-h-5 text-[11px] text-slate-400">
              {showTrend ? (
                <span className={data.revenueTrend! >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                  {data.revenueTrend! >= 0 ? "+" : ""}{data.revenueTrend!.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % vs mois précédent
                </span>
              ) : (
                "Valeur calculée depuis les données enregistrées"
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
