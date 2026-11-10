"use client";
import Link from "next/link";
import Image from "next/image";
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
                <a
                  href="#dropdown-mb-collections"
                  className={`collapsed mb-menu-link ${
                    pathname.startsWith("/shop") || pathname.startsWith("/product") || pathname.includes("category=") ? "menuActive" : ""
                  }`}
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="dropdown-mb-collections"
                >
                  <span>Collections</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="dropdown-mb-collections" className="collapse">
                  <ul className="sub-nav-menu shammah-sidebar-collections" style={{ paddingLeft: "8px", paddingTop: "8px" }}>
                    <li>
                      <Link href="/shop-default?category=t-shirts" className="sub-nav-link shammah-sidebar-cat-link" data-bs-dismiss="offcanvas">
                        <span className="shammah-sidebar-cat-thumb">
                          <Image src="/images/cls-categories/pod/t-shirts-jesus.jpg" alt="T-shirts" width={36} height={36} />
                        </span>
                        <span>T-shirts</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop-default?category=sweats" className="sub-nav-link shammah-sidebar-cat-link" data-bs-dismiss="offcanvas">
                        <span className="shammah-sidebar-cat-thumb">
                          <Image src="/images/cls-categories/pod/sweat-vert-jesus.jpg" alt="Sweats à capuche" width={36} height={36} />
                        </span>
                        <span>Sweats à capuche</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop-default?category=casquettes" className="sub-nav-link shammah-sidebar-cat-link" data-bs-dismiss="offcanvas">
                        <span className="shammah-sidebar-cat-thumb">
                          <Image src="/images/cls-categories/pod/casquette-jesus.jpg" alt="Casquettes" width={36} height={36} />
                        </span>
                        <span>Casquettes</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop-default?category=accessoires" className="sub-nav-link shammah-sidebar-cat-link" data-bs-dismiss="offcanvas">
                        <span className="shammah-sidebar-cat-thumb">
                          <Image src="/images/cls-categories/pod/accessories-mug.jpg" alt="Accessoires" width={36} height={36} />
                        </span>
                        <span>Accessoires (Tasses, Sacs &amp; Objets)</span>
                      </Link>
                    </li>
                    <li style={{ marginTop: "10px" }}>
                      <Link href="/shop-default" className="sub-nav-link fw-medium text-dark" data-bs-dismiss="offcanvas">
                        Explorer toute la collection →
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
