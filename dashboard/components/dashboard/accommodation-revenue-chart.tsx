"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface MonthData {
  month: string;
  value: number;
  full: string;
  isCurrent?: boolean;
}

const defaultMonths: MonthData[] = [
  { month: "Jan", value: 0, full: "0,00 €" },
  { month: "Fév", value: 0, full: "0,00 €" },
  { month: "Mar", value: 0, full: "0,00 €" },
  { month: "Avr", value: 0, full: "0,00 €" },
  { month: "Mai", value: 0, full: "0,00 €" },
  { month: "Juin", value: 0, full: "0,00 €" },
  { month: "Juil", value: 0, full: "0,00 €" },
  { month: "Août", value: 0, full: "0,00 €" },
  { month: "Sep", value: 0, full: "0,00 €", isCurrent: true },
  { month: "Oct", value: 0, full: "0,00 €" },
  { month: "Nov", value: 0, full: "0,00 €" },
  { month: "Déc", value: 0, full: "0,00 €" },
];

export default function AccommodationRevenueChart() {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>(defaultMonths);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    async function loadMonthlyData() {
      try {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && Array.isArray(json.data.monthlyRevenue)) {
            setMonthlyData(json.data.monthlyRevenue);
          }
        }
      } catch (err) {
        console.warn("Could not load monthly revenue data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyData();
  }, []);

  // Échelle graduée par paliers précis de 100 € (500 €, 400 €, 300 €, 200 €, 100 €, 0 €)
  const maxValue = useMemo(() => {
    const highest = Math.max(...monthlyData.map((d) => d.value), 0);
    if (highest <= 500) return 500; // Échelle de référence à 500 € (5 paliers de 100 €)
    return Math.ceil(highest / 100) * 100;
  }, [monthlyData]);

  const yAxisSteps = useMemo(() => {
    // Si maxValue <= 500, générer les paliers de 100 € : 500, 400, 300, 200, 100, 0
    if (maxValue <= 500) {
      return [500, 400, 300, 200, 100, 0];
    }
    // Si maxValue > 500, générer 5 ou 6 paliers équidistants arrondis aux 100 €
    const step = Math.ceil(maxValue / 5 / 100) * 100;
    const steps: number[] = [];
    for (let val = step * 5; val >= 0; val -= step) {
      steps.push(val);
    }
    return steps;
  }, [maxValue]);

  const topScale = yAxisSteps[0] || 500;

  return (
    <DashboardCard
      title="Chiffre d'Affaires Mensuel Réel"
      subtitle="Encaissements Stripe & PayPal par mois (échelle par paliers de 100 €)"
    >
      <div className="pt-3">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">
            Chargement des encaissements réels...
          </div>
        ) : (
          <>
            {/* Y Axis & Grid Container */}
            <div className="relative h-[220px] w-full flex items-end">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                {yAxisSteps.map((val) => (
                  <div key={val} className="flex items-center w-full">
                    <span className="text-[10px] font-semibold text-gray-500 w-14 shrink-0 text-right pr-2.5">
                      {val} €
                    </span>
                    <div className="h-px w-full bg-gray-100" />
                  </div>
                ))}
              </div>

              {/* Bars container */}
              <div className="relative w-full h-[calc(100%-24px)] flex items-end justify-between pl-16 pr-2 pb-1 gap-1 sm:gap-2">
                {monthlyData.map((item, index) => {
                  const heightPercent = topScale > 0 ? (item.value / topScale) * 100 : 0;
                  const isHovered = hoveredMonth === index;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(index)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-10 z-20 bg-gray-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          {item.month} : {item.full}
                          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                        </div>
                      )}

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                          item.value === 0
                            ? "bg-slate-200/60 h-[3px] min-h-[3px]"
                            : item.isCurrent
                              ? isHovered
                                ? "bg-primary scale-y-[1.03]"
                                : "bg-primary shadow-xs"
                              : isHovered
                                ? "bg-primary-dark"
                                : "bg-primary/85 hover:bg-primary"
                        }`}
                        style={{
                          height: item.value > 0 ? `${Math.max(heightPercent, 4)}%` : "3px",
                          transformOrigin: "bottom",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between pl-16 pr-2 pt-1 border-t border-slate-100">
              {monthlyData.map((item, index) => (
                <div
                  key={item.month}
                  className={`flex-1 text-center text-[10px] sm:text-[11px] font-medium transition-colors ${
                    hoveredMonth === index
                      ? "text-primary font-bold"
                      : item.isCurrent
                        ? "text-slate-900 font-bold"
                        : "text-slate-500"
                  }`}
                >
                  {item.month}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
}
