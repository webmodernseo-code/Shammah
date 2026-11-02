"use client";

import React, { useState, useMemo, useEffect } from "react";

interface MonthRevenue {
  month: string;
  value: number;
  full: string;
}

export default function ProfitMarginChart() {
  const [monthlyEarnings, setMonthlyEarnings] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categories = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && Array.isArray(json.data.monthlyRevenue)) {
            const values = json.data.monthlyRevenue.map((m: MonthRevenue) => m.value || 0);
            setMonthlyEarnings(values);
          }
        }
      } catch (err) {
        console.warn("Could not load profit margin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Marge nette estimée (~60% sur les collections prêt-à-porter Shammah)
  const profits = useMemo(() => {
    return monthlyEarnings.map((v) => Math.round(v * 0.6 * 100) / 100);
  }, [monthlyEarnings]);

  // Échelle par paliers de 100 €
  const maxVal = useMemo(() => {
    const maxEarnings = Math.max(...monthlyEarnings, 0);
    if (maxEarnings <= 500) return 500;
    return Math.ceil(maxEarnings / 100) * 100;
  }, [monthlyEarnings]);

  // SVG dimensions
  const width = 600;
  const height = 220;
  const paddingX = 45;
  const paddingY = 20;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const pointsCount = categories.length;

  const getX = (idx: number) => {
    if (pointsCount <= 1) return width / 2;
    return paddingX + (idx / (pointsCount - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return height - paddingY - (val / maxVal) * innerHeight;
  };

  // Build SVG paths
  const earningsPoints = monthlyEarnings.map((v, i) => `${getX(i)},${getY(v)}`);
  const earningsPath = `M ${earningsPoints.join(" L ")}`;
  const earningsArea = `${earningsPath} L ${getX(pointsCount - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  const profitsPoints = profits.map((v, i) => `${getX(i)},${getY(v)}`);
  const profitsPath = `M ${profitsPoints.join(" L ")}`;

  return (
    <div className="w-full pb-6">
      {/* Header */}
      <div className="pt-2 pb-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Évolution des Ventes & Marge Réelle
        </h3>
        <p className="text-xs text-gray-500">
          Suivi des encaissements mensuels et rentabilité réelle sur l'année en cours (échelle par paliers de 100 €)
        </p>

        {/* Legend */}
        <div className="flex items-center gap-5 py-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            <span className="text-gray-700 font-semibold">Chiffre d'Affaires Encaissé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-700 font-semibold">Marge Estimée</span>
          </div>
        </div>
      </div>

      {/* SVG Vector Line & Area Chart */}
      <div className="relative w-full h-[240px] flex items-center justify-center">
        {loading ? (
          <div className="text-xs text-gray-400">Chargement des courbes réelles...</div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + ratio * innerHeight;
              const val = Math.round(maxVal * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#9ca3af"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {val} €
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={earningsArea} fill="url(#emeraldGrad)" />

            {/* Line 1: Earnings (Emerald) */}
            <path
              d={earningsPath}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line 2: Profits (Amber) */}
            <path
              d={profitsPath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />

            {/* Data Points */}
            {monthlyEarnings.map((val, idx) => {
              const x = getX(idx);
              const yE = getY(val);
              const yP = getY(profits[idx]);
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Hit area */}
                  <rect
                    x={x - 15}
                    y={0}
                    width={30}
                    height={height}
                    fill="transparent"
                  />

                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={height - paddingY}
                      stroke="#e5e7eb"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Earnings dot */}
                  <circle
                    cx={x}
                    cy={yE}
                    r={isHovered ? 5 : 3.5}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />

                  {/* Profit dot */}
                  <circle
                    cx={x}
                    cy={yP}
                    r={isHovered ? 4.5 : 3}
                    fill="#d97706"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute -top-3 z-30 bg-gray-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none transform -translate-x-1/2 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
            }}
          >
            <span className="font-bold text-gray-300">
              {categories[hoveredIdx]} :
            </span>
            <span className="text-emerald-400 font-bold">
              CA: {monthlyEarnings[hoveredIdx].toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </span>
            <span className="text-amber-300 font-bold">
              Marge: {profits[hoveredIdx].toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </span>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between pl-10 pr-10 pt-2">
        {categories.map((cat, idx) => (
          <span
            key={cat}
            className={`text-[10px] sm:text-[11px] font-semibold transition-colors ${
              hoveredIdx === idx ? "text-emerald-700 font-bold" : "text-gray-400"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
