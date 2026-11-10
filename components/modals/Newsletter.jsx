"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const INSPIRING_VERSES = [
  {
    text: "« Car je n’ai point honte de l’Évangile : c’est une puissance de Dieu pour le salut de quiconque croit. »",
    ref: "Romains 1:16",
  },
  {
    text: "« Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée. »",
    ref: "Matthieu 5:14",
  },
  {
    text: "« Fortifie-toi et prends courage, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras. »",
    ref: "Josué 1:9",
  },
];

const QUICK_CATEGORIES = [
  {
    slug: "t-shirts",
    title: "T-shirts",
    desc: "Coton bio",
    thumb: "/images/cls-categories/pod/t-shirts-jesus.jpg",
  },
  {
    slug: "sweats",
    title: "Sweats à capuche",
    desc: "Molleton doux",
    thumb: "/images/cls-categories/pod/sweat-vert-jesus.jpg",
  },
  {
    slug: "casquettes",
    title: "Casquettes",
    desc: "Broderies fines",
    thumb: "/images/cls-categories/pod/casquette-jesus.jpg",
  },
  {
    slug: "accessoires",
    title: "Accessoires",
    desc: "Tasses & quotidien",
    thumb: "/images/cls-categories/pod/accessories-mug.jpg",
  },
];

export default function Newsletter() {
  const modalElement = useRef(null);
  const modalInstanceRef = useRef(null);
  const [verse, setVerse] = useState(INSPIRING_VERSES[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dayIndex = new Date().getDate() % INSPIRING_VERSES.length;
    setVerse(INSPIRING_VERSES[dayIndex]);

    const alreadySeenSession =
      sessionStorage.getItem("shammah_welcome_seen") === "true";
    if (alreadySeenSession) return;

    let timer;
    const showModal = async () => {
      const bootstrap = await import("bootstrap");
      const el = document.getElementById("newsletterPopup");
      if (!el) return;

      const myModal = new bootstrap.Modal(el, {
        keyboard: true,
      });
      modalInstanceRef.current = myModal;

      timer = setTimeout(() => {
        myModal.show();
        sessionStorage.setItem("shammah_welcome_seen", "true");
      }, 2000);

      el.addEventListener("hidden.bs.modal", () => {
        sessionStorage.setItem("shammah_welcome_seen", "true");
      });
    };

    showModal();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("shammah_welcome_seen", "true");
    }
    if (modalInstanceRef.current) {
      modalInstanceRef.current.hide();
    }
  };

  return (
    <div
      className="modal modalCentered fade auto-popup modal-newsletter shammah-welcome-modal"
      id="newsletterPopup"
      ref={modalElement}
      tabIndex={-1}
      aria-labelledby="shammahWelcomeTitle"
      aria-hidden="true"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "480px", margin: "10px auto" }}
      >
        <div
          className="modal-content shammah-welcome-content"
          style={{
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            padding: "14px 16px",
            position: "relative",
          }}
        >
          <div className="shammah-welcome-visual" aria-hidden="true">
            <Image
              src="/images/banner/jesus-createur.jpg"
              alt=""
              width={1024}
              height={572}
              className="shammah-welcome-img"
              priority
            />
          </div>
          <button
            type="button"
            className="icon icon-close btn-hide-popup shammah-welcome-close"
            data-bs-dismiss="modal"
            onClick={handleClose}
            aria-label="Fermer"
            style={{
              position: "absolute",
              top: "8px",
              right: "10px",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: "#f4f4f5",
              color: "#09090b",
              border: "1px solid #e4e4e7",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              cursor: "pointer",
              zIndex: 5,
            }}
          />

          <div
            className="shammah-welcome-body text-center"
            style={{ padding: 0, maxWidth: "100%", margin: 0 }}
          >
            <div
              className="shammah-welcome-header-row"
              style={{ marginBottom: "6px", paddingRight: "20px", paddingLeft: "20px" }}
            >
              <span
                className="shammah-welcome-badge"
                style={{
                  display: "inline-block",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "#52525b",
                  backgroundColor: "#f4f4f5",
                  border: "1px solid #e4e4e7",
                  padding: "1px 8px",
                  borderRadius: "999px",
                  marginBottom: "2px",
                }}
              >
                Parole &amp; Création Shammah
              </span>
              <h5
                id="shammahWelcomeTitle"
                className="shammah-welcome-title"
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 800,
                  color: "#09090b",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Portez votre foi avec caractère
              </h5>
            </div>

            {/* Verset d'inspiration ultra-compact */}
            <blockquote
              className="shammah-welcome-verse"
              style={{
                backgroundColor: "#fafafa",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "6px 10px",
                margin: "0 0 8px 0",
              }}
            >
              <p
                className="verse-text"
                style={{
                  fontSize: "11.5px",
                  lineHeight: 1.35,
                  color: "#27272a",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {verse.text}{" "}
                <strong
                  className="verse-ref"
                  style={{ fontStyle: "normal", color: "#09090b", fontWeight: 700 }}
                >
                  ({verse.ref})
                </strong>
              </p>
            </blockquote>

            {/* Grille stricte 2x2 (2 à 2) des 4 catégories */}
            <div
              className="shammah-welcome-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop-default?category=${cat.slug}`}
                  onClick={handleClose}
                  className="shammah-welcome-cat-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "5px 7px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    textDecoration: "none",
                    textAlign: "left",
                    minWidth: 0,
                  }}
                >
                  <span
                    className="shammah-welcome-cat-thumb"
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#ffffff",
                      overflow: "hidden",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={cat.thumb}
                      alt={cat.title}
                      width={28}
                      height={28}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </span>
                  <span
                    className="shammah-welcome-cat-text"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="cat-name"
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#09090b",
                        lineHeight: 1.15,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cat.title}
                    </span>
                    <span
                      className="cat-sub"
                      style={{
                        fontSize: "10px",
                        color: "#71717a",
                        lineHeight: 1.15,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cat.desc}
                    </span>
                  </span>
                  <svg
                    className="cat-arrow"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, color: "#a1a1aa" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <Link
              href="/shop-default"
              onClick={handleClose}
              className="shammah-welcome-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#09090b",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: "6px",
              }}
            >
              <span>Explorer toute la collection</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <div
              className="shammah-welcome-reassurance"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontSize: "10.5px",
                color: "#71717a",
                lineHeight: 1.2,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Livraison offerte dès 60 € • Achat rapide sans compte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
