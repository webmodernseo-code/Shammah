"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function TypographySwitcher() {
  const [activeFont, setActiveFont] = useState("option-1");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check saved font preference, default to option-1 (Plus Jakarta Sans)
    const saved = localStorage.getItem("shammah-font-choice") || "option-1";
    applyFont(saved);
  }, []);

  const applyFont = (fontId) => {
    setActiveFont(fontId);
    if (typeof document !== "undefined") {
      document.body.classList.remove("font-option-1", "font-option-inter", "font-option-2", "font-option-3");
      if (fontId !== "default") {
        document.body.classList.add(`font-${fontId}`);
      }
      localStorage.setItem("shammah-font-choice", fontId);
    }
  };

  const options = [
    {
      id: "option-1",
      title: "Option 1 — Épure Moderne (Sans-Serif)",
      subtitle: "Outfit (titres) & Plus Jakarta Sans (textes)",
      badge: "Style Apple / Stripe",
      preview: "L'Éternel est ici — Shammah",
    },
    {
      id: "option-inter",
      title: "Option Inter — 100% Inter Sans-Serif",
      subtitle: "Inter (titres) & Inter (textes)",
      badge: "Standard Minimaliste UI",
      preview: "L'Éternel est ici — Shammah",
    },
    {
      id: "option-2",
      title: "Option 2 — Noblesse Biblique & Éditoriale",
      subtitle: "Cormorant Garamond & Plus Jakarta Sans",
      badge: "Style Édition Sainte",
      preview: "« Et dès ce jour, le nom sera : L'Éternel est ici »",
    },
    {
      id: "option-3",
      title: "Option 3 — Contemporain & Streetwear",
      subtitle: "Syne & DM Sans",
      badge: "Audacieux & Géométrique",
      preview: "FOI & ESPÉRANCE — SHAMMAH",
    },
    {
      id: "default",
      title: "Template Vineta d'origine",
      subtitle: "Poppins & Albert Sans",
      badge: "Standard",
      preview: "Typographie standard du template",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
      }}
    >
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="d-flex align-items-center gap-2 rounded-full px-3 py-2 border shadow-lg"
        style={{
          backgroundColor: "#18181b",
          color: "#ffffff",
          borderRadius: "9999px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle"
          style={{ width: "22px", height: "22px", backgroundColor: "rgba(255, 255, 255, 0.2)", fontSize: "11px", fontWeight: "700" }}
        >
          Aa
        </span>
        <span>Comparer les 3 Polices</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Popover Selection Box */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl p-3 border shadow-2xl mt-2 animate-in fade-in"
          style={{
            position: "absolute",
            bottom: "50px",
            left: "0",
            width: "360px",
            maxWidth: "90vw",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e4e4e7",
            boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
            <div>
              <span className="fw-bold text-gray-900 d-block" style={{ fontSize: "14px" }}>
                Choix Typographique Shammah
              </span>
              <span className="text-gray-500" style={{ fontSize: "11px" }}>
                Testez en direct sur cette page
              </span>
            </div>
            <Link
              href="/typography-preview"
              onClick={() => setIsOpen(false)}
              className="text-xs fw-semibold text-primary text-decoration-underline"
              style={{ fontSize: "12px" }}
            >
              Page comparative &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => applyFont(opt.id)}
                className="p-2 rounded-xl cursor-pointer transition-all mb-2"
                style={{
                  backgroundColor: activeFont === opt.id ? "#f4f4f5" : "transparent",
                  border: activeFont === opt.id ? "1.5px solid #18181b" : "1px solid #f4f4f5",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                    {opt.title}
                  </span>
                  <span
                    className="badge rounded-pill text-xs px-2 py-1"
                    style={{
                      fontSize: "10px",
                      backgroundColor: activeFont === opt.id ? "#18181b" : "#e4e4e7",
                      color: activeFont === opt.id ? "#ffffff" : "#52525b",
                    }}
                  >
                    {activeFont === opt.id ? "Actif" : opt.badge}
                  </span>
                </div>
                <div className="text-gray-500" style={{ fontSize: "11px", marginBottom: "4px" }}>
                  {opt.subtitle}
                </div>
                <div
                  className="rounded p-1 bg-white border text-dark fw-medium"
                  style={{
                    fontSize: "12px",
                    fontFamily:
                      opt.id === "option-1"
                        ? "'Outfit', sans-serif"
                        : opt.id === "option-2"
                        ? "'Cormorant Garamond', serif"
                        : opt.id === "option-3"
                        ? "'Syne', sans-serif"
                        : "inherit",
                  }}
                >
                  {opt.preview}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-top text-center">
            <small className="text-gray-400" style={{ fontSize: "11px" }}>
              Votre choix reste actif sur toutes les pages du site.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
