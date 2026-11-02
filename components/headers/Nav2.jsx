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

      <li className="menu-item">
        <Link
          href="/shop-collection-list"
          className={`item-link ${
            pathname === "/shop-collection-list" ? "menuActive" : ""
          }`}
        >
          Collections
        </Link>
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
