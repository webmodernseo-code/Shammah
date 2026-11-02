"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  Truck,
  PackageCheck,
  CheckCircle2,
  RotateCcw,
  Printer,
  X,
  Send,
  Package,
  Download,
} from "lucide-react";
import { StripeLogo, PaypalLogo, ApplePayLogo } from "@/components/common/payment-icons";
import OrdersStatsGrid from "./orders-stats-grid";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemSummary {
  productName: string;
  formatLabel: string;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingStreet: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemSummary[];
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function formatDate(isoString: string) {
  const d = new Date(isoString);
  const dateFormatted = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateFormatted, timeFormatted };
}

function StatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          <span>Livrée</span>
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80">
          <span className="size-1.5 rounded-full bg-blue-600" />
          <span>Expédiée</span>
        </span>
      );
    case "PROCESSING":
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200/80">
          <span className="size-1.5 rounded-full bg-orange-500" />
          <span>En préparation</span>
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
          <span className="size-1.5 rounded-full bg-amber-500" />
          <span>En attente</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
          <span className="size-1.5 rounded-full bg-rose-500" />
          <span>Annulée</span>
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200/80">
          <span className="size-1.5 rounded-full bg-purple-600" />
          <span>Remboursée</span>
        </span>
      );
  }
}

function PaymentBadge({ method }: { method: string }) {
  const m = (method || "").toLowerCase();
  if (m.includes("paypal")) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
          <PaypalLogo className="h-3 w-auto" />
        </div>
        <span className="text-[10px] text-slate-400 font-medium">PayPal</span>
      </div>
    );
  }
  if (m.includes("apple")) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black text-white shadow-2xs">
          <ApplePayLogo className="h-3.5 w-auto" />
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Apple Pay</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
        <StripeLogo className="h-3.5 w-auto" />
      </div>
      <span className="text-[10px] text-slate-400 font-medium">Carte bancaire</span>
    </div>
  );
}

