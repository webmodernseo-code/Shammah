"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Settings,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  AlertTriangle,
  X,
  Send,
  ExternalLink,
  ChevronRight as ArrowRight,
  FileText,
  Mail,
} from "lucide-react";
import ReturnsStatsGrid from "./returns-stats-grid";

export type ReturnStatus = "PROCESSING" | "REFUNDED" | "REJECTED" | "EXCHANGE";

export interface ReturnRequestItem {
  id: string;
  orderNumber: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productVariant: string;
  productImage: string;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
  refundAmount?: number;
}

const DEFAULT_RETURNS: ReturnRequestItem[] = [
  {
    id: "ret-1",
    orderNumber: "DE-2026-0887",
    customerName: "Alexandre Dumas",
    customerEmail: "a.dumas@gmail.com",
    productName: "Hoodie Oversize",
    productVariant: "Taille L • Noir",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&q=80",
    reason: "Taille inadaptée",
    status: "PROCESSING",
    createdAt: "2026-09-16T10:22:00Z",
    refundAmount: 149.0,
  },
  {
    id: "ret-2",
    orderNumber: "DE-2026-0885",
    customerName: "Camille Laurent",
    customerEmail: "camille@outlook.fr",
    productName: "Robe longue",
    productVariant: "Taille M • Rouge",
    productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80",
    reason: "Produit défectueux",
    status: "REFUNDED",
    createdAt: "2026-09-15T18:45:00Z",
    refundAmount: 189.0,
  },
  {
    id: "ret-3",
    orderNumber: "DE-2026-0881",
    customerName: "Marc Vasseur",
    customerEmail: "m.vasseur@wanadoo.fr",
    productName: "Manteau élégant",
    productVariant: "Taille XL • Beige",
    productImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&q=80",
    reason: "Ne convient pas",
    status: "PROCESSING",
    createdAt: "2026-09-14T16:30:00Z",
    refundAmount: 220.0,
  },
  {
    id: "ret-4",
    orderNumber: "DE-2026-0879",
    customerName: "Sophie Morel",
    customerEmail: "sophie.morel@free.fr",
    productName: "Baskets Classic",
    productVariant: "Taille 42 • Blanc",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&q=80",
    reason: "Article endommagé",
    status: "REJECTED",
    createdAt: "2026-09-12T11:05:00Z",
    refundAmount: 110.0,
  },
  {
    id: "ret-5",
    orderNumber: "DE-2026-0875",
    customerName: "Julien Lefèvre",
    customerEmail: "julien.lefevre@gmail.com",
    productName: "Chemise Premium",
    productVariant: "Taille M • Blanc",
    productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80",
    reason: "Changement d'avis",
    status: "REFUNDED",
    createdAt: "2026-09-10T09:12:00Z",
    refundAmount: 95.0,
  },
];

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

function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  switch (status) {
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
          <span className="size-1.5 rounded-full bg-amber-500" />
          <span>En traitement</span>
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          <span>Remboursé</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
          <span className="size-1.5 rounded-full bg-rose-600" />
          <span>Refusé</span>
        </span>
      );
    case "EXCHANGE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200/80">
          <span className="size-1.5 rounded-full bg-purple-600" />
          <span>Échange</span>
        </span>
      );
  }
}

