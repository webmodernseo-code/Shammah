"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "../ui/progress-bar";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface Order {
  id: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
}

export default function OrderFulfillmentStatus() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setOrders(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not load orders for fulfillment:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const total = orders.length;

  const getCount = (statusList: string[]) => {
    return orders.filter((o) => statusList.includes(o.status)).length;
  };

  const shippedCount = getCount(["SHIPPED"]);
  const deliveredCount = getCount(["DELIVERED"]);
  const processingCount = getCount(["PROCESSING", "PAID"]);
  const pendingCount = getCount(["PENDING"]);
  const refundCount = getCount(["CANCELLED", "REFUNDED"]);

  const getPercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const fulfillmentData = [
    {
      label: "Livrées & Réceptionnées",
      count: deliveredCount,
      percentage: getPercent(deliveredCount),
      color: "bg-emerald-600",
      trackColor: "bg-emerald-100",
    },
    {
      label: "Expédiées (Colissimo / Relais)",
      count: shippedCount,
      percentage: getPercent(shippedCount),
      color: "bg-sky-500",
      trackColor: "bg-sky-100",
    },
    {
      label: "En préparation à l'atelier",
      count: processingCount,
      percentage: getPercent(processingCount),
      color: "bg-amber-500",
      trackColor: "bg-amber-100",
    },
    {
      label: "En attente de règlement",
      count: pendingCount,
      percentage: getPercent(pendingCount),
      color: "bg-indigo-500",
      trackColor: "bg-indigo-100",
    },
    {
      label: "Retours & Rétractations",
      count: refundCount,
      percentage: getPercent(refundCount),
      color: "bg-rose-500",
      trackColor: "bg-rose-100",
    },
  ];

  return (
    <DashboardCard
      title="Suivi Logistique & Expéditions Réelles"
      subtitle={total > 0 ? `${total} commande(s) enregistrée(s) au total` : "En attente des premières commandes boutique"}
    >
      <div className="space-y-4 pt-3">
        {fulfillmentData.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-gray-800">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900">
                  {item.count}
                </span>
                <span className="text-gray-400 text-xs">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
            <ProgressBar
              value={item.percentage}
              color={item.color}
              trackColor={item.trackColor}
              className="h-2 rounded-full"
            />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
