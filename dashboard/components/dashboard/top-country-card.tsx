"use client";

import React from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";

const destinations = [
  {
    name: "France Métropolitaine",
    code: "FR",
    sales: "11 580 €",
    percentage: "78%",
    data: [12, 14, 15, 18, 20, 22, 25],
    color: "#059669", // Emerald
  },
  {
    name: "Belgique",
    code: "BE",
    sales: "1 780 €",
    percentage: "12%",
    data: [8, 10, 11, 12, 14, 15, 17],
    color: "#0284c7", // Sky
  },
  {
    name: "Suisse",
    code: "CH",
    sales: "890 €",
    percentage: "6%",
    data: [5, 6, 7, 7, 8, 9, 10],
    color: "#d97706", // Amber
  },
  {
    name: "Luxembourg & Autres",
    code: "LU",
    sales: "600 €",
    percentage: "4%",
    data: [3, 4, 4, 5, 5, 6, 7],
    color: "#7c3aed", // Purple
  },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 70;
  const height = 24;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TopCountryCard() {
  return (
    <DashboardCard
      title="Destinations de Livraison"
      subtitle="Répartition des commandes expédiées"
    >
      <div className="space-y-4 pt-2">
        {destinations.map((dest, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0">
                {dest.code}
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-xs sm:text-sm block">
                  {dest.name}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {dest.percentage} des livraisons
                </span>
              </div>
            </div>

            <div className="flex-1 h-6 max-w-[70px] flex items-center justify-center">
              <Sparkline data={dest.data} color={dest.color} />
            </div>

            <div className="text-right">
              <span className="font-bold text-xs sm:text-sm text-gray-900">
                {dest.sales}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
