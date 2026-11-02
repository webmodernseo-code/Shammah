"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Package } from "lucide-react";
import { StripeLogo, PaypalLogo, ApplePayLogo } from "@/components/common/payment-icons";

type Status = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
interface OrderRow { id: string; orderNumber: string; customerName: string; date: string; amount: number; status: Status; statusLabel: string; paymentMethod: "stripe" | "paypal" | "apple_pay"; }

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const labels: Record<Status, string> = { PENDING: "En attente", PAID: "Payée", PROCESSING: "En préparation", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée", REFUNDED: "Remboursée" };

function StatusBadge({ status, label }: { status: Status; label: string }) {
  const styles: Record<Status, string> = { PENDING: "bg-amber-50 text-amber-900 border-amber-200/80", PAID: "bg-sky-50 text-sky-900 border-sky-200/80", PROCESSING: "bg-orange-50 text-orange-900 border-orange-200/80", SHIPPED: "bg-emerald-50 text-emerald-900 border-emerald-200/80", DELIVERED: "bg-emerald-50 text-emerald-900 border-emerald-200/80", CANCELLED: "bg-rose-50 text-rose-900 border-rose-200/80", REFUNDED: "bg-violet-50 text-violet-900 border-violet-200/80" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>;
}

function PaymentLogoPill({ method }: { method: OrderRow["paymentMethod"] }) {
  const logo = method === "paypal" ? <PaypalLogo className="h-3.5 w-auto" /> : method === "apple_pay" ? <ApplePayLogo className="h-3.5 w-auto" /> : <StripeLogo className="h-3.5 w-auto" />;
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 shadow-2xs ${method === "apple_pay" ? "border-black bg-black text-white" : "border-slate-200 bg-white"}`}>{logo}</span>;
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary_unavailable");
        const payload = await response.json();
        const recent = Array.isArray(payload?.data?.recentOrders) ? payload.data.recentOrders : [];
        setOrders(recent.slice(0, 5).map((order: { id: string; orderNumber: string; customerName: string; totalAmount: number; status: Status; paymentMethod?: string; createdAt: string }) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          date: new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt)),
          amount: Number(order.totalAmount),
          status: order.status,
          statusLabel: labels[order.status] || order.status,
          paymentMethod: order.paymentMethod?.toLowerCase().includes("paypal") ? "paypal" : order.paymentMethod?.toLowerCase().includes("apple") ? "apple_pay" : "stripe",
        })));
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  return <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold tracking-tight text-slate-900">Dernières commandes</h2><Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2b6b61]">Voir toutes <ArrowRight className="size-3.5" /></Link></div>
    {unavailable ? <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm text-rose-800">Données de commandes indisponibles.</div> : loading ? <div className="py-8 text-center text-sm text-slate-400">Chargement des commandes…</div> : orders.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"><Package className="mx-auto mb-2 size-5" />Aucune commande enregistrée.</div> : <div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400"><th className="pb-3">Commande</th><th className="pb-3">Client</th><th className="pb-3">Date</th><th className="pb-3">Montant</th><th className="pb-3">Statut</th><th className="pb-3">Paiement</th><th /></tr></thead><tbody className="divide-y divide-slate-100/70 text-xs">{orders.map((order) => <tr key={order.id} className="transition-colors hover:bg-slate-50/80"><td className="py-3.5"><Link href={`/orders/${order.id}`} className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:text-[#2b6b61]"><span className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"><Package className="size-4" /></span>{order.orderNumber}</Link></td><td className="whitespace-nowrap py-3.5 font-semibold text-slate-800">{order.customerName}</td><td className="whitespace-nowrap py-3.5 font-medium text-slate-500">{order.date}</td><td className="whitespace-nowrap py-3.5 font-bold text-slate-900">{euros.format(order.amount)}</td><td className="whitespace-nowrap py-3.5"><StatusBadge status={order.status} label={order.statusLabel} /></td><td className="whitespace-nowrap py-3.5"><PaymentLogoPill method={order.paymentMethod} /></td><td className="py-3.5 text-right"><Link href={`/orders/${order.id}`} aria-label={`Voir la commande ${order.orderNumber}`} className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><ChevronRight className="size-4" /></Link></td></tr>)}</tbody></table></div>}
  </section>;
}
