"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, WalletCards } from "lucide-react";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function AbandonedCartSummaryWidget() {
  const [data, setData] = useState<{ count: number; revenue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        setData({ count: Number(payload?.data?.pendingOrders) || 0, revenue: Number(payload?.data?.pendingRevenue) || 0 });
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  return <section className="flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
    <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 className="size-4 text-orange-500" strokeWidth={1.8} aria-hidden="true" /><h2 className="text-sm font-semibold tracking-tight text-slate-900">Paiements en attente</h2></div><Link href="/abandon-cart" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2b6b61]">Voir le détail <ArrowRight className="size-3" /></Link></div>
    {unavailable ? <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm text-rose-800">Données de paiement indisponibles.</div> : loading ? <div className="py-8 text-center text-sm text-slate-400">Chargement…</div> : <div className="flex items-center justify-between gap-4 py-2"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600"><WalletCards className="size-5" strokeWidth={1.8} /></div><div><span className="block text-2xl font-bold leading-tight text-slate-900">{data?.count.toLocaleString("fr-FR")}</span><span className="text-xs text-slate-400">commandes sans paiement finalisé</span></div></div><div className="text-right"><span className="block text-xl font-bold leading-tight text-slate-900">{euros.format(data?.revenue || 0)}</span><span className="text-xs text-slate-400">montant en attente</span></div></div>}
  </section>;
}
