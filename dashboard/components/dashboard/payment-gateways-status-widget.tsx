"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, CircleAlert, ShieldCheck } from "lucide-react";
import { StripeLogo, PaypalLogo } from "@/components/common/payment-icons";

interface Gateway { id: "stripe" | "paypal"; name: string; subtitle: string; configured: boolean; enabled: boolean; logo: ReactNode; }

export default function PaymentGatewaysStatusWidget() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    fetch("/api/settings/payment-gateways", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) { setRestricted(true); return; }
        if (!response.ok) throw new Error("gateway_unavailable");
        const payload = await response.json();
        const stripe = payload?.data?.stripe;
        const paypal = payload?.data?.paypal;
        setGateways([
          { id: "stripe", name: "Stripe", subtitle: "Cartes bancaires et wallets", configured: Boolean(stripe?.hasSecretKey), enabled: Boolean(stripe?.isEnabled), logo: <StripeLogo className="h-4 w-auto" /> },
          { id: "paypal", name: "PayPal", subtitle: "PayPal Checkout", configured: Boolean(paypal?.hasSecretKey), enabled: Boolean(paypal?.isEnabled), logo: <PaypalLogo className="h-4 w-auto" /> },
        ]);
      })
      .catch(() => setRestricted(true))
      .finally(() => setLoading(false));
  }, []);

  return <section className="flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#2b6b61]" strokeWidth={1.8} aria-hidden="true" /><h2 className="text-sm font-bold tracking-tight text-slate-900">Passerelles de paiement</h2></div><Link href="/settings/payment-api" className="text-xs font-semibold text-[#2b6b61]">Gérer</Link></div>{loading ? <div className="py-8 text-center text-sm text-slate-400">Vérification de la configuration…</div> : restricted ? <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"><CircleAlert className="mb-2 size-5" />État réservé aux super-administrateurs.</div> : <div className="space-y-2.5">{gateways.map((gateway) => <Link key={gateway.id} href="/settings/payment-api" className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-all hover:border-slate-300 hover:bg-slate-50/80"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-xl border px-2 shadow-2xs ${gateway.id === "paypal" ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>{gateway.logo}</div><div className="min-w-0"><p className="text-xs font-bold leading-tight text-slate-900">{gateway.name}</p><p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{gateway.subtitle}</p></div></div><div className="flex shrink-0 items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${gateway.configured && gateway.enabled ? "border-emerald-200/80 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}><span className="size-1.5 rounded-full bg-current" />{gateway.configured && gateway.enabled ? "Actif" : gateway.configured ? "Désactivé" : "Non configuré"}</span><ChevronRight className="size-4 text-slate-400 group-hover:text-slate-800" /></div></Link>)}</div>}</section>;
}
