"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  Download,
  ExternalLink,
  RotateCcw,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { StripeLogo, PaypalLogo, ApplePayLogo } from "@/components/common/payment-icons";
import PaymentsStatsGrid from "./payments-stats-grid";

export interface TransactionOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  cardLast4?: string;
}

const DEFAULT_TRANSACTIONS: TransactionOrder[] = [
  {
    id: "ord-1",
    orderNumber: "DE-2026-0891",
    customerName: "Alexandre Dumas",
    customerEmail: "a.dumas@gmail.com",
    subtotal: 249.99,
    shippingCost: 0,
    discountAmount: 0,
    totalAmount: 249.99,
    paymentStatus: "PAID",
    paymentMethod: "stripe",
    cardLast4: "4242",
    status: "DELIVERED",
    createdAt: "2026-09-16T03:38:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "DE-2026-0892",
    customerName: "Camille Laurent",
    customerEmail: "camille@outlook.fr",
    subtotal: 169.0,
    shippingCost: 5.9,
    discountAmount: 0,
    totalAmount: 174.9,
    paymentStatus: "PAID",
    paymentMethod: "paypal",
    status: "SHIPPED",
    createdAt: "2026-09-15T20:38:00Z",
  },
  {
    id: "ord-3",
    orderNumber: "DE-2026-0893",
    customerName: "Marc Vasseur",
    customerEmail: "m.vasseur@wanadoo.fr",
    subtotal: 129.0,
    shippingCost: 0,
    discountAmount: 0,
    totalAmount: 129.0,
    paymentStatus: "PAID",
    paymentMethod: "stripe",
    cardLast4: "3187",
    status: "PROCESSING",
    createdAt: "2026-09-15T08:38:00Z",
  },
];

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

function PaymentBadge({ method, cardLast4 }: { method: string; cardLast4?: string }) {
  const m = (method || "").toLowerCase();
  if (m.includes("paypal")) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
          <PaypalLogo className="h-3 w-auto" />
        </div>
      </div>
    );
  }
  if (m.includes("apple")) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black text-white shadow-2xs">
          <ApplePayLogo className="h-3.5 w-auto" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
        <StripeLogo className="h-3.5 w-auto" />
      </div>
      <span className="text-[10px] text-slate-400 font-medium">
        {cardLast4 ? `•••• •••• ${cardLast4}` : "Carte non communiquée"}
      </span>
    </div>
  );
}

function PaymentStatusBadge({ paymentStatus, status }: { paymentStatus: string; status: string }) {
  const isPaid = paymentStatus === "PAID" || status === "DELIVERED" || status === "SHIPPED" || status === "PROCESSING";
  const isPending = paymentStatus === "PENDING" || paymentStatus === "UNPAID";
  const isFailed = paymentStatus === "FAILED";
  const isRefunded = paymentStatus === "REFUNDED" || status === "REFUNDED";

  if (isRefunded) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200/80">
        <span className="size-1.5 rounded-full bg-purple-600" />
        <span>Remboursé</span>
      </span>
    );
  }

  if (isFailed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
        <span className="size-1.5 rounded-full bg-rose-600" />
        <span>Échoué</span>
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
        <span className="size-1.5 rounded-full bg-amber-500" />
        <span>En attente</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
      <span className="size-1.5 rounded-full bg-emerald-600" />
      <span>Payé (encaissé)</span>
    </span>
  );
}

