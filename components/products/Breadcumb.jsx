"use client";
import Link from "next/link";
import Image from "next/image";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CATEGORY_META = {
  "t-shirts": {
    eyebrow: "Essentiels Shammah",
    title: "Collection T-shirts",
    crumb: "T-shirts",
    desc: "T-shirts streetwear chrétiens en coton biologique épais : coupes classiques et oversize pensées pour affirmer votre foi avec sobriété.",
    heroImage: "/images/collections/hero-collection-homme.jpg",
    heroAlt: "Collection T-shirts Shammah — Modèle Jésus porté en studio",
  },
  "sweats-a-capuche": {
    eyebrow: "Molleton Lourd",
    title: "Sweats à capuche",
    crumb: "Sweats à capuche",
    desc: "Hoodies haut de gamme au tombé structuré, confectionnés dans un coton molletonné dense et durable.",
  },
  hoodies: {
    eyebrow: "Molleton Lourd",
    title: "Sweats à capuche",
    crumb: "Sweats à capuche",
    desc: "Hoodies haut de gamme au tombé structuré, confectionnés dans un coton molletonné dense et durable.",
  },
  sweats: {
    eyebrow: "Molleton Lourd",
    title: "Sweats à capuche",
    crumb: "Sweats à capuche",
    desc: "Hoodies haut de gamme et sweats confectionnés dans un coton molletonné dense, doux et durable.",
  },
  casquettes: {
    eyebrow: "Broderies Signature",
    title: "Casquettes",
    crumb: "Casquettes",
    desc: "Casquettes structurées en coton épais et finement brodées pour affirmer votre foi au quotidien.",
  },
  "bonnets-casquettes": {
    eyebrow: "Broderies Signature",
    title: "Casquettes",
    crumb: "Casquettes",
    desc: "Casquettes structurées en coton épais et finement brodées pour affirmer votre foi au quotidien.",
  },
  accessoires: {
    eyebrow: "Objets & Quotidien",
    title: "Accessoires & Tasses",
    crumb: "Accessoires",
    desc: "Tasses en céramique, mugs, tote bags et créations du quotidien pensés pour vous accompagner et témoigner de votre foi jour après jour.",
  },
  gadgets: {
    eyebrow: "Objets & Quotidien",
    title: "Accessoires & Objets de Foi",
    crumb: "Accessoires",
    desc: "Mugs, tote bags, casquettes et objets du quotidien pensés pour vous inspirer et témoigner de votre foi jour après jour.",
  },
};

function BreadcrumbInner({
  fullWidth = false,
  showCollection = true,
  pageName,
  pageTitle,
}) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category")?.toLowerCase() || "";

  const info = CATEGORY_META[categoryParam] || {
    eyebrow: "Univers Shammah",
    title: pageTitle || "Boutique Officielle",
    crumb: pageName || (categoryParam ? categoryParam : "Tous les produits"),
    desc: "Découvrez notre collection de vêtements et accessoires chrétiens haut de gamme imprimés avec soin en France.",
  };

  // Si la collection dispose d'un visuel Hero dédié (ex: Collection Homme)
  if (info.heroImage) {
    return (
      <section className="shammah-collection-hero" aria-label={info.title}>
        <div className="shammah-collection-hero-bg">
          <Image
            src={info.heroImage}
            alt={info.heroAlt || info.title}
            fill
            priority
            sizes="100vw"
            className="shammah-collection-hero-img"
          />
          <div className="shammah-collection-hero-overlay" aria-hidden="true" />
        </div>

        <div className={fullWidth ? "container-full shammah-collection-hero-inner" : "container shammah-collection-hero-inner"}>
          <div className="shammah-collection-hero-content">
            <nav aria-label="Fil d'Ariane" className="shammah-collection-breadcrumb">
              <Link className="crumb-link" href="/">
                Accueil
              </Link>
              {showCollection && (
                <>
                  <span className="crumb-sep" aria-hidden="true">/</span>
                  <Link className="crumb-link" href="/shop-default">
                    Boutique
                  </Link>
                </>
              )}
              <span className="crumb-sep" aria-hidden="true">/</span>
              <span className="crumb-current">{info.crumb}</span>
            </nav>

            {info.eyebrow && (
              <span className="shammah-collection-eyebrow">{info.eyebrow}</span>
            )}

            <h1 className="shammah-collection-title">{info.title}</h1>

            <p className="shammah-collection-desc">{info.desc}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tf-page-title">
      <div className={fullWidth ? "container-full" : "container"}>
        <div className="box-title text-center">
          <h1
            className="title fw-bold text-dark letter-0"
            style={{ fontSize: "2.1rem", marginBottom: "0.5rem" }}
          >
            {info.title}
          </h1>

          <div className="breadcrumb-list d-flex align-items-center justify-content-center gap-2">
            <Link className="breadcrumb-item text-secondary hover-dark" href="/">
              Accueil
            </Link>
            {showCollection && (
              <>
                <div className="breadcrumb-item dot">
                  <span />
                </div>
                <Link
                  className="breadcrumb-item text-secondary hover-dark"
                  href="/shop-default"
                >
                  Boutique
                </Link>
              </>
            )}
            <div className="breadcrumb-item dot">
              <span />
            </div>
            <div className="breadcrumb-item current fw-semibold text-dark">
              {info.crumb}
            </div>
          </div>

          <p
            className="desc text-md text-secondary mx-auto mt-2 mb-0"
            style={{ maxWidth: "680px" }}
          >
            {info.desc}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Breadcumb(props) {
  return (
    <Suspense
      fallback={
        <section className="tf-page-title">
          <div className="container">
            <div className="box-title text-center">
              <h1 className="title fw-bold text-dark">Boutique Officielle</h1>
              <p className="desc text-md text-secondary">
                Chargement de la collection...
              </p>
            </div>
          </div>
        </section>
      }
    >
      <BreadcrumbInner {...props} />
    </Suspense>
  );
}
