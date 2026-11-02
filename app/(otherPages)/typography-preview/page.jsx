"use client";

import React, { useState, useEffect } from "react";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Footer1 from "@/components/footers/Footer1";
import Image from "next/image";
import Link from "next/link";

export default function TypographyPreviewPage() {
  const [selectedFont, setSelectedFont] = useState("option-1");

  useEffect(() => {
    const saved = localStorage.getItem("shammah-font-choice") || "option-1";
    setSelectedFont(saved);
  }, []);

  const selectFont = (fontId) => {
    setSelectedFont(fontId);
    if (typeof document !== "undefined") {
      document.body.classList.remove("font-option-1", "font-option-inter", "font-option-2", "font-option-3");
      if (fontId !== "default") {
        document.body.classList.add(`font-${fontId}`);
      }
      localStorage.setItem("shammah-font-choice", fontId);
    }
  };

  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />

      <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "60px 0" }}>
        <div className="container">
          {/* Header intro */}
          <div className="text-center max-w-2xl mx-auto mb-5" style={{ maxWidth: "780px" }}>
            <span
              className="badge px-3 py-2 rounded-full mb-3"
              style={{ backgroundColor: "#18181b", color: "#ffffff", fontSize: "12px", letterSpacing: "0.5px" }}
            >
              Laboratoire de Design Shammah
            </span>
            <h1 className="fw-bold text-gray-900 mb-3" style={{ fontSize: "36px", letterSpacing: "-1px" }}>
              Visualisez & Comparez les 3 Options de Polices
            </h1>
            <p className="text-gray-600 mb-4" style={{ fontSize: "16px", lineHeight: "1.6" }}>
              Voici les 3 directions artistiques créées sur-mesure pour rompre avec le style standard du template Vineta.
              Cliquez sur un bouton pour l'activer en temps réel sur l'ensemble de la boutique, ou comparez les maquettes ci-dessous.
            </p>

            {/* Quick Switcher Bar */}
            <div
              className="d-inline-flex flex-wrap gap-2 p-2 bg-white rounded-2xl border shadow-sm"
              style={{ border: "1px solid #e4e4e7" }}
            >
              <button
                type="button"
                onClick={() => selectFont("option-1")}
                className="btn btn-sm px-3 py-2 rounded-xl fw-medium"
                style={{
                  backgroundColor: selectedFont === "option-1" ? "#18181b" : "transparent",
                  color: selectedFont === "option-1" ? "#ffffff" : "#3f3f46",
                  border: "none",
                  fontSize: "13px",
                }}
              >
                Option 1 : Épure Moderne (Recommandée)
              </button>

              <button
                type="button"
                onClick={() => selectFont("option-2")}
                className="btn btn-sm px-3 py-2 rounded-xl fw-medium"
                style={{
                  backgroundColor: selectedFont === "option-2" ? "#18181b" : "transparent",
                  color: selectedFont === "option-2" ? "#ffffff" : "#3f3f46",
                  border: "none",
                  fontSize: "13px",
                }}
              >
                Option 2 : Noblesse Biblique (Serif)
              </button>

              <button
                type="button"
                onClick={() => selectFont("option-3")}
                className="btn btn-sm px-3 py-2 rounded-xl fw-medium"
                style={{
                  backgroundColor: selectedFont === "option-3" ? "#18181b" : "transparent",
                  color: selectedFont === "option-3" ? "#ffffff" : "#3f3f46",
                  border: "none",
                  fontSize: "13px",
                }}
              >
                Option 3 : Streetwear Audacieux
              </button>
            </div>
          </div>

          {/* 3 Comparison Cards Side by Side */}
          <div className="row g-4 mb-5">
            {/* OPTION 1 */}
            <div className="col-lg-4">
              <div
                className={`p-4 rounded-3xl bg-white border h-100 transition-all ${
                  selectedFont === "option-1" ? "border-dark shadow-md" : "shadow-2xs"
                }`}
                style={{
                  border: selectedFont === "option-1" ? "2px solid #18181b" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-dark text-white text-xs px-2.5 py-1 rounded-pill">
                    Option 1 • Recommandée
                  </span>
                  {selectedFont === "option-1" && (
                    <span className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Active sur le site
                    </span>
                  )}
                </div>

                <h3 className="fw-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px" }}>
                  Outfit + Plus Jakarta Sans
                </h3>
                <p className="text-muted mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px" }}>
                  Minimalisme lumineux, géométrie contemporaine & pureté Apple / Stripe.
                </p>

                {/* Live Mockup Box */}
                <div
                  className="p-3 rounded-2xl mb-4"
                  style={{
                    backgroundColor: "#fcfcfc",
                    border: "1px solid #f0f0f0",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <p
                    className="fw-bold text-gray-900 mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: "19px", letterSpacing: "-0.5px" }}
                  >
                    Shammah — L'Éternel est ici
                  </p>
                  <p className="text-gray-600 mb-3" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                    « Et dès ce jour, le nom de la ville sera : L'Éternel est ici. » (Ézéchiel 48:35)
                  </p>

                  <div className="p-3 bg-white rounded-xl border mb-2 d-flex align-items-center gap-3">
                    <div
                      className="rounded-lg overflow-hidden flex-shrink-0"
                      style={{ width: "48px", height: "58px", backgroundColor: "#f3f4f6" }}
                    >
                      <Image
                        src="/images/products/pod/product-5.jpg"
                        alt="T-shirt"
                        width={48}
                        height={58}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div>
                      <p className="fw-semibold text-gray-900 mb-0" style={{ fontSize: "13px" }}>
                        T-shirt Foi & Espérance Bio
                      </p>
                      <span className="fw-bold text-gray-900" style={{ fontSize: "14px" }}>
                        34.00 €
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-dark w-100 rounded-xl py-2 fw-medium"
                    style={{ fontSize: "13px" }}
                  >
                    Ajouter au panier
                  </button>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-gray-800 mb-2" style={{ fontSize: "13px" }}>
                    Points forts :
                  </h6>
                  <ul className="list-unstyled space-y-1 text-gray-600 ps-1" style={{ fontSize: "13px" }}>
                    <li>✓ Élimine l'effet générique « template Vineta »</li>
                    <li>✓ Lisibilité parfaite sur tous les smartphones</li>
                    <li>✓ Rendu ultra-propre, moderne et bienveillant</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => selectFont("option-1")}
                  className={`btn w-100 rounded-xl py-2.5 fw-semibold ${
                    selectedFont === "option-1" ? "btn-dark" : "btn-outline-dark"
                  }`}
                  style={{ fontSize: "14px" }}
                >
                  {selectedFont === "option-1" ? "Police Actuellement Choisie" : "Choisir l'Option 1"}
                </button>
              </div>
            </div>

            {/* OPTION 2 */}
            <div className="col-lg-4">
              <div
                className={`p-4 rounded-3xl bg-white border h-100 transition-all ${
                  selectedFont === "option-2" ? "border-dark shadow-md" : "shadow-2xs"
                }`}
                style={{
                  border: selectedFont === "option-2" ? "2px solid #18181b" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    className="badge text-xs px-2.5 py-1 rounded-pill"
                    style={{ backgroundColor: "#92400e", color: "#ffffff" }}
                  >
                    Option 2 • Noblesse Éditoriale
                  </span>
                  {selectedFont === "option-2" && (
                    <span className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Active sur le site
                    </span>
                  )}
                </div>

                <h3 className="fw-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "25px" }}>
                  Cormorant + Plus Jakarta Sans
                </h3>
                <p className="text-muted mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px" }}>
                  Noblesse historique des Écritures, esprit livre d'art & élégance sacrée.
                </p>

                {/* Live Mockup Box */}
                <div
                  className="p-3 rounded-2xl mb-4"
                  style={{
                    backgroundColor: "#fcfcfc",
                    border: "1px solid #f0f0f0",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <p
                    className="fw-bold text-gray-900 mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", letterSpacing: "0.2px" }}
                  >
                    Shammah — L'Éternel est ici
                  </p>
                  <p
                    className="text-gray-600 mb-3 font-italic"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontStyle: "italic", lineHeight: "1.4" }}
                  >
                    « Et dès ce jour, le nom de la ville sera : L'Éternel est ici. » (Ézéchiel 48:35)
                  </p>

                  <div className="p-3 bg-white rounded-xl border mb-2 d-flex align-items-center gap-3">
                    <div
                      className="rounded-lg overflow-hidden flex-shrink-0"
                      style={{ width: "48px", height: "58px", backgroundColor: "#f3f4f6" }}
                    >
                      <Image
                        src="/images/products/pod/product-6.jpg"
                        alt="Hoodie"
                        width={48}
                        height={58}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div>
                      <p className="fw-semibold text-gray-900 mb-0" style={{ fontSize: "13px" }}>
                        Hoodie Grâce Infinie Shammah
                      </p>
                      <span className="fw-bold text-gray-900" style={{ fontSize: "14px" }}>
                        55.00 €
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-dark w-100 rounded-xl py-2 fw-medium"
                    style={{ fontSize: "13px" }}
                  >
                    Ajouter au panier
                  </button>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-gray-800 mb-2" style={{ fontSize: "13px" }}>
                    Points forts :
                  </h6>
                  <ul className="list-unstyled space-y-1 text-gray-600 ps-1" style={{ fontSize: "13px" }}>
                    <li>✓ Sublimation des citations et versets bibliques</li>
                    <li>✓ Donne un cachet prestigieux, poétique et intemporel</li>
                    <li>✓ Corps de texte moderne conservé pour les boutons & prix</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => selectFont("option-2")}
                  className={`btn w-100 rounded-xl py-2.5 fw-semibold ${
                    selectedFont === "option-2" ? "btn-dark" : "btn-outline-dark"
                  }`}
                  style={{ fontSize: "14px" }}
                >
                  {selectedFont === "option-2" ? "Police Actuellement Choisie" : "Choisir l'Option 2"}
                </button>
              </div>
            </div>

            {/* OPTION 3 */}
            <div className="col-lg-4">
              <div
                className={`p-4 rounded-3xl bg-white border h-100 transition-all ${
                  selectedFont === "option-3" ? "border-dark shadow-md" : "shadow-2xs"
                }`}
                style={{
                  border: selectedFont === "option-3" ? "2px solid #18181b" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    className="badge text-xs px-2.5 py-1 rounded-pill"
                    style={{ backgroundColor: "#1e1b4b", color: "#ffffff" }}
                  >
                    Option 3 • Streetwear Audacieux
                  </span>
                  {selectedFont === "option-3" && (
                    <span className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Active sur le site
                    </span>
                  )}
                </div>

                <h3 className="fw-bold mb-1" style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", letterSpacing: "-0.5px" }}>
                  Syne + DM Sans
                </h3>
                <p className="text-muted mb-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}>
                  Impact fort, géométrie affirmée & culture streetwear chrétien moderne.
                </p>

                {/* Live Mockup Box */}
                <div
                  className="p-3 rounded-2xl mb-4"
                  style={{
                    backgroundColor: "#fcfcfc",
                    border: "1px solid #f0f0f0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <p
                    className="fw-bold text-gray-900 mb-1"
                    style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", letterSpacing: "-0.5px" }}
                  >
                    SHAMMAH — L'ÉTERNEL EST ICI
                  </p>
                  <p className="text-gray-600 mb-3" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                    « Car je n'ai point honte de l'Évangile : c'est la puissance de Dieu. » (Romains 1:16)
                  </p>

                  <div className="p-3 bg-white rounded-xl border mb-2 d-flex align-items-center gap-3">
                    <div
                      className="rounded-lg overflow-hidden flex-shrink-0"
                      style={{ width: "48px", height: "58px", backgroundColor: "#f3f4f6" }}
                    >
                      <Image
                        src="/images/products/pod/product-7.jpg"
                        alt="Sweat"
                        width={48}
                        height={58}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div>
                      <p className="fw-semibold text-gray-900 mb-0" style={{ fontSize: "13px" }}>
                        Sweatshirt Témoignage Bio
                      </p>
                      <span className="fw-bold text-gray-900" style={{ fontSize: "14px" }}>
                        49.00 €
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-dark w-100 rounded-xl py-2 fw-medium"
                    style={{ fontSize: "13px" }}
                  >
                    Ajouter au panier
                  </button>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-gray-800 mb-2" style={{ fontSize: "13px" }}>
                    Points forts :
                  </h6>
                  <ul className="list-unstyled space-y-1 text-gray-600 ps-1" style={{ fontSize: "13px" }}>
                    <li>✓ Caractère très affirmé et contemporain</li>
                    <li>✓ Parfait pour les pièces oversize et capsules graphiques</li>
                    <li>✓ Idéal pour séduire un public jeune et dynamique</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => selectFont("option-3")}
                  className={`btn w-100 rounded-xl py-2.5 fw-semibold ${
                    selectedFont === "option-3" ? "btn-dark" : "btn-outline-dark"
                  }`}
                  style={{ fontSize: "14px" }}
                >
                  {selectedFont === "option-3" ? "Police Actuellement Choisie" : "Choisir l'Option 3"}
                </button>
              </div>
            </div>
          </div>

          {/* Direct Links to test across the site */}
          <div className="p-4 rounded-2xl bg-white border text-center shadow-2xs">
            <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "18px" }}>
              Explorez maintenant le vrai site avec votre police favorite :
            </h4>
            <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>
              En cliquant sur l'une des options ci-dessus ou sur le bouton flottant en bas à gauche, tout le site est immédiatement transformé.
            </p>

            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link href="/" className="tf-btn btn-dark2 rounded-xl py-2.5 px-4">
                Voir la Page d'Accueil
              </Link>
              <Link href="/product-detail/1" className="tf-btn btn-white hover-dark rounded-xl py-2.5 px-4">
                Voir la Fiche Produit
              </Link>
              <Link href="/shop-default" className="tf-btn btn-white hover-dark rounded-xl py-2.5 px-4">
                Voir la Boutique & Filtres
              </Link>
              <Link href="/checkout" className="tf-btn btn-white hover-dark rounded-xl py-2.5 px-4">
                Voir la Page Commande WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer1 />
    </>
  );
}
