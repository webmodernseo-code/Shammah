import React from "react";
import Nav2 from "./Nav2";
import Link from "next/link";
import WishlistLength from "../common/WishlistLength";
import CartLength from "../common/CartLength";
import Image from "next/image";

export default function Header2({
  parentClass = "header-default",
  fullWidth = false,
}) {
  return (
    <header id="header" className={parentClass}>
      <div className={fullWidth ? "container-full" : "container"}>
        <div className="row wrapper-header align-items-center justify-content-between">
          {/* 1. Mobile burger menu à GAUCHE (visible uniquement sur mobile / tablette < xl) */}
          <div className="col-3 d-xl-none text-start">
            <a
              href="#mobileMenu"
              className="mobile-menu nav-icon-item d-inline-flex align-items-center"
              data-bs-toggle="offcanvas"
              aria-controls="mobileMenu"
              title="Ouvrir le menu"
              style={{ fontSize: "24px", color: "var(--dark)" }}
            >
              <i className="icon icon-categories1" />
            </a>
          </div>

          {/* 2. Logo : À GAUCHE sur Desktop (xl+), AU MILIEU sur Mobile (< xl) */}
          <div className="col-6 col-xl-3 text-center text-xl-start">
            <Link href="/" className="logo-header d-inline-flex align-items-center justify-content-center justify-content-xl-start">
              <Image
                alt="Shammah"
                className="logo"
                src="/images/logo/shammah-logo-black.png"
                width={2134}
                height={737}
                sizes="(max-width: 1199px) 160px, 190px"
                style={{ width: "190px", height: "auto" }}
                unoptimized
                priority
              />
            </Link>
          </div>

          {/* 3. Menu de navigation AU CENTRE (uniquement Desktop) */}
          <div className="col-xl-6 d-none d-xl-block">
            <nav className="box-navigation text-center">
              <ul
                className="box-nav-menu justify-content-center align-items-center"
                style={{ gap: "44px" }}
              >
                <Nav2 />
              </ul>
            </nav>
          </div>

          {/* 4. Actions & Icônes à DROITE (Desktop & Mobile) */}
          <div className="col-3 col-xl-3 text-end">
            <ul className="nav-icon d-flex justify-content-end align-items-center gap-3 gap-xl-4">
              <li className="nav-search">
                <a
                  href="#search"
                  data-bs-toggle="modal"
                  className="nav-icon-item"
                  title="Rechercher"
                >
                  <i className="icon icon-search" />
                </a>
              </li>
              <li className="nav-wishlist d-none d-sm-inline-block">
                <Link href="/wish-list" className="nav-icon-item" title="Favoris">
                  <i className="icon icon-heart" />
                  <span className="count-box">
                    <WishlistLength />
                  </span>
                </Link>
              </li>
              <li className="nav-cart">
                <a
                  href="#shoppingCart"
                  data-bs-toggle="offcanvas"
                  className="nav-icon-item"
                  title="Panier"
                >
                  <i className="icon icon-cart" />
                  <span className="count-box">
                    <CartLength />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
