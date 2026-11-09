"use client";
import Link from "next/link";
import React from "react";

export default function Breadcumb({
  fullWidth = false,
  pageName = "Collection",
  pageTitle = "Notre Collection",
}) {
  return (
    <section className="tf-page-title">
      <div className={fullWidth ? "container-full" : "container"}>
        <div className="box-title text-center">
          <h1
            className="title fw-bold text-dark letter-0"
            style={{ fontSize: "2.1rem", marginBottom: "0.5rem" }}
          >
            {pageTitle}
          </h1>

          <div className="breadcrumb-list d-flex align-items-center justify-content-center gap-2">
            <Link className="breadcrumb-item text-secondary hover-dark" href="/">
              Accueil
            </Link>
            <div className="breadcrumb-item dot">
              <span />
            </div>
            <div className="breadcrumb-item current fw-semibold text-dark">
              {pageName}
            </div>
          </div>

          <p
            className="desc text-md text-secondary mx-auto mt-2 mb-0"
            style={{ maxWidth: "680px" }}
          >
            Découvrez l&apos;ensemble de nos créations chrétiennes — t-shirts, sweats à capuche, casquettes et accessoires — et filtrez selon vos envies.
          </p>
        </div>
      </div>
    </section>
  );
}
