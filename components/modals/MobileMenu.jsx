"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";

export default function MobileMenu() {
  const pathname = usePathname();

  return (
    <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
      <button
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <div className="mb-content-top">
            <form className="form-search">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                name="text"
                tabIndex={0}
                defaultValue=""
                aria-required="true"
                required
              />
              <button type="submit">
                <i className="icon icon-search" />
              </button>
            </form>
            <ul className="nav-ul-mb" id="wrapper-menu-navigation">
              <li className="nav-mb-item">
                <Link
                  href="/"
                  className={`mb-menu-link ${pathname === "/" ? "menuActive" : ""}`}
                >
                  <span>Accueil</span>
                </Link>
              </li>
              <li className="nav-mb-item">
                <Link
                  href="/shop-default"
                  className={`mb-menu-link ${
                    pathname.startsWith("/shop") ? "menuActive" : ""
                  }`}
                >
                  <span>Boutique</span>
                </Link>
              </li>
              <li className="nav-mb-item">
                <a
                  href="#dropdown-mb-collections"
                  className={`collapsed mb-menu-link ${
                    pathname === "/shop-collection-list" || pathname.includes("category=") ? "menuActive" : ""
                  }`}
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="dropdown-mb-collections"
                >
                  <span>Collections</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="dropdown-mb-collections" className="collapse">
                  <ul className="sub-nav-menu" style={{ paddingLeft: "16px", paddingTop: "8px" }}>
                    <li style={{ marginBottom: "8px" }}>
                      <Link href="/shop-default?category=t-shirts" className="sub-nav-link" data-bs-dismiss="offcanvas">
                        T-shirts
                      </Link>
                    </li>
                    <li style={{ marginBottom: "8px" }}>
                      <Link href="/shop-default?category=sweats" className="sub-nav-link" data-bs-dismiss="offcanvas">
                        Sweats à capuche
                      </Link>
                    </li>
                    <li style={{ marginBottom: "8px" }}>
                      <Link href="/shop-default?category=bonnets-casquettes" className="sub-nav-link" data-bs-dismiss="offcanvas">
                        Bonnets &amp; Casquettes
                      </Link>
                    </li>
                    <li style={{ marginBottom: "8px" }}>
                      <Link href="/shop-default?category=accessoires" className="sub-nav-link" data-bs-dismiss="offcanvas">
                        Accessoires (Tasses, Sacs &amp; Objets)
                      </Link>
                    </li>
                    <li style={{ marginTop: "10px" }}>
                      <Link href="/shop-collection-list" className="sub-nav-link fw-medium text-dark" data-bs-dismiss="offcanvas">
                        Toutes les collections →
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-mb-item">
                <Link
                  href="/about-us"
                  className={`mb-menu-link ${
                    pathname === "/about-us" ? "menuActive" : ""
                  }`}
                >
                  <span>À Propos</span>
                </Link>
              </li>
              <li className="nav-mb-item">
                <Link
                  href="/contact-us"
                  className={`mb-menu-link ${
                    pathname === "/contact-us" ? "menuActive" : ""
                  }`}
                >
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="mb-other-content">
            <div className="group-icon">
              <Link href="/wish-list" className="site-nav-icon">
                <i className="icon icon-heart" />
                Favoris
              </Link>
              <Link href="/login" className="site-nav-icon">
                <i className="icon icon-user" />
                Se connecter
              </Link>
            </div>
            <div className="mb-notice">
              <Link href="/contact-us" className="text-need">
                Besoin d'aide ?
              </Link>
            </div>
            <div className="mb-contact">
              <p>Boutique chrétienne Shammah — shammah.eu</p>
            </div>
            <ul className="mb-info">
              <li>
                Email: <b className="fw-medium">contact@shammah.eu</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="mb-bottom">
          <div className="bottom-bar-language">
            <div className="tf-currencies">
              <CurrencySelect />
            </div>
            <div className="tf-languages">
              <LanguageSelect parentClassName="image-select center style-default type-languages" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
