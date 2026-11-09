import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="shammah-hero-banner" aria-label="Collection principale Shammah">
      {/* Image studio plein écran (sans découpe artificielle) */}
      <div className="shammah-hero-bg">
        <Image
          src="/images/hero/hero-jesus-model.png"
          alt="Collection Shammah — T-shirt oversize noir Jesus porté en studio"
          fill
          priority
          sizes="100vw"
          className="shammah-hero-bg-img"
        />
        <div className="shammah-hero-overlay" aria-hidden="true" />
      </div>

      {/* Contenu éditorial aligné à gauche dans le conteneur */}
      <div className="container shammah-hero-container">
        <div className="shammah-hero-box">
          <span className="shammah-hero-eyebrow">Nouvelle collection</span>

          <h1 className="shammah-hero-heading">
            La foi, portée
            <br />
            avec caractère.
          </h1>

          <p className="shammah-hero-desc">
            Pièces chrétiennes haut de gamme. Coupes contemporaines
            <br className="d-none d-sm-inline" /> et coton lourd sélectionnés pour durer.
          </p>

          <div className="shammah-hero-actions">
            <Link href="/shop-default" className="shammah-hero-btn">
              Découvrir la boutique
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
