"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

interface MonthData {
  month: string;
  value: number;
  orders: number;
  full: string;
  isCurrent?: boolean;
}

export default function PeriodSalesBarChart() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        setMonths(Array.isArray(payload?.data?.monthlyRevenue) ? payload.data.monthlyRevenue : []);
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  const maxValue = useMemo(() => Math.max(...months.map((month) => month.value), 1), [months]);
  const total = months.reduce((sum, month) => sum + month.value, 0);

  return (
    <section className="flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesColumnIncreasing className="size-4 text-[#2b6b61]" strokeWidth={1.8} aria-hidden="true" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Ventes mensuelles</h2>
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Commandes payées des douze derniers mois</p>
        </div>
        <span className="inline-flex items-center self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:self-auto">
          12 derniers mois
        </span>
      </div>

      {unavailable ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-800">
          Données de ventes indisponibles. Aucun chiffre fictif n’est affiché.
        </div>
      ) : months.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
          Aucune vente payée enregistrée sur cette période.
        </div>
      ) : (
        <div className="relative pt-2">
          <div className="grid h-48 grid-cols-5 grid-rows-5 gap-0 border-b border-l border-slate-100">
            {[0, 1, 2, 3, 4].map((line) => <div key={line} className="col-span-5 border-t border-slate-100" />)}
            <div className="col-span-5 row-span-4 row-start-1 flex items-end gap-1 px-2 pb-1 pt-3 sm:gap-2">
              {months.map((item, index) => {
                const height = Math.max(item.value > 0 ? 4 : 0, (item.value / maxValue) * 100);
                const isHovered = hoveredIdx === index;
                return (
                  <div key={`${item.month}-${index}`} className="group relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHoveredIdx(index)} onMouseLeave={() => setHoveredIdx(null)}>
                    {isHovered && <div className="absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] text-white shadow-lg"><strong>{item.full}</strong><br />{item.orders} commande{item.orders > 1 ? "s" : ""}</div>}
                    <div className={`w-full max-w-7 rounded-t-md transition-colors ${isHovered || item.isCurrent ? "bg-[#2b6b61]" : "bg-[#75aca2]/70 group-hover:bg-[#2b6b61]"}`} style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex justify-between pl-2 text-[10px] font-medium text-slate-400">
            {months.filter((_, index) => index === 0 || index === Math.floor(months.length / 2) || index === months.length - 1).map((month, index) => <span key={`${month.month}-${index}`}>{month.month}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
