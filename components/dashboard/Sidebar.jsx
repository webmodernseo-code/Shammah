"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const accountLinks = [
  { href: "/account-page", label: "Dashboard" },
  { href: "/account-orders", label: "My Orders" },
  { href: "/wish-list", label: "My Wishlist" },
  { href: "/account-addresses", label: "Addresses" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      {accountLinks.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            className={`text-sm link fw-medium my-account-nav-item ${
              pathname == href ? "active" : ""
            }`}
          >
            {label}
          </Link>
        </li>
      ))}
      <li>
        <Link href={`/`} className="text-sm link fw-medium my-account-nav-item">
          Log Out
        </Link>
      </li>
    </>
  );
}
