"use client";
import React, { useEffect, useRef, useState } from "react";

const FranceFlag = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" fill="none" style={{ borderRadius: 2, marginRight: 6, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <rect width="6" height="13" fill="#002395" />
    <rect x="6" width="6" height="13" fill="#FFFFFF" />
    <rect x="12" width="6" height="13" fill="#ED2939" />
  </svg>
);

const UkFlag = () => (
  <svg width="18" height="13" viewBox="0 0 60 30" fill="none" style={{ borderRadius: 2, marginRight: 6, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <clipPath id="uk-flag-clip"><rect width="60" height="30" rx="2" /></clipPath>
    <g clipPath="url(#uk-flag-clip)">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const languageOptions = [
  { id: "fr", label: "FR", full: "Français", flag: <FranceFlag /> },
  { id: "en", label: "EN", full: "English", flag: <UkFlag /> },
];

export default function LanguageSelect({
  parentClassName = "image-select center style-default type-languages",
  topStart = false,
}) {
  const [selected, setSelected] = useState(languageOptions[0]);
  const [isDDOpen, setIsDDOpen] = useState(false);
  const languageSelect = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageSelect.current &&
        !languageSelect.current.contains(event.target)
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
      className={`dropdown bootstrap-select ${parentClassName} ${topStart ? "dropdown" : "dropup"}`}
      ref={languageSelect}
      style={{ minWidth: "75px" }}
    >
      <button
        type="button"
        onClick={() => setIsDDOpen((pre) => !pre)}
        className={`btn dropdown-toggle btn-light d-flex align-items-center ${
          isDDOpen ? "show" : ""
        }`}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "5px 10px",
          fontSize: "13px",
          fontWeight: 600,
          background: "#fff",
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
            minWidth: "120px",
          }}
        >
          <ul className="list-unstyled mb-0">
            {languageOptions.map((elm) => (
              <li key={elm.id}>
                <button
                  type="button"
                  className={`dropdown-item d-flex align-items-center w-100 text-start px-2 py-1.5 rounded ${
                    selected.id === elm.id ? "bg-light fw-bold" : ""
                  }`}
                  style={{ fontSize: "13px", border: "none", background: selected.id === elm.id ? "#f3f4f6" : "transparent" }}
                  onClick={() => {
                    setSelected(elm);
                    setIsDDOpen(false);
                  }}
                >
                  {elm.flag}
                  <span>{elm.full}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
