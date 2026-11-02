"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart } from "lucide-react";

interface StatusItem {
  id: string;
  label: string;
  count: number;
  color: string;
  dotBg: string;
}

const COLORS: Record<string, { color: string; dotBg: string }> = {
  DELIVERED: { color: "#059669", dotBg: "bg-emerald-600" },
  SHIPPED: { color: "#0284c7", dotBg: "bg-sky-600" },
  PROCESSING: { color: "#d97706", dotBg: "bg-amber-600" },
  PENDING: { color: "#6366f1", dotBg: "bg-indigo-500" },
  REFUNDED: { color: "#e11d48", dotBg: "bg-rose-600" },
};

export default function OrdersDistributionDonut() {
  const [items, setItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        const breakdown = Array.isArray(payload?.data?.statusBreakdown) ? payload.data.statusBreakdown : [];
        setItems(breakdown.map((item: { status: string; label: string; count: number }) => ({
          id: item.status,
          label: item.label,
          count: Number(item.count) || 0,
          ...(COLORS[item.status] || { color: "#94a3b8", dotBg: "bg-slate-400" }),
        })));
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = items.reduce((total, item) => total + item.count, 0);
  const validItems = useMemo(() => items.filter((item) => item.count > 0), [items]);

  return (
    <section className="flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="size-4 text-[#2b6b61]" strokeWidth={1.8} aria-hidden="true" />
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Répartition des commandes</h2>
      </div>

      {unavailable ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-800">Données de commandes indisponibles.</div>
      ) : loading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">Chargement des données…</div>
      ) : totalOrders === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">Aucune commande enregistrée.</div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-2 sm:flex-row sm:justify-between">
          <div className="relative flex size-[160px] shrink-0 items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
              {validItems.map((item, index) => {
                const percentage = item.count / totalOrders;
                const precedingCount = validItems
                  .slice(0, index)
                  .reduce((sum, precedingItem) => sum + precedingItem.count, 0);
                const dashOffset = -(precedingCount / totalOrders) * circumference;
                return <circle key={item.id} cx={size / 2} cy={size / 2} r={radius} stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${percentage * circumference} ${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" fill="transparent" />;
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-xl font-bold text-slate-900">{totalOrders.toLocaleString("fr-FR")}</span><span className="text-[11px] font-medium text-slate-400">commandes</span></div>
          </div>
          <div className="w-full flex-1 space-y-3">
            {items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-xs"><div className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${item.dotBg}`} /><span className="truncate font-medium text-slate-600">{item.label}</span></div><span className="shrink-0 font-bold text-slate-900">{item.count.toLocaleString("fr-FR")}</span></div>)}
          </div>
        </div>
      )}
    </section>
  );
}
