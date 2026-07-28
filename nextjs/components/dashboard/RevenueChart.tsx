"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Point = { label: string; revenue: number; orderCount: number };

export function RevenueChart({
  points,
  trendPercent,
  mode,
}: {
  points: Point[];
  trendPercent: number | null;
  mode: "week" | "month";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(...points.map((p) => p.revenue), 1);

  function setMode(next: "week" | "month") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("chart", next);
    router.push("/dashboard?" + params.toString());
  }

  return (
    <div id="revenue-chart" className="relative rounded-card bg-card-bg p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-heading">Chiffre d&apos;Affaires</h2>
        <div className="flex items-center gap-2">
          {trendPercent !== null && (
            <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (trendPercent >= 0 ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")}>
              {trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}%
            </span>
          )}
          <button id="revenue-chart-mode-week" onClick={() => setMode("week")} className={"rounded-full px-3 py-1 text-xs font-medium " + (mode === "week" ? "bg-accent-primary text-white" : "bg-gray-50 text-text-body")}>Semaine</button>
          <button id="revenue-chart-mode-month" onClick={() => setMode("month")} className={"rounded-full px-3 py-1 text-xs font-medium " + (mode === "month" ? "bg-accent-primary text-white" : "bg-gray-50 text-text-body")}>Mois</button>
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-3">
        {points.map((p, i) => (
          <div
            key={i}
            data-chart-bar
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div
              className="w-full rounded-t-md bg-accent-primary/80 transition-all"
              style={{ height: Math.max((p.revenue / max) * 128, 4) + "px" }}
            />
            <span className="text-xs text-text-body">{p.label}</span>
          </div>
        ))}
      </div>

      {hovered !== null && (
        <div
          id="revenue-chart-tooltip"
          className="absolute rounded-lg bg-text-heading px-3 py-2 text-xs text-white shadow-card"
          style={{ top: 56, left: `calc(${(hovered / points.length) * 100}% + 12px)` }}
        >
          <div className="font-semibold">{points[hovered].label}</div>
          <div>{points[hovered].orderCount} commande{points[hovered].orderCount !== 1 ? "s" : ""}</div>
          <div>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(points[hovered].revenue)}</div>
        </div>
      )}
    </div>
  );
}
