"use client";

import React, { useEffect, useState } from "react";
import {
  PackageIcon,
  PackageProcessIcon,
  DeliverySentIcon,
  CartRemoveIcon,
  PackageMovingIcon,
  PackageDelivered,
  TrolleyIcon,
} from "@/icons";

interface OrderStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}

const OrderStatCard: React.FC<OrderStatCardProps> = ({
  icon,
  label,
  value,
  bgColor,
}) => {
  return (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-gray-200/70 shadow-2xs`}>
      <div
        className="bg-white size-12 shrink-0 rounded-xl flex items-center justify-center shadow-2xs"
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-semibold mb-0.5">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default function OrderOverview() {
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const orders = json.data;
            setCounts({
              total: orders.length,
              pending: orders.filter((o: { status: string }) => o.status === "PENDING").length,
              processing: orders.filter((o: { status: string }) => o.status === "PROCESSING" || o.status === "PAID").length,
              shipped: orders.filter((o: { status: string }) => o.status === "SHIPPED").length,
              delivered: orders.filter((o: { status: string }) => o.status === "DELIVERED").length,
              cancelled: orders.filter((o: { status: string }) => o.status === "CANCELLED").length,
              refunded: orders.filter((o: { status: string }) => o.status === "REFUNDED").length,
            });
          }
        }
      } catch (err) {
        console.warn("Could not load order counts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const orderStats = [
    {
      icon: <PackageIcon className="size-6 text-emerald-700" />,
      label: "Total Commandes",
      value: loading ? "-" : counts.total,
      bgColor: "bg-emerald-50/70",
    },
    {
      icon: <PackageProcessIcon className="size-6 text-indigo-700" />,
      label: "En attente paiement",
      value: loading ? "-" : counts.pending,
      bgColor: "bg-indigo-50/70",
    },
    {
      icon: <PackageMovingIcon className="size-6 text-amber-700" />,
      label: "En préparation atelier",
      value: loading ? "-" : counts.processing,
      bgColor: "bg-amber-50/70",
    },
    {
      icon: <DeliverySentIcon className="size-6 text-sky-700" />,
      label: "Expédiées (En transit)",
      value: loading ? "-" : counts.shipped,
      bgColor: "bg-sky-50/70",
    },
    {
      icon: <PackageDelivered className="size-6 text-emerald-700" />,
      label: "Livrées & Validées",
      value: loading ? "-" : counts.delivered,
      bgColor: "bg-emerald-50/70",
    },
    {
      icon: <CartRemoveIcon className="size-6 text-gray-700" />,
      label: "Commandes Annulées",
      value: loading ? "-" : counts.cancelled,
      bgColor: "bg-gray-50",
    },
    {
      icon: <TrolleyIcon className="size-6 text-rose-700" />,
      label: "Retours / Remboursées",
      value: loading ? "-" : counts.refunded,
      bgColor: "bg-rose-50/70",
    },
  ];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Aperçu des Volumes de Commandes Réelles
          </h3>
          <p className="text-xs text-gray-500">
            Statistiques calculées en direct d'après les commandes enregistrées en base de données.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orderStats.map((stat, index) => (
          <OrderStatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            bgColor={stat.bgColor}
          />
        ))}
      </div>
    </div>
  );
}
