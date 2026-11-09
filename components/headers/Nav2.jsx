"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Nav2() {
  const pathname = usePathname();

  return (
    <>
      <li className="menu-item">
        <Link
          href="/"
          className={`item-link ${pathname === "/" ? "menuActive" : ""}`}
        >
          Accueil
        </Link>
      </li>

      <li className="menu-item">
        <Link
          href="/shop-default"
          className={`item-link ${
            pathname.startsWith("/shop") || pathname.startsWith("/product")
              ? "menuActive"
              : ""
          }`}
        >
          Boutique
        </Link>
      </li>

      <li className="menu-item menu-item-has-children shammah-nav-collections">
        <Link
          href="/shop-collection-list"
          className={`item-link d-inline-flex align-items-center gap-1.5 ${
            pathname === "/shop-collection-list" || pathname.includes("category=")
              ? "menuActive"
              : ""
          }`}
        >
          <span>Collections</span>
          <svg
            className="chevron-down-icon"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2.5 3.75L5 6.25L7.5 3.75" />
          </svg>
        </Link>
        <div className="sub-menu shammah-collections-dropdown">
          <div className="collections-menu-wrapper">
            <div className="collections-menu-list">
              <Link
                href="/shop-default?category=t-shirts"
                className="collection-menu-item"
              >
                <div className="collection-item-bullet" />
                <div className="collection-item-content">
                  <span className="collection-item-title">T-shirts</span>
                  <span className="collection-item-desc">Coupes oversize & classiques en coton bio</span>
                </div>
                <svg className="collection-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>

              <Link
                href="/shop-default?category=sweats"
                className="collection-menu-item"
              >
                <div className="collection-item-bullet" />
                <div className="collection-item-content">
                  <span className="collection-item-title">Sweats à capuche</span>
                  <span className="collection-item-desc">Hoodies épais &amp; sweats en molleton</span>
                </div>
                <svg className="collection-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>

              <Link
                href="/shop-default?category=bonnets-casquettes"
                className="collection-menu-item"
              >
                <div className="collection-item-bullet" />
                <div className="collection-item-content">
                  <span className="collection-item-title">Bonnets &amp; Casquettes</span>
                  <span className="collection-item-desc">Broderies fines &amp; accessoires de tête</span>
                </div>
                <svg className="collection-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>

              <Link
                href="/shop-default?category=accessoires"
                className="collection-menu-item"
              >
                <div className="collection-item-bullet" />
                <div className="collection-item-content">
                  <span className="collection-item-title">Accessoires</span>
                  <span className="collection-item-desc">Tasses, mugs, tote bags &amp; objets de foi</span>
                </div>
                <svg className="collection-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="collections-menu-footer">
              <Link
                href="/shop-collection-list"
                className="view-all-collections-btn"
              >
                <span>Voir toutes les collections</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </li>

      <li className="menu-item">
        <Link
          href="/about-us"
          className={`item-link ${pathname === "/about-us" ? "menuActive" : ""}`}
        >
          À Propos
        </Link>
      </li>

      <li className="menu-item">
        <Link
          href="/contact-us"
          className={`item-link ${
            pathname === "/contact-us" ? "menuActive" : ""
          }`}
        >
          Contact
        </Link>
      </li>
    </>
  );
}
