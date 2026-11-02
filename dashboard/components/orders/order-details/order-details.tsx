"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { getSafeProductImage, handleProductImageError } from "@/lib/product-image";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  Send,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { StripeLogo, PaypalLogo, ApplePayLogo } from "@/components/common/payment-icons";

interface OrderItemDetail {
  id: string;
  productName: string;
  formatLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface OrderDetailData {
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
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemDetail[];
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée (À préparer)",
  PROCESSING: "En préparation atelier",
  SHIPPED: "Expédiée (En transit)",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const DEFAULT_ORDER: OrderDetailData = {
  id: "ord_default_1",
  orderNumber: "DIV-2026-849",
  customerName: "Alexandre Mercier",
  customerEmail: "a.mercier@email.com",
  customerPhone: "+33 6 12 34 56 78",
  shippingStreet: "14 Rue de la Paix",
  shippingCity: "Paris",
  shippingPostal: "75002",
  shippingCountry: "France",
  subtotal: 368.00,
  shippingCost: 0,
  discountAmount: 0,
  totalAmount: 368.00,
  status: "PROCESSING",
  paymentStatus: "PAID",
  paymentMethod: "stripe",
  createdAt: new Date().toISOString(),
  items: [
    {
      id: "it_1",
      productName: "Costume 2 Pièces Laine Vierge",
      formatLabel: "Taille 48 • Noir",
      quantity: 1,
      unitPrice: 289.00,
      totalPrice: 289.00,
      image: "/images/products/fashion-1.jpg",
    },
    {
      id: "it_2",
      productName: "Chemise Slim Fit Lin Naturel",
      formatLabel: "Taille M • Blanc",
      quantity: 1,
      unitPrice: 79.00,
      totalPrice: 79.00,
      image: "/images/products/fashion-4.jpg",
    },
  ],
};

export default function OrderDetails({ id = "DIV-2026-849" }: { id?: string }) {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [order, setOrder] = useState<OrderDetailData | null>(demoMode ? DEFAULT_ORDER : null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setOrder(json.data);
          }
        }
      } catch (err) {
        console.error("Chargement commande impossible:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (!order) {
    return (
      <div className="w-full max-w-5xl mx-auto rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        {loading ? "Chargement de la commande…" : "Commande introuvable ou indisponible."}
      </div>
    );
  }

  // Timeline Steps
  const timelineSteps = [
    { key: "PENDING", label: "Commande passée", icon: Clock },
    { key: "PAID", label: "Paiement validé", icon: ShieldCheck },
    { key: "PROCESSING", label: "Préparation atelier", icon: PackageCheck },
    { key: "SHIPPED", label: "Expédiée (Colissimo)", icon: Truck },
    { key: "DELIVERED", label: "Livrée au client", icon: CheckCircle2 },
  ];

  const currentStatusIndex =
    order.status === "DELIVERED"
      ? 4
      : order.status === "SHIPPED"
      ? 3
      : order.status === "PROCESSING"
      ? 2
      : order.status === "PAID"
      ? 1
      : 0;

  const handleUpdateStatus = async (newStatus: OrderDetailData["status"]) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: newStatus === "SHIPPED" ? trackingNumber : undefined,
          carrier: "Colissimo La Poste",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Statut mis à jour : ${statusLabels[newStatus]}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            title={`Commande ${order.orderNumber}`}
            backHref="/orders"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="size-3.5" />
            <span>
              Passée le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Imprimer Bon / Facture</span>
          </button>

          {order.status === "PAID" && (
            <button
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus("PROCESSING")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <PackageCheck className="size-3.5" />
              <span>Lancer la préparation</span>
            </button>
          )}

          {order.status === "PROCESSING" && (
            <button
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus("SHIPPED")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Truck className="size-3.5" />
              <span>Expédier (Colissimo)</span>
            </button>
          )}

          {order.status === "SHIPPED" && (
            <button
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus("DELIVERED")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Marquer Livrée</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Visual Delivery Timeline */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-6">
          Suivi d'Acheminement de la Commande
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 ${
                  isCurrent
                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs"
                    : isCompleted
                    ? "bg-gray-50 border-gray-200 text-gray-800"
                    : "bg-white border-gray-100 text-gray-400 opacity-60"
                }`}
              >
                <div
                  className={`size-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <step.icon className="size-5" />
                </div>
                <span className="text-xs font-bold leading-tight">
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Étape actuelle
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Spice Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-900 text-base">
              Articles & Pièces Commandées
            </h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {order.items.reduce((acc, it) => acc + it.quantity, 0)} pièces
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="size-14 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                    <img
                      src={getSafeProductImage(item.image, item.id, item.productName)}
                      alt={item.productName}
                      className="w-full h-full object-contain"
                      onError={(e) => handleProductImageError(e, item.id, item.productName)}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Format : <strong>{item.formatLabel}</strong> • Quantité :{" "}
                      <strong className="text-emerald-800">{item.quantity}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-xs sm:text-sm text-gray-950 block">
                    {euros.format(item.totalPrice)}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {euros.format(item.unitPrice)} / unité
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total articles</span>
              <span className="font-bold text-gray-900">{euros.format(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span className="font-bold text-emerald-700">
                {order.shippingCost === 0 ? "Offerte (Dès 35€)" : euros.format(order.shippingCost)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Remise appliquée</span>
                <span>-{euros.format(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-black text-gray-950 pt-2 border-t border-gray-200">
              <span>Total TTC</span>
              <span className="text-emerald-800 text-lg sm:text-xl font-extrabold">
                {euros.format(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Shipping Details */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="size-4 text-emerald-600" />
              <span>Coordonnées Client</span>
            </h3>

            <div className="space-y-2 text-xs text-gray-700">
              <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
              <p className="flex items-center gap-2 text-gray-600">
                <Mail className="size-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{order.customerEmail}</span>
              </p>
              {order.customerPhone && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="size-3.5 text-gray-400 shrink-0" />
                  <span>{order.customerPhone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="size-4 text-emerald-600" />
              <span>Adresse de Livraison</span>
            </h3>

            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">{order.shippingStreet}</p>
              <p>
                {order.shippingPostal} {order.shippingCity}
              </p>
              <p className="text-gray-500 font-semibold">{order.shippingCountry}</p>
            </div>

            {/* Tracking Link Box */}
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-950">Transporteur : Colissimo</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Suivi Actif
                </span>
              </div>
              <p className="font-mono font-bold text-gray-800 text-[11px] mb-2">
                N° {trackingNumber}
              </p>
              <a
                href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 text-[11px]"
              >
                <span>Vérifier sur La Poste</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
