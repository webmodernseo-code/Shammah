import Link from "next/link";
import React from "react";

interface SidebarMenuLinkProps {
  item: {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    badge?: string | number;
  };
  pathname: string;
  isCollapsed?: boolean;
  userRole?: "master" | "seller";
}

export function SidebarMenuLink({
  item,
  pathname,
  isCollapsed,
}: SidebarMenuLinkProps) {
  const isDashboard = item.href === "/";

  let isActive = false;
  if (isDashboard) {
    isActive = pathname === "/";
  } else if (item.href === "/orders") {
    isActive =
      pathname === "/orders" ||
      (pathname.startsWith("/orders/") &&
        !pathname.startsWith("/orders/return-and-refund") &&
        !pathname.startsWith("/orders/transactions") &&
        !pathname.startsWith("/orders/abandon-cart"));
  } else if (item.href === "/products") {
    isActive =
      pathname === "/products" ||
      (pathname.startsWith("/products/") &&
        !pathname.startsWith("/products/stocks") &&
        !pathname.startsWith("/products/review"));
  } else if (item.href === "/settings/general") {
    isActive =
      pathname === "/settings/general" ||
      pathname === "/settings/shop" ||
      pathname === "/settings";
  } else if (item.href) {
    isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href + "/"));
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center rounded-xl transition-all duration-150 py-1.5 px-2 group cursor-pointer ${
        isActive
          ? "bg-[#16423C]/10 text-[#16423C] font-semibold border border-[#16423C]/20 shadow-2xs"
          : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-950 font-medium"
      } ${isCollapsed ? "justify-center px-0 py-2" : "justify-between"}`}
    >
      <div className={`flex items-center gap-2.5 ${isCollapsed ? "" : "min-w-0"}`}>
        {/* Vector SVG Icon Container */}
        <span
          className={`size-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-150 ${
            isActive
              ? "bg-white text-[#16423C] border border-[#16423C]/30 shadow-2xs"
              : "bg-gradient-to-b from-white/95 via-white/80 to-slate-100/70 border border-white/90 shadow-[0_2px_6px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md text-slate-600 group-hover:text-slate-950 group-hover:from-white group-hover:to-slate-100 group-hover:shadow-[0_3px_10px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-[1.04]"
          }`}
        >
          {item.icon}
        </span>

        {!isCollapsed && (
          <span
            className={`text-[13.5px] leading-snug truncate tracking-tight transition-colors ${
              isActive
                ? "text-[#16423C] font-semibold"
                : "text-slate-800 font-medium group-hover:text-slate-950"
            }`}
          >
            {item.label}
          </span>
        )}
      </div>

      {!isCollapsed && item.badge && (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
            isActive
              ? "bg-[#16423C] text-white"
              : "bg-slate-100 text-slate-600 border border-slate-200/80 group-hover:bg-slate-200/80 group-hover:text-slate-900"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