export default function TransactionTable() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [transactions, setTransactions] = useState<TransactionOrder[]>(demoMode ? DEFAULT_TRANSACTIONS : []);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        return j;
      })
      .then((j) => {
        if (Array.isArray(j.data) && j.data.length > 0) {
          const apiTransactions = j.data.map((o: any) => ({
            ...o,
            cardLast4: o.cardLast4 || undefined,
          }));
          setTransactions(apiTransactions);
        } else if (!demoMode) {
          setTransactions([]);
        }
      })
      .catch(() => { if (!demoMode) setTransactions([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Tab Counts
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: transactions.length,
      PAID: 0,
      PENDING: 0,
      FAILED: 0,
      REFUNDED: 0,
    };
    transactions.forEach((t) => {
      if (t.paymentStatus === "REFUNDED" || t.status === "REFUNDED") {
        counts.REFUNDED += 1;
      } else if (t.paymentStatus === "FAILED") {
        counts.FAILED += 1;
      } else if (t.paymentStatus === "PENDING" || t.paymentStatus === "UNPAID") {
        counts.PENDING += 1;
      } else {
        counts.PAID += 1;
      }
    });
    return counts;
  }, [transactions]);

  // KPI Calculations
  const totalCount = transactions.length;
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.paymentStatus === "PAID" || t.status === "DELIVERED" || t.status === "SHIPPED" || t.status === "PROCESSING")
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
  }, [transactions]);
  const avgPayment = totalCount > 0 ? totalRevenue / (tabCounts.PAID || 1) : 0;
  const pendingCount = tabCounts.PENDING;
  const failedOrRefundedCount = tabCounts.FAILED + tabCounts.REFUNDED;

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !query ||
        `${t.orderNumber} ${t.customerName} ${t.customerEmail}`
          .toLowerCase()
          .includes(query.toLowerCase());

      let matchTab = true;
      if (activeTab === "PAID") {
        matchTab = t.paymentStatus === "PAID" || t.status === "DELIVERED" || t.status === "SHIPPED" || t.status === "PROCESSING";
      } else if (activeTab === "PENDING") {
        matchTab = t.paymentStatus === "PENDING" || t.paymentStatus === "UNPAID";
      } else if (activeTab === "FAILED") {
        matchTab = t.paymentStatus === "FAILED";
      } else if (activeTab === "REFUNDED") {
        matchTab = t.paymentStatus === "REFUNDED" || t.status === "REFUNDED";
      }

      let matchPayment = true;
      if (selectedPayment !== "ALL") {
        matchPayment = t.paymentMethod?.toLowerCase().includes(selectedPayment.toLowerCase());
      }

      let matchStatusFilter = true;
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "PAID") matchStatusFilter = t.paymentStatus === "PAID" || t.status === "DELIVERED" || t.status === "SHIPPED" || t.status === "PROCESSING";
        else if (selectedStatus === "PENDING") matchStatusFilter = t.paymentStatus === "PENDING" || t.paymentStatus === "UNPAID";
        else if (selectedStatus === "FAILED") matchStatusFilter = t.paymentStatus === "FAILED";
        else if (selectedStatus === "REFUNDED") matchStatusFilter = t.paymentStatus === "REFUNDED" || t.status === "REFUNDED";
      }

      return matchSearch && matchTab && matchPayment && matchStatusFilter;
    });
  }, [transactions, query, activeTab, selectedPayment, selectedStatus]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = "N° Commande,Client,Email,Montant,Frais de livraison,Moyen de paiement,Statut,Date\n";
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.orderNumber}","${t.customerName}","${t.customerEmail}","${t.totalAmount}","${t.shippingCost}","${t.paymentMethod}","${t.paymentStatus}","${t.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `paiements_divinexpress_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Rapport des paiements exporté en CSV");
  };

  const tabs = [
    { id: "ALL", label: "Tous", count: tabCounts.ALL },
    { id: "PAID", label: "Réussis", count: tabCounts.PAID },
    { id: "PENDING", label: "En attente", count: tabCounts.PENDING },
    { id: "FAILED", label: "Échoués", count: tabCounts.FAILED },
    { id: "REFUNDED", label: "Remboursés", count: tabCounts.REFUNDED },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Paiements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivez tous les paiements encaissés via Stripe, PayPal et autres moyens de paiement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="size-4 text-slate-500" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Metrics Grid */}
      <PaymentsStatsGrid
        totalCount={totalCount}
        totalRevenue={totalRevenue}
        avgPayment={avgPayment}
        pendingCount={pendingCount}
        failedOrRefundedCount={failedOrRefundedCount}
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
              placeholder="Rechercher par n° commande, client, email..."
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
                <option value="ALL">Moyen de paiement : Tous</option>
                <option value="stripe">Stripe (CB)</option>
                <option value="paypal">PayPal</option>
                <option value="apple">Apple Pay</option>
              </select>
              <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9.5 pl-3 pr-8 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer appearance-none shadow-2xs"
              >
                <option value="ALL">Statut : Tous</option>
                <option value="PAID">Payé (encaissé)</option>
                <option value="PENDING">En attente</option>
                <option value="FAILED">Échoué</option>
                <option value="REFUNDED">Remboursé</option>
              </select>
              <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Period Filter */}
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
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
              onClick={loadTransactions}
              className="h-9.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
              title="Actualiser les paiements"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#2b6b61]" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4. High-Density Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedIds.length === filteredTransactions.length
                    }
                    className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">N° COMMANDE</th>
                <th className="py-3 px-3">CLIENT</th>
                <th className="py-3 px-3">MONTANT</th>
                <th className="py-3 px-3">FRAIS DE LIVRAISON</th>
                <th className="py-3 px-3">MOYEN DE PAIEMENT</th>
                <th className="py-3 px-3">STATUT</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">Aucun paiement trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  const { dateFormatted, timeFormatted } = formatDate(tx.createdAt);
                  const isMenuOpen = openActionMenuId === tx.id;

                  // Initials
                  const initials = tx.customerName
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tx.id)}
                          className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                        />
                      </td>

                      {/* Order Number + External Link */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/orders/${tx.id}`}
                            className="font-bold text-[#2b6b61] hover:underline transition-colors whitespace-nowrap inline-flex items-center gap-1"
                          >
                            <span>{tx.orderNumber}</span>
                            <ExternalLink className="size-3 text-slate-400" />
                          </Link>
                        </div>
                      </td>

                      {/* Client (Initials + Name + Email) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <div className="size-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {tx.customerName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {tx.customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Montant */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900">
                        {euros.format(tx.totalAmount)}
                      </td>

                      {/* Frais de livraison */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500">
                        {tx.shippingCost === 0 ? "Offerte" : euros.format(tx.shippingCost)}
                      </td>

                      {/* Moyen de Paiement */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <PaymentBadge method={tx.paymentMethod} cardLast4={tx.cardLast4} />
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <PaymentStatusBadge paymentStatus={tx.paymentStatus} status={tx.status} />
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
                              prev === tx.id ? null : tx.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                          aria-label="Actions de transaction"
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
                                href={`/orders/${tx.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>Voir la commande</span>
                              </Link>

                              <Link
                                href={`/orders/${tx.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Printer className="size-3.5 text-slate-400" />
                                <span>Télécharger reçu</span>
                              </Link>

                              {tx.paymentStatus !== "REFUNDED" && tx.status !== "REFUNDED" && (
                                <Link
                                  href={`/orders/${tx.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-purple-700 hover:bg-purple-50"
                                  onClick={() => setOpenActionMenuId(null)}
                                >
                                  <RotateCcw className="size-3.5 text-purple-600" />
                                  <span>Rembourser transaction</span>
                                </Link>
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
            Affichage de 1 à {filteredTransactions.length} sur {transactions.length} paiement{transactions.length > 1 ? "s" : ""}
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
    </div>
  );
}
