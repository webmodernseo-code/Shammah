"use client";
import Link from "next/link";
import Image from "next/image";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CATEGORY_META = {
  homme: {
    eyebrow: "Vestiaire Masculin",
    title: "Collection Homme",
    crumb: "Homme",
    desc: "Vêtements et pièces streetwear chrétiens pour homme : t-shirts, sweats et hoodies d'exception pour affirmer sa foi avec sobriété et style.",
    heroImage: "/images/collections/hero-collection-homme.jpg",
    heroAlt: "Collection Homme Shammah — T-shirt Jésus porté en studio",
  },
  femme: {
    eyebrow: "Vestiaire Féminin",
    title: "Collection Femme",
    crumb: "Femme",
    desc: "Créations chrétiennes pour femme : des pièces élégantes, modernes et lumineuses conçues pour célébrer la foi et la grâce au quotidien.",
  },
  enfant: {
    eyebrow: "Jeune Génération",
    title: "Collection Enfant",
    crumb: "Enfant",
    desc: "Vêtements chrétiens doux et inspirants pour les plus jeunes : semer des paroles de vie et d'amour dès le premier âge.",
  },
  accessoires: {
    eyebrow: "Objets & Quotidien",
    title: "Accessoires & Objets de Foi",
    crumb: "Accessoires",
    desc: "Mugs, tote bags, casquettes et objets du quotidien pensés pour vous inspirer et témoigner de votre foi jour après jour.",
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
