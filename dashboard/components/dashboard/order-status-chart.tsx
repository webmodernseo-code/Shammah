"use client";

import React, { useState, useEffect } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface StatusSegment {
  label: string;
  status: string;
  count: number;
  color: string;
}

export default function OrderStatusChart() {
  const [segments, setSegments] = useState<StatusSegment[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadStatusData() {
      try {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (Array.isArray(json.data.statusBreakdown)) {
              setSegments(json.data.statusBreakdown);
            }
            if (typeof json.data.totalOrdersCount === "number") {
              setTotalOrders(json.data.totalOrdersCount);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load order status breakdown:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStatusData();
  }, []);

  // SVG Donut calculation
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;


  const validTotal = totalOrders > 0 ? totalOrders : 1;

  return (
    <DashboardCard
      title="Statut des Commandes"
      subtitle="Répartition en temps réel des commandes boutique"
    >
      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">
          Chargement des données réelles...
        </div>
      ) : totalOrders === 0 ? (
        <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-2">
          <div className="w-full md:w-1/2 space-y-2.5">
            {[
              { label: "Commandes Livrées", count: 0, color: "#059669" },
              { label: "Expédiées (En route)", count: 0, color: "#0284c7" },
              { label: "En préparation atelier", count: 0, color: "#d97706" },
              { label: "En attente de paiement", count: 0, color: "#6366f1" },
              { label: "Retours & Remboursements", count: 0, color: "#e11d48" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-gray-50/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm truncate text-gray-700 font-medium">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">0</span>
                  <span className="text-[11px] text-gray-400 w-9 text-right font-semibold">(0%)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative min-h-[200px]">
            <div className="relative size-[180px] flex items-center justify-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth={strokeWidth}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900 leading-tight">0</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  Aucune commande
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-2">
          {/* Custom Legend */}
          <div className="w-full md:w-1/2 space-y-2.5">
            {segments.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const percentage = Math.round((item.count / validTotal) * 100);

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered ? "bg-gray-50/90 scale-[1.01]" : "hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-3 rounded-full shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: item.color,
                        transform: isHovered ? "scale(1.25)" : "scale(1)",
                      }}
                    />
                    <span
                      className={`text-xs sm:text-sm truncate transition-colors ${
                        isHovered ? "text-gray-900 font-semibold" : "text-gray-700 font-medium"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {item.count}
                    </span>
                    <span className="text-[11px] text-gray-600 w-9 text-right font-semibold">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pure SVG Donut Chart */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative min-h-[220px]">
            <div className="relative size-[200px] flex items-center justify-center">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
              >
                {/* Background Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth={strokeWidth}
                />
                {/* Dynamic Segments */}
                {segments.map((item, index) => {
                  if (item.count <= 0) return null;
                  const strokeDasharray = `${(item.count / validTotal) * circumference} ${circumference}`;
                  const previousCount = segments
                    .slice(0, index)
                    .reduce((total, segment) => total + Math.max(0, segment.count), 0);
                  const strokeDashoffset = -(previousCount / validTotal) * circumference;

                  const isHovered = hoveredIndex === index;

                  return (
                    <circle
                      key={item.label}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        filter: isHovered ? "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" : "none",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                {hoveredIndex !== null && segments[hoveredIndex] ? (
                  <>
                    <span
                      className="text-2xl font-extrabold leading-tight"
                      style={{ color: segments[hoveredIndex].color }}
                    >
                      {segments[hoveredIndex].count}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[110px]">
                      {segments[hoveredIndex].label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-gray-900 leading-tight">
                      {totalOrders}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      Total Commandes
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
