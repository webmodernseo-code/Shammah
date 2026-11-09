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
    desc: "Coton bio épais",
    thumb: "/images/cls-categories/pod/t-shirts-jesus.jpg",
  },
  {
    slug: "sweats",
    title: "Sweats à capuche",
    desc: "Molleton structuré",
    thumb: "/images/cls-categories/pod/sweat-vert-jesus.jpg",
  },
  {
    slug: "casquettes",
    title: "Casquettes",
    desc: "Broderies fines",
    thumb: "/images/cls-categories/pod/bonnets-casquettes.jpg",
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

    // Sélectionner le verset du jour
    const dayIndex = new Date().getDate() % INSPIRING_VERSES.length;
    setVerse(INSPIRING_VERSES[dayIndex]);

    // Afficher une seule fois par session de navigation
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shammah-welcome-content">
          <div className="modal-top shammah-welcome-top">
            <Image
              src="/images/banner/jesus-createur.jpg"
              alt="Bienvenue chez Shammah — Créations chrétiennes"
              width={1024}
              height={572}
              className="shammah-welcome-img"
            />
            <button
              type="button"
              className="icon icon-close btn-hide-popup shammah-welcome-close"
              data-bs-dismiss="modal"
              onClick={handleClose}
              aria-label="Fermer"
            />
          </div>

          <div className="modal-bottom shammah-welcome-body text-center">
            <span className="shammah-welcome-badge">
              Parole &amp; Création Shammah
            </span>

            <h5 id="shammahWelcomeTitle" className="shammah-welcome-title">
              Portez votre foi avec caractère
            </h5>

            {/* Bloc Verset d'Inspiration (Option 3) */}
            <blockquote className="shammah-welcome-verse">
              <p className="verse-text">{verse.text}</p>
              <footer className="verse-ref">— {verse.ref}</footer>
            </blockquote>

            <p className="shammah-welcome-subtitle">
              Accédez directement à la catégorie de votre choix :
            </p>

            {/* Grille des 4 catégories avec mini-vignettes (Option 2) */}
            <div className="shammah-welcome-grid">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop-default?category=${cat.slug}`}
                  onClick={handleClose}
                  className="shammah-welcome-cat-card"
                >
                  <span className="shammah-welcome-cat-thumb">
                    <Image
                      src={cat.thumb}
                      alt={cat.title}
                      width={40}
                      height={40}
                    />
                  </span>
                  <span className="shammah-welcome-cat-text">
                    <span className="cat-name">{cat.title}</span>
                    <span className="cat-sub">{cat.desc}</span>
                  </span>
                  <svg
                    className="cat-arrow"
                    width="14"
                    height="14"
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
              ))}
            </div>

            <Link
              href="/shop-default"
              onClick={handleClose}
              className="shammah-welcome-cta"
            >
              <span>Explorer toute la collection</span>
              <svg
                width="16"
                height="16"
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

            <div className="shammah-welcome-reassurance">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                Confection soignée • Livraison offerte dès 60 € • Achat sans
                création de compte
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
