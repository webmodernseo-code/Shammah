"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const SLIDES = [
  {
    id: "01",
    tag: "Édition Limitée",
    title: "LIMITED DROPS, MAXIMUM IMPACT",
    subtitle:
      "Chaque pièce est produite en tirage soigné. Des créations exclusives pensées pour marquer les cœurs et traverser le temps.",
    tabNumber: "01",
    tabTitle: "Limited Drops,\nMaximum Impact",
    image: "/images/hero/hero-hoodie-blend.png",
    imageType: "product",
    alt: "Sweat à capuche chrétien JESUS Shammah Édition Limitée",
    ctaText: "Découvrir l'édition",
    ctaLink: "/shop-default?collection=limited",
  },
  {
    id: "02",
    tag: "Coupes Urbaines",
    title: "BUILT FOR THE STREETS",
    subtitle:
      "Coupe oversize contemporaine, tombé lourd et confort absolu. Une allure épurée conçue pour votre rythme et vos journées.",
    tabNumber: "02",
    tabTitle: "Built for the Streets",
    image: "/images/hero/hero-model-blend.png",
    imageType: "model",
    alt: "T-shirt chrétien oversize Jesus Shammah porté par le mannequin",
    ctaText: "Voir les t-shirts",
    ctaLink: "/shop-default?category=homme",
  },
  {
    id: "03",
    tag: "Foi & Style",
    title: "FAITH MEETS STYLE",
    subtitle:
      "Quand l'élégance minimaliste rencontre la puissance d'un témoignage. Affirmez votre foi avec fierté, authenticité et audace.",
    tabNumber: "03",
    tabTitle: "Faith Meets Style",
    image: "/images/hero/hero-hoodie-blend.png",
    imageType: "product",
    alt: "Hoodie chrétien JESUS Shammah noir haut de gamme",
    ctaText: "Explorer la collection",
    ctaLink: "/shop-default",
  },
  {
    id: "04",
    tag: "Confection Responsable",
    title: "FUTURE-READY FASHION",
    subtitle:
      "Coton biologique premium, finitions haute résistance et impression de précision réalisée en France pour une durabilité exemplaire.",
    tabNumber: "04",
    tabTitle: "Future-Ready Fashion",
    image: "/images/hero/hero-model-blend.png",
    imageType: "model",
    alt: "Vêtement chrétien éthique Shammah en coton durable",
    ctaText: "Nos engagements",
    ctaLink: "/about-us",
  },
  {
    id: "05",
    tag: "Mouvement & Communauté",
    title: "COMMUNITY-DRIVEN CULTURE",
    subtitle:
      "Bien plus qu'une marque, nous sommes un mouvement — rassemblant les créatifs, passionnés et visionnaires qui portent l'espérance.",
    tabNumber: "05",
    tabTitle: "Community-Driven Culture",
    image: "/images/hero/hero-hoodie-blend.png",
    imageType: "product",
    alt: "Sweat à capuche JESUS Shammah Community-Driven Culture",
    ctaText: "Rejoindre le mouvement",
    ctaLink: "/shop-collection-list",
  },
];

const DURATION_MS = 6000;
const TICK_MS = 50;

export default function Hero() {
  // Par défaut, démarrer sur la slide 05 (index 4) comme sur la maquette de référence
  const [currentIndex, setCurrentIndex] = useState(4);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Gestion du défilement automatique avec barre de progression dynamique
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_MS / DURATION_MS) * 100;
        if (next >= 100) {
          setCurrentIndex((idx) => (idx + 1) % SLIDES.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  const handleSelectSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Support des gestes tactiles (swipe mobile)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe vers la gauche -> slide suivante
        handleSelectSlide((currentIndex + 1) % SLIDES.length);
      } else {
        // Swipe vers la droite -> slide précédente
        handleSelectSlide((currentIndex - 1 + SLIDES.length) % SLIDES.length);
      }
    }
    touchStartXRef.current = null;
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section className="shammah-hero-wrapper" aria-label="Présentation Shammah">
      <div
        className="shammah-hero-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Corps principal : Texte percutant à gauche + Visuel studio à droite */}
        <div className="shammah-hero-main">
          {/* Colonne gauche : Contenu typographique */}
          <div className="shammah-hero-content" key={currentSlide.id}>
            <span className="shammah-hero-tag">{currentSlide.tag}</span>
            <h1 className="shammah-hero-title">{currentSlide.title}</h1>
            <p className="shammah-hero-sub">{currentSlide.subtitle}</p>

            <Link href={currentSlide.ctaLink} className="shammah-hero-cta">
              <span>{currentSlide.ctaText}</span>
              <span className="shammah-cta-icon" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Colonne droite : Visuel studio avec halo atmosphérique */}
          <div className="shammah-hero-visual" key={`vis-${currentSlide.id}`}>
            <div className="shammah-visual-glow" aria-hidden="true" />

            {currentSlide.imageType === "model" ? (
              <Image
                src={currentSlide.image}
                alt={currentSlide.alt}
                width={800}
                height={576}
                priority
                className="shammah-visual-img shammah-visual-model"
              />
            ) : (
              <Image
                src={currentSlide.image}
                alt={currentSlide.alt}
                width={480}
                height={480}
                priority
                className="shammah-visual-img shammah-visual-hoodie"
              />
            )}
          </div>
        </div>

        {/* Barre de navigation inférieure : 5 onglets segmentés avec barre de progression */}
        <div className="shammah-hero-tabs-wrap">
          <nav className="shammah-hero-tabs" aria-label="Navigation des collections">
            {SLIDES.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  className={`shammah-tab-item ${isActive ? "active" : ""}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {/* Piste et barre de progression dynamique */}
                  <div className="shammah-tab-track">
                    <div
                      className="shammah-tab-progress"
                      style={{
                        width: isActive ? `${progress}%` : "0%",
                      }}
                    />
                  </div>

                  <span className="shammah-tab-num">{slide.tabNumber}</span>
                  <span className="shammah-tab-title">
                    {slide.tabTitle.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < slide.tabTitle.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