export default function OrderTable() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Shipment Modal State
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<AdminOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("Colissimo La Poste");
  const [isSubmittingShipment, setIsSubmittingShipment] = useState(false);

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "orders_unavailable");
        return payload;
      })
      .then((payload) => {
        setOrders(Array.isArray(payload.data) ? (payload.data as AdminOrder[]) : []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  // Tab Counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };
    orders.forEach((o) => {
      if (o.status === "PAID" || o.status === "PROCESSING") counts.PROCESSING += 1;
      else if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  // KPI Calculations
  const totalCount = orders.length;
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  }, [orders]);
  const avgOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;
  const toShipCount = tabCounts.PROCESSING || 0;
  const deliveredCount = tabCounts.DELIVERED || 0;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !query ||
        `${o.orderNumber} ${o.customerName} ${o.customerEmail} ${o.shippingCity}`
          .toLowerCase()
          .includes(query.toLowerCase());

      let matchTab = true;
      if (activeTab === "PENDING") matchTab = o.status === "PENDING";
      else if (activeTab === "PROCESSING") matchTab = o.status === "PROCESSING" || o.status === "PAID";
      else if (activeTab === "SHIPPED") matchTab = o.status === "SHIPPED";
      else if (activeTab === "DELIVERED") matchTab = o.status === "DELIVERED";
      else if (activeTab === "CANCELLED") matchTab = o.status === "CANCELLED";
      else if (activeTab === "REFUNDED") matchTab = o.status === "REFUNDED";

      let matchPayment = true;
      if (selectedPayment !== "ALL") {
        matchPayment = o.paymentMethod?.toLowerCase().includes(selectedPayment.toLowerCase());
      }

      let matchDate = true;
      if (selectedDate !== "ALL" && o.createdAt) {
        const orderTime = new Date(o.createdAt).getTime();
        const now = Date.now();
        if (selectedDate === "today") {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          matchDate = orderTime >= startOfToday;
        } else if (selectedDate === "7d") {
          matchDate = orderTime >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (selectedDate === "30d") {
          matchDate = orderTime >= now - 30 * 24 * 60 * 60 * 1000;
        }
      }

      return matchSearch && matchTab && matchPayment && matchDate;
    });
  }, [orders, query, activeTab, selectedPayment, selectedDate]);

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    toast.success(`N° de commande ${num} copié`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Statut mis à jour : ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setOpenActionMenuId(null);
    } catch {
      toast.error("Impossible de mettre à jour le statut de la commande.");
    }
  };

  const handleOpenShipment = (order: AdminOrder) => {
    setTargetOrder(order);
    setTrackingNumber(`COL-${Date.now().toString().slice(-8)}`);
    setShipmentModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrder) return;
    setIsSubmittingShipment(true);
    try {
      await handleUpdateStatus(targetOrder.id, "SHIPPED");
      toast.success(`Commande ${targetOrder.orderNumber} expédiée avec ${carrier} (${trackingNumber})`);
      setShipmentModalOpen(false);
    } finally {
      setIsSubmittingShipment(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      toast.error("Aucune commande à exporter.");
      return;
    }
    const headers = [
      "Numéro",
      "Client",
      "Email",
      "Ville",
      "Total TTC",
      "Statut Commande",
      "Statut Paiement",
      "Moyen de Paiement",
      "Date",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${(o.customerEmail || "").replace(/"/g, '""')}"`,
      `"${(o.shippingCity || "").replace(/"/g, '""')}"`,
      `"${Number(o.totalAmount || 0).toFixed(2)} €"`,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`,
      `"${new Date(o.createdAt).toLocaleDateString("fr-FR")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commandes_divinexpress_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export CSV des commandes généré avec succès !");
  };

  const tabs = [
    { id: "ALL", label: "Toutes", count: tabCounts.ALL },
    { id: "PENDING", label: "À payer", count: tabCounts.PENDING },
    { id: "PROCESSING", label: "À préparer", count: tabCounts.PROCESSING },
    { id: "SHIPPED", label: "Expédiées", count: tabCounts.SHIPPED },
    { id: "DELIVERED", label: "Livrées", count: tabCounts.DELIVERED },
    { id: "CANCELLED", label: "Annulées", count: tabCounts.CANCELLED },
    { id: "REFUNDED", label: "Remboursées", count: tabCounts.REFUNDED },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Commandes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez et suivez toutes vos commandes en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
            title="Rafraîchir les commandes"
          >
            <RefreshCw className={`size-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Rafraîchir</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Download className="size-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Metrics Grid */}
      <OrdersStatsGrid
        totalCount={totalCount}
        totalRevenue={totalRevenue}
        avgOrderValue={avgOrderValue}
        toShipCount={toShipCount}
        deliveredCount={deliveredCount}
      />

      {/* 3. Main Operational Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        {/* Horizontal Status Tabs */}
        <div className="border-b border-slate-200/80 px-4 sm:px-5 pt-3 overflow-x-auto custom-scrollbar flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap transition-colors relative flex items-center gap-2 cursor-pointer font-medium ${
                  isActive
                    ? "text-[#2b6b61] font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b6b61] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-slate-50/50">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une commande, un client, une ville..."
              className="w-full h-9.5 pl-9.5 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20 focus:border-[#2b6b61] transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Payment Filter */}
            <div className="relative">
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="h-9.5 pl-3 pr-8 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer appearance-none shadow-2xs"
              >
                <option value="ALL">Méthode : Toutes</option>
                <option value="stripe">Stripe (CB)</option>
                <option value="paypal">PayPal</option>
                <option value="apple">Apple Pay</option>
              </select>
              <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9.5 pl-3 pr-8 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer appearance-none shadow-2xs"
              >
                <option value="ALL">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
              </select>
              <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filtres Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-9.5 px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-slate-500" />
              <span>Filtres</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadOrders}
              className="h-9.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
              title="Actualiser les commandes"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#2b6b61]" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4. Dense High-Performance Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrders.length === filteredOrders.length
                    }
                    className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">N° COMMANDE</th>
                <th className="py-3 px-3">CLIENT</th>
                <th className="py-3 px-3">PRODUITS</th>
                <th className="py-3 px-3">PAIEMENT</th>
                <th className="py-3 px-3">MONTANT</th>
                <th className="py-3 px-3">STATUT</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">Aucune commande trouvée</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const { dateFormatted, timeFormatted } = formatDate(order.createdAt);
                  const isMenuOpen = openActionMenuId === order.id;

                  // Initials
                  const initials = order.customerName
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                        />
                      </td>

                      {/* Order Number + Copy Button */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-bold text-slate-900 hover:text-[#2b6b61] transition-colors whitespace-nowrap"
                          >
                            {order.orderNumber}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderNumber(order.orderNumber)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                            title="Copier le N° de commande"
                          >
                            {copiedId === order.orderNumber ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Client (Initials + Name + City) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          <div className="size-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {order.customerName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {order.shippingCity}, {order.shippingCountry}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Produits (Thumbnail + Count) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="size-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 flex items-center justify-center">
                            <Package className="size-4 text-slate-400" />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {order.items?.length || 1} article{(order.items?.length || 1) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>

                      {/* Paiement */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <PaymentBadge method={order.paymentMethod} />
                      </td>

                      {/* Montant + Frais de port */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          {euros.format(order.totalAmount)}
                        </p>
                        <p className="text-[11px] text-slate-400 font-normal">
                          {order.shippingCost === 0
                            ? "Livraison gratuite"
                            : `Livraison : ${euros.format(order.shippingCost)}`}
                        </p>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">
                          {dateFormatted}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {timeFormatted}
                        </p>
                      </td>

                      {/* Actions Menu ••• */}
                      <td className="py-3.5 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenuId((prev) =>
                              prev === order.id ? null : order.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                          aria-label="Actions de commande"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenActionMenuId(null)}
                            />
                            <div className="absolute right-4 top-10 z-40 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 text-left text-xs font-medium">
                              <Link
                                href={`/orders/${order.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>Voir la commande</span>
                              </Link>

                              {order.status !== "PROCESSING" && order.status !== "SHIPPED" && order.status !== "DELIVERED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left"
                                >
                                  <PackageCheck className="size-3.5 text-amber-500" />
                                  <span>Lancer la confection</span>
                                </button>
                              )}

                              {order.status !== "SHIPPED" && order.status !== "DELIVERED" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenShipment(order)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left"
                                >
                                  <Truck className="size-3.5 text-blue-500" />
                                  <span>Expédier le colis</span>
                                </button>
                              )}

                              {order.status === "SHIPPED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left"
                                >
                                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                                  <span>Confirmer livraison</span>
                                </button>
                              )}

                              <div className="my-1 border-t border-slate-100" />

                              <Link
                                href={`/orders/${order.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Printer className="size-3.5 text-slate-400" />
                                <span>Imprimer facture</span>
                              </Link>

                              {order.status !== "REFUNDED" && order.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, "REFUNDED")}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-purple-700 hover:bg-purple-50 text-left"
                                >
                                  <RotateCcw className="size-3.5 text-purple-600" />
                                  <span>Rembourser</span>
                                </button>
                              )}

                              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 text-left"
                                >
                                  <X className="size-3.5 text-rose-600" />
                                  <span>Annuler la commande</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Footer / Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <p>
            Affichage de 1 à {filteredOrders.length} sur {orders.length} commande{orders.length > 1 ? "s" : ""}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="size-8 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center text-slate-400 disabled:opacity-50 cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="size-8 rounded-lg bg-[#2b6b61] text-white font-bold flex items-center justify-center shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="size-8 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center text-slate-400 disabled:opacity-50 cursor-not-allowed shadow-2xs"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="relative">
              <select className="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer appearance-none shadow-2xs">
                <option value="10">10 par page</option>
                <option value="25">25 par page</option>
                <option value="50">50 par page</option>
              </select>
              <ChevronDown className="size-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Shipment Modal */}
      {shipmentModalOpen && targetOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShipmentModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Expédier la commande
                </h3>
                <p className="text-xs text-slate-500">
                  {targetOrder.orderNumber} • {targetOrder.customerName}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmShipment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transporteur
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                >
                  <option value="Colissimo La Poste">Colissimo La Poste (Suivi 48h)</option>
                  <option value="Chronopost Express">Chronopost Express (24h)</option>
                  <option value="DHL Express Paris">DHL Express Couture International</option>
                  <option value="Mondial Relay">Mondial Relay Point Retrait</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numéro de suivi colis
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ex: 6A12345678901"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShipmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipment}
                  className="px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs font-semibold shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Confirmer l'expédition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
