"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Produits", href: "/produits" },
  { label: "Commandes", href: "/commandes" },
  { label: "Clients", href: "/clients" },
  { label: "Attributs", href: "/attributs" },
  { label: "Promotions", href: "/promotions" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-[72px] items-center justify-between border-b border-gray-100 bg-card-bg px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img src="/images/logo-shammah.svg" alt="Shammah" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-text-heading">SHAMMAH</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item={item.label}
                data-active={active ? "true" : "false"}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-accent-primary text-white" : "text-text-body hover:bg-gray-50")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-body">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <UserMenu />
      </div>
    </nav>
  );
}
