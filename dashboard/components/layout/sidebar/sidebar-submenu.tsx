import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface SubItem {
  label: string;
  href: string;
  badge?: string | number;
}

interface SidebarSubmenuProps {
  item: {
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    subItems: SubItem[];
  };
  pathname: string;
  isCollapsed?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  userRole?: "master" | "seller";
}

export function SidebarSubmenu({
  item,
  pathname,
  isCollapsed,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}: SidebarSubmenuProps) {
  const hasActiveChild = item.subItems.some((sub) => {
    if (sub.href === "/orders") {
      return (
        pathname === "/orders" ||
        (pathname.startsWith("/orders/") &&
          !pathname.startsWith("/orders/return-and-refund") &&
          !pathname.startsWith("/orders/transactions") &&
          !pathname.startsWith("/orders/abandon-cart"))
      );
    }
    if (sub.href === "/products") {
      return (
        pathname === "/products" ||
        (pathname.startsWith("/products/") &&
          !pathname.startsWith("/products/stocks") &&
          !pathname.startsWith("/products/review") &&
          !pathname.startsWith("/products/add"))
      );
    }
    return pathname === sub.href || (sub.href !== "/" && pathname.startsWith(sub.href + "/"));
  });

  // Local state initialized to true if hasActiveChild
  const [localIsOpen, setLocalIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setLocalIsOpen(true);
    }
  }, [hasActiveChild]);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  const handleToggle = controlledOnToggle || (() => setLocalIsOpen((prev) => !prev));

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full font-medium flex items-center rounded-xl transition-all duration-200 py-1.5 px-2 cursor-pointer select-none group ${
          hasActiveChild
            ? "bg-[#16423C]/10 text-[#16423C] font-semibold border border-[#16423C]/20 shadow-2xs"
            : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-950"
        } ${isCollapsed ? "justify-center px-0 py-2" : "justify-between"}`}
      >
        <div className={`flex items-center gap-2.5 ${isCollapsed ? "" : "min-w-0"}`}>
          {/* Liquid Glass Icon Capsule */}
          <span
            className={`size-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200 ${
              hasActiveChild
                ? "bg-[#16423C]/15 border border-[#16423C]/30 text-[#16423C] shadow-xs backdrop-blur-md"
                : "bg-gradient-to-b from-white/95 via-white/80 to-slate-100/70 border border-white/90 shadow-[0_2px_6px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md text-slate-600 group-hover:text-slate-950 group-hover:from-white group-hover:to-slate-100 group-hover:shadow-[0_3px_10px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-[1.04]"
            }`}
          >
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="text-[13.5px] whitespace-nowrap truncate tracking-tight">
              {item.label}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {item.badge && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  hasActiveChild
                    ? "bg-[#16423C] text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200/80"
                }`}
              >
                {item.badge}
              </span>
            )}
            <ChevronRight
              className={`shrink-0 size-4 transition-transform duration-200 ${
                isOpen ? "rotate-90 text-[#16423C]" : hasActiveChild ? "text-[#16423C]" : "text-slate-400"
              }`}
              strokeWidth={2}
            />
          </div>
        )}
      </button>

      {/* Submenu List */}
      {!isCollapsed && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 mt-1"
              : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden min-h-0 relative space-y-0.5 pb-1">
            {/* Vertical timeline line */}
            <div className="absolute left-[21px] top-[8px] bottom-[10px] w-[1.5px] z-0 bg-slate-200" />

            {item.subItems.map((sub) => {
              let isActive = false;
              if (sub.href === "/orders") {
                isActive =
                  pathname === "/orders" ||
                  (pathname.startsWith("/orders/") &&
                    !pathname.startsWith("/orders/return-and-refund") &&
                    !pathname.startsWith("/orders/transactions") &&
                    !pathname.startsWith("/orders/abandon-cart"));
              } else if (sub.href === "/products") {
                isActive =
                  pathname === "/products" ||
                  (pathname.startsWith("/products/") &&
                    !pathname.startsWith("/products/stocks") &&
                    !pathname.startsWith("/products/review") &&
                    !pathname.startsWith("/products/add"));
              } else {
                isActive =
                  pathname === sub.href ||
                  (sub.href !== "/" && pathname.startsWith(sub.href + "/"));
              }

              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`relative flex items-center justify-between pl-[38px] pr-3 py-2 text-xs rounded-xl transition-all z-10 ${
                    isActive
                      ? "text-[#16423C] font-bold bg-[#16423C]/10 border border-[#16423C]/25 shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 font-normal"
                  }`}
                >
                  {/* Active dot indicator on the line */}
                  <span
                    className={`absolute left-[18.5px] size-1.5 rounded-full transition-all ${
                      isActive
                        ? "bg-[#16423C] ring-4 ring-[#16423C]/20 scale-110"
                        : "bg-slate-300"
                    }`}
                  />

                  <span className="truncate">{sub.label}</span>

                  {sub.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? "bg-[#16423C] text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200/60"
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
