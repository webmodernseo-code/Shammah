"use client";

import React, { useEffect, useRef, useState } from "react";

const EuroFlag = () => (
  <svg width="18" height="13" viewBox="0 0 20 15" fill="none" style={{ borderRadius: 2, marginRight: 6, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <rect width="20" height="15" fill="#003399" />
    <text x="10" y="11.5" textAnchor="middle" fill="#FFCC00" fontSize="11" fontWeight="bold" fontFamily="sans-serif">€</text>
  </svg>
);

const GbpFlag = () => (
  <svg width="18" height="13" viewBox="0 0 60 30" fill="none" style={{ borderRadius: 2, marginRight: 6, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <clipPath id="gbp-flag-clip"><rect width="60" height="30" rx="2" /></clipPath>
    <g clipPath="url(#gbp-flag-clip)">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const CfaFlag = () => (
  <svg width="18" height="13" viewBox="0 0 20 15" fill="none" style={{ borderRadius: 2, marginRight: 6, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <rect width="6.66" height="15" fill="#00853F" />
    <rect x="6.66" width="6.66" height="15" fill="#FDEF42" />
    <rect x="13.33" width="6.67" height="15" fill="#E31B23" />
  </svg>
);

const currencyOptions = [
  { value: "eur", symbol: "€", label: "EUR (€)", text: "Euro (EUR €)", flag: <EuroFlag /> },
  { value: "gbp", symbol: "£", label: "GBP (£)", text: "Livre Sterling (GBP £)", flag: <GbpFlag /> },
  { value: "cfa", symbol: "FCFA", label: "FCFA", text: "Franc CFA (FCFA)", flag: <CfaFlag /> },
];

export default function CurrencySelect({ topStart = false, light = false }) {
  const [selected, setSelected] = useState(currencyOptions[0]);
  const [isDDOpen, setIsDDOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDDOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown bootstrap-select image-select ${topStart ? "dropdown" : "dropup"}`}
      style={{ minWidth: "90px" }}
    >
      <button
        type="button"
        onClick={() => setIsDDOpen((pre) => !pre)}
        className={`btn dropdown-toggle btn-light d-flex align-items-center ${
          isDDOpen ? "show" : ""
        }`}
        style={{
          border: light ? "1px solid rgba(255,255,255,0.3)" : "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "5px 10px",
          fontSize: "13px",
          fontWeight: 600,
          background: light ? "transparent" : "#fff",
          color: light ? "#fff" : "inherit",
          cursor: "pointer",
        }}
      >
        <div className="d-flex align-items-center">
          {selected.flag}
          <span>{selected.label}</span>
        </div>
      </button>

      {isDDOpen && (
        <div
          className="dropdown-menu show"
          style={{
            position: "absolute",
            zIndex: 1050,
            top: topStart ? "100%" : "auto",
            bottom: topStart ? "auto" : "100%",
            left: 0,
            marginTop: topStart ? "4px" : "0px",
            marginBottom: topStart ? "0px" : "4px",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            padding: "4px",
            minWidth: "180px",
          }}
        >
          <ul className="list-unstyled mb-0">
            {currencyOptions.map((elm) => (
              <li key={elm.value}>
                <button
                  type="button"
                  className={`dropdown-item d-flex align-items-center w-100 text-start px-2 py-1.5 rounded ${
                    selected.value === elm.value ? "bg-light fw-bold" : ""
                  }`}
                  style={{ fontSize: "13px", border: "none", background: selected.value === elm.value ? "#f3f4f6" : "transparent", color: "#1f2937" }}
                  onClick={() => {
                    setSelected(elm);
                    setIsDDOpen(false);
                  }}
                >
                  {elm.flag}
                  <span>{elm.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
