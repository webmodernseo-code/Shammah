"use client";
import Link from "next/link";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CATEGORY_META = {
  homme: {
    title: "Collection Homme",
    crumb: "Homme",
    desc: "Vêtements et pièces streetwear chrétiens pour homme : t-shirts, sweats et hoodies d'exception pour affirmer sa foi avec sobriété et style.",
  },
  femme: {
    title: "Collection Femme",
    crumb: "Femme",
    desc: "Créations chrétiennes pour femme : des pièces élégantes, modernes et lumineuses conçues pour célébrer la foi et la grâce au quotidien.",
  },
  enfant: {
    title: "Collection Enfant",
    crumb: "Enfant",
    desc: "Vêtements chrétiens doux et inspirants pour les plus jeunes : semer des paroles de vie et d'amour dès le premier âge.",
  },
  accessoires: {
    title: "Accessoires & Objets de Foi",
    crumb: "Accessoires",
    desc: "Mugs, tote bags, casquettes et objets du quotidien pensés pour vous inspirer et témoigner de votre foi jour après jour.",
  },
  gadgets: {
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
    title: pageTitle || "Boutique Officielle",
    crumb: pageName || (categoryParam ? categoryParam : "Tous les produits"),
    desc: "Découvrez notre collection de vêtements et accessoires chrétiens haut de gamme imprimés avec soin en France.",
  };

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