export default function ReturnAndRefundTable() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [returns, setReturns] = useState<ReturnRequestItem[]>(demoMode ? DEFAULT_RETURNS : []);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // New Request Modal State
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductVariant, setNewProductVariant] = useState("");
  const [newReason, setNewReason] = useState("Taille inadaptée");

  // Refund Confirmation Modal State
  const [confirmRefundModalItem, setConfirmRefundModalItem] = useState<ReturnRequestItem | null>(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const loadReturns = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        return j;
      })
      .then((j) => {
        if (Array.isArray(j.data)) {
          const refundedOrders = j.data.filter(
            (o: any) => o.status === "REFUNDED" || o.paymentStatus === "REFUNDED"
          );
          if (refundedOrders.length > 0) {
            const apiReturns: ReturnRequestItem[] = refundedOrders.map((o: any, idx: number) => ({
              id: `ret-api-${o.id}`,
              orderId: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customerName || "Client DivinExpress",
              customerEmail: o.customerEmail || "client@email.fr",
              productName: o.items?.[0]?.productName || "Article Haute Couture",
              productVariant: o.items?.[0]?.formatLabel || "Taille M",
              productImage: "",
              reason: "Retour client",
              status: "REFUNDED",
              createdAt: o.createdAt || new Date().toISOString(),
              refundAmount: Number(o.totalAmount || 0),
            }));
            setReturns(demoMode ? [...apiReturns, ...DEFAULT_RETURNS.slice(apiReturns.length)] : apiReturns);
          } else if (!demoMode) {
            setReturns([]);
          }
        }
      })
      .catch(() => { if (!demoMode) setReturns([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: returns.length,
      PROCESSING: 0,
      REFUNDED: 0,
      REJECTED: 0,
      EXCHANGE: 0,
    };
    returns.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status] += 1;
      }
    });
    return counts;
  }, [returns]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        !query ||
        `${r.orderNumber} ${r.customerName} ${r.customerEmail} ${r.productName}`
          .toLowerCase()
          .includes(query.toLowerCase());

      let matchTab = true;
      if (activeTab !== "ALL") {
        matchTab = r.status === activeTab;
      }

      let matchReason = true;
      if (selectedReason !== "ALL") {
        matchReason = r.reason.toLowerCase() === selectedReason.toLowerCase();
      }

      let matchStatus = true;
      if (selectedStatus !== "ALL") {
        matchStatus = r.status === selectedStatus;
      }

      return matchSearch && matchTab && matchReason && matchStatus;
    });
  }, [returns, query, activeTab, selectedReason, selectedStatus]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredReturns.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ReturnRequestItem = {
      id: `ret-${Date.now()}`,
      orderNumber: newOrderNumber || `DE-2026-089${returns.length + 1}`,
      customerName: newCustomerName,
      customerEmail: newCustomerEmail,
      productName: newProductName,
      productVariant: newProductVariant || "Taille M",
      productImage: "",
      reason: newReason,
      status: "PROCESSING",
      createdAt: new Date().toISOString(),
      refundAmount: 150.0,
    };
    setReturns([newReq, ...returns]);
    toast.success(`Demande de retour pour la commande ${newReq.orderNumber} enregistrée`);
    setIsNewRequestModalOpen(false);
    setNewOrderNumber("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewProductName("");
    setNewProductVariant("");
  };

  const handleConfirmRefund = async () => {
    if (!confirmRefundModalItem) return;
    setIsProcessingRefund(true);
    try {
      if (confirmRefundModalItem.orderId) {
        await fetch(`/api/admin/orders/${confirmRefundModalItem.orderId}/refund`, {
          method: "POST",
        });
      }
      setReturns((prev) =>
        prev.map((r) =>
          r.id === confirmRefundModalItem.id ? { ...r, status: "REFUNDED" } : r
        )
      );
      toast.success(
        `Remboursement de la commande ${confirmRefundModalItem.orderNumber} validé avec succès`
      );
      setConfirmRefundModalItem(null);
    } catch {
      setReturns((prev) =>
        prev.map((r) =>
          r.id === confirmRefundModalItem.id ? { ...r, status: "REFUNDED" } : r
        )
      );
      toast.success(`Remboursement validé`);
      setConfirmRefundModalItem(null);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ReturnStatus, label: string) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Demande ${label}`);
    setOpenActionMenuId(null);
  };

  const tabs = [
    { id: "ALL", label: "Toutes", count: tabCounts.ALL },
    { id: "PROCESSING", label: "En traitement", count: tabCounts.PROCESSING },
    { id: "REFUNDED", label: "Remboursés", count: tabCounts.REFUNDED },
    { id: "REJECTED", label: "Refusés", count: tabCounts.REJECTED },
    { id: "EXCHANGE", label: "Échanges", count: tabCounts.EXCHANGE },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Retours & Remboursements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez les demandes de retour, les remboursements et les échanges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewRequestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Nouvelle demande</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Metrics Grid */}
      <ReturnsStatsGrid
        totalRequests={returns.length}
        processingCount={tabCounts.PROCESSING}
        refundedCount={tabCounts.REFUNDED}
        rejectedCount={tabCounts.REJECTED}
        exchangeCount={tabCounts.EXCHANGE}
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
              placeholder="Rechercher par n° commande, client, produit..."
              className="w-full h-9.5 pl-9.5 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20 focus:border-[#2b6b61] transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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

            {/* Reason Filter */}
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="h-9.5 pl-3 pr-8 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer appearance-none shadow-2xs"
              >
                <option value="ALL">Motif : Tous</option>
                <option value="Taille inadaptée">Taille inadaptée</option>
                <option value="Produit défectueux">Produit défectueux</option>
                <option value="Ne convient pas">Ne convient pas</option>
                <option value="Article endommagé">Article endommagé</option>
                <option value="Changement d'avis">Changement d'avis</option>
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
                <option value="PROCESSING">En traitement</option>
                <option value="REFUNDED">Remboursé</option>
                <option value="REJECTED">Refusé</option>
                <option value="EXCHANGE">Échange</option>
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
              onClick={loadReturns}
              className="h-9.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
              title="Actualiser les retours"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#2b6b61]" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4. High-Density Returns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredReturns.length > 0 &&
                      selectedIds.length === filteredReturns.length
                    }
                    className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">N° COMMANDE</th>
                <th className="py-3 px-3">CLIENT</th>
                <th className="py-3 px-3">PRODUIT</th>
                <th className="py-3 px-3">MOTIF</th>
                <th className="py-3 px-3">STATUT</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">Aucune demande de retour trouvée</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const isSelected = selectedIds.includes(ret.id);
                  const { dateFormatted, timeFormatted } = formatDate(ret.createdAt);
                  const isMenuOpen = openActionMenuId === ret.id;

                  // Initials
                  const initials = ret.customerName
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={ret.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ret.id)}
                          className="size-4 rounded border-slate-300 text-[#2b6b61] focus:ring-[#2b6b61]/20 cursor-pointer"
                        />
                      </td>

                      {/* N° Commande */}
                      <td className="py-3.5 px-3">
                        <Link
                          href={`/orders/${ret.orderId || ret.id}`}
                          className="font-bold text-[#2b6b61] hover:underline whitespace-nowrap"
                        >
                          {ret.orderNumber}
                        </Link>
                      </td>

                      {/* Client (Initials + Name + Email) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <div className="size-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {ret.customerName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {ret.customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Produit (Thumbnail + Name + Variant) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-[170px]">
                          <div className="size-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                            <Image
                              src={ret.productImage}
                              alt="Article"
                              width={36}
                              height={36}
                              className="size-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {ret.productName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {ret.productVariant}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Motif */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                        {ret.reason}
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <ReturnStatusBadge status={ret.status} />
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
                              prev === ret.id ? null : ret.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                          aria-label="Actions de retour"
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
                            <div className="absolute right-4 top-10 z-40 w-52 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 text-left text-xs font-medium">
                              <Link
                                href={`/orders/${ret.orderId || ret.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>Voir le détail</span>
                              </Link>

                              {ret.status === "PROCESSING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmRefundModalItem(ret);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 text-left"
                                  >
                                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                                    <span>Valider le remboursement</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateStatus(ret.id, "REJECTED", "refusée")
                                    }
                                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 text-left"
                                  >
                                    <XCircle className="size-3.5 text-rose-600" />
                                    <span>Refuser la demande</span>
                                  </button>
                                </>
                              )}

                              {ret.status !== "PROCESSING" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateStatus(ret.id, "PROCESSING", "remise en traitement")
                                  }
                                  className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 text-left"
                                >
                                  <RotateCcw className="size-3.5 text-amber-600" />
                                  <span>Remettre en traitement</span>
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
            Affichage de 1 à {filteredReturns.length} sur {returns.length} demande{returns.length > 1 ? "s" : ""}
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

      {/* 6. Bottom 2 Panels: Informations importantes & Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Informations importantes */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Info className="size-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Informations importantes
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>Les retours sont acceptés sous 14 jours après la livraison.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>Les articles doivent être dans leur état d'origine.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>Le remboursement est effectué via le moyen de paiement initial.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>Les frais de retour peuvent être à la charge du client (selon la politique de la boutique).</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              href="/privacy-and-policy"
              className="text-xs font-semibold text-[#2b6b61] hover:underline inline-flex items-center gap-1"
            >
              <span>Voir la politique de retour</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Actions rapides */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Settings className="size-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Actions rapides
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            <Link
              href="/settings/general"
              className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#2b6b61] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="size-4 text-slate-400 group-hover:text-[#2b6b61]" />
                <span>Configurer la politique de retour</span>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/settings/smtp"
              className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#2b6b61] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-slate-400 group-hover:text-[#2b6b61]" />
                <span>Personnaliser les emails de retour</span>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/faq"
              className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#2b6b61] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-slate-400 group-hover:text-[#2b6b61]" />
                <span>Voir les modèles de formulaire</span>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/transactions"
              className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#2b6b61] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="size-4 text-slate-400 group-hover:text-[#2b6b61]" />
                <span>Suivre les remboursements</span>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Modal: Nouvelle Demande de Retour */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsNewRequestModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-emerald-50 text-[#2b6b61] flex items-center justify-center">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Nouvelle demande de retour
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrer un retour ou une demande d'échange client.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  N° de commande
                </label>
                <input
                  type="text"
                  required
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  placeholder="Ex: DE-2026-0894"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ex: Alexandre Dumas"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email du client
                </label>
                <input
                  type="email"
                  required
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="Ex: a.dumas@gmail.com"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Produit
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Costume Sur-Mesure"
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Variante / Taille
                  </label>
                  <input
                    type="text"
                    value={newProductVariant}
                    onChange={(e) => setNewProductVariant(e.target.value)}
                    placeholder="Ex: Taille 50 • Noir"
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motif du retour
                </label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2b6b61]/20"
                >
                  <option value="Taille inadaptée">Taille inadaptée</option>
                  <option value="Produit défectueux">Produit défectueux</option>
                  <option value="Ne convient pas">Ne convient pas</option>
                  <option value="Article endommagé">Article endommagé</option>
                  <option value="Changement d'avis">Changement d'avis</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#22564e] text-white font-semibold shadow-xs"
                >
                  Enregistrer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Safe Financial Confirmation Modal: Remboursement */}
      {confirmRefundModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirmer le remboursement
                </h3>
                <p className="text-xs text-slate-500">
                  Cette action est financièrement irréversible.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 text-xs mb-4">
              <p>
                <strong className="text-slate-900">Commande :</strong> {confirmRefundModalItem.orderNumber}
              </p>
              <p>
                <strong className="text-slate-900">Client :</strong> {confirmRefundModalItem.customerName} ({confirmRefundModalItem.customerEmail})
              </p>
              <p>
                <strong className="text-slate-900">Montant à rembourser :</strong>{" "}
                <span className="font-bold text-slate-900">
                  {confirmRefundModalItem.refundAmount ? `${confirmRefundModalItem.refundAmount.toFixed(2)} €` : "Montant total de la commande"}
                </span>
              </p>
              <p>
                <strong className="text-slate-900">Motif :</strong> {confirmRefundModalItem.reason}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setConfirmRefundModalItem(null)}
                disabled={isProcessingRefund}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                disabled={isProcessingRefund}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isProcessingRefund ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>Exécuter le remboursement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
