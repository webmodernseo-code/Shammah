import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <section className="flat-spacing-3 pb-0">
      <div className="container">
        <div className="flat-title-2 d-xl-flex justify-content-xl-between align-items-start gap-4 mb-5">
          <div className="box-title">
            <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-2 d-block">
              Notre Histoire & Notre Vocation
            </span>
            <h2 className="display-lg-2 fw-bold text-gray-900" style={{ letterSpacing: "-0.5px" }}>
              Shammah — L'Éternel est ici
            </h2>
            <p className="text-xl text-gray-600 mt-2 font-serif italic">
              « Et dès ce jour, le nom de la ville sera : L'Éternel est ici. » — Ézéchiel 48:35
            </p>
          </div>
          <div className="box-text" style={{ maxWidth: "560px" }}>
            <p className="text-md text-gray-700 leading-relaxed mb-3">
              Née d'un profond désir de témoigner de l'amour divin dans le monde d'aujourd'hui,{" "}
              <strong className="text-dark">Shammah</strong> conçoit des vêtements et accessoires contemporains d'inspiration chrétienne.
              Notre mission est simple et audacieuse : transformer votre quotidien en une opportunité de proclamer la grâce, la paix et l'espérance.
            </p>
            <p className="text-md text-gray-700 leading-relaxed">
              À travers nos collections dédiées à l'homme, la femme, l'enfant et nos objets de foi (mugs, tote bags, papeterie),
              nous allions des designs épurés, des messages bibliques édifiants et une exigence irréprochable de qualité textile en coton biologique.
            </p>
          </div>
        </div>

        <div className="image radius-16 overflow-hidden mb-5" style={{ borderRadius: "20px" }}>
          <Image
            src="/images/section/about-shammah.jpg"
            alt="L'Atelier Shammah - Confection textile chrétienne écoresponsable"
            className="w-100 object-fit-cover"
            width={1440}
            height={960}
            style={{ maxHeight: "680px", objectPosition: "center" }}
            priority
          />
        </div>

        <div className="row g-4 py-4">
          <div className="col-12 mb-2">
            <div className="p-4 border bg-light" aria-labelledby="shammah-en-bref">
              <h3 id="shammah-en-bref" className="h4 mb-3">Shammah en bref</h3>
              <p className="mb-2"><strong>Shammah est une boutique chrétienne en ligne</strong> qui conçoit des vêtements, accessoires et cadeaux porteurs de messages bibliques.</p>
              <p className="mb-2"><strong>Produits :</strong> t-shirts, sweats, vêtements pour homme, femme et enfant, mugs, tote bags et objets de foi.</p>
              <p className="mb-2"><strong>Fabrication :</strong> impression à la demande afin de limiter la surproduction.</p>
              <p className="mb-0"><strong>Zones desservies :</strong> Paris, Île-de-France, Grenoble, France métropolitaine et, selon disponibilité des transporteurs, Afrique de l’Ouest.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-2xl bg-white border h-100 shadow-2xs">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-xl d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", backgroundColor: "#fef3c7", color: "#d97706" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h4 className="fw-bold text-gray-900 mb-0" style={{ fontSize: "17px" }}>
                  Foi & Sobriété
                </h4>
              </div>
              <p className="text-gray-600 mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Des typographies soignées, des symboles chrétiens discrets et des versets choisis avec recueillement pour un style moderne, digne et inspirant.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-2xl bg-white border h-100 shadow-2xs">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-xl d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", backgroundColor: "#ecfdf5", color: "#059669" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4 className="fw-bold text-gray-900 mb-0" style={{ fontSize: "17px" }}>
                  Respect de la Création
                </h4>
              </div>
              <p className="text-gray-600 mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Impression à la demande en Europe, zéro stock inutile, encres à l'eau sans solvants toxiques (certifiées OEKO-TEX) et cotons biologiques durables.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-2xl bg-white border h-100 shadow-2xs">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-xl d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <h4 className="fw-bold text-gray-900 mb-0" style={{ fontSize: "17px" }}>
                  Fraternité & Écoute
                </h4>
              </div>
              <p className="text-gray-600 mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Un contact direct et chaleureux par WhatsApp et email pour vous accompagner dans vos choix de tailles, cadeaux de baptêmes et commandes spéciales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
