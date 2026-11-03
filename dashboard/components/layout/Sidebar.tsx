"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-data";
import { SidebarHeader } from "./sidebar/sidebar-header";
import { SidebarItemWrapper } from "./sidebar/sidebar-item-wrapper";
import { SidebarMenuLink } from "./sidebar/sidebar-menu-link";
import { SidebarSubmenu } from "./sidebar/sidebar-submenu";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SaaSDashboardIcon } from "@/components/common/saas-icons";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  initialUserRole?: "master" | "seller";
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
  initialUserRole = "master",
}: SidebarProps) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<"master" | "seller">(
    initialUserRole,
  );

  useEffect(() => {
    setUserRole(initialUserRole);
  }, [initialUserRole]);

  // Navigation items for the boutique dashboard
  const filteredNavItems = useMemo(() => {
    if (userRole === "seller") {
      return navItems
        .map((group) => {
          if ("items" in group && Array.isArray(group.items)) {
            return {
              ...group,
              items: group.items.filter((item) => !item.superAdminOnly),
            };
          }
          return group;
        })
        .filter(
          (group) =>
            !("items" in group) ||
            (Array.isArray(group.items) && group.items.length > 0)
        );
    }
    return navItems;
  }, [userRole]);

  useEffect(() => {
    // Synchronize active submenu with pathname
    filteredNavItems.slice(1).forEach((group) => {
      if ("items" in group && Array.isArray(group.items)) {
        group.items.forEach((item) => {
          if (item.subItems) {
            const isChildActive = item.subItems.some(
              (sub) =>
                pathname === sub.href || pathname.startsWith(`${sub.href}/`),
            );
            if (isChildActive) {
              setOpenSubMenus((prev) => ({ ...prev, [item.label]: true }));
            }
          }
        });
      }
    });
  }, [pathname, filteredNavItems]);

  const toggleSubMenu = (label: string) => {
    if (isCollapsed && toggleCollapse) {
      toggleCollapse();
      setOpenSubMenus({ [label]: true });
      return;
    }
    setOpenSubMenus((prev) => ({ [label]: !prev[label] }));
  };

  const isHomeActive = pathname === "/";
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = configuredSiteUrl && (
    process.env.NODE_ENV !== "production" ||
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredSiteUrl)
  )
    ? configuredSiteUrl
    : (process.env.NODE_ENV === "production" ? "https://shammah.eu" : "http://localhost:3000");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-45 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        translate="no"
        className={`h-screen shrink-0 fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0 
        ${isCollapsed ? "w-[80px]" : "w-[275px]"}
        bg-[#f8fafc]/95 backdrop-blur-xl border-r border-slate-200/85 shadow-[6px_0_30px_-6px_rgba(15,23,42,0.07),2px_0_6px_-1px_rgba(15,23,42,0.03)]`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          onClose={onClose}
          userRole={userRole}
        />

        <div className="p-3 pb-8 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-5">
          {/* Main Dashboard Link */}
          <div>
            <SidebarItemWrapper label="Tableau de bord" isCollapsed={isCollapsed}>
              <Link
                href="/"
                className={`flex items-center rounded-xl transition-all duration-150 py-1.5 px-2 group cursor-pointer ${
                  isHomeActive
                    ? "bg-[#16423C]/10 text-[#16423C] font-semibold border border-[#16423C]/20 shadow-2xs"
                    : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-950 font-medium"
                } ${isCollapsed ? "justify-center px-0 py-2" : "gap-2.5"}`}
              >
                {/* Liquid Glass Icon Capsule */}
                <span
                  className={`size-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isHomeActive
                      ? "bg-white text-[#16423C] border border-[#16423C]/30 shadow-2xs"
                      : "bg-gradient-to-b from-white/95 via-white/80 to-slate-100/70 border border-white/90 shadow-[0_2px_6px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md text-slate-600 group-hover:text-slate-950 group-hover:from-white group-hover:to-slate-100 group-hover:shadow-[0_3px_10px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-[1.04]"
                  }`}
                >
                  <SaaSDashboardIcon className="size-4.5" />
                </span>

                {!isCollapsed && (
                  <span
                    className={`text-[13.5px] leading-snug tracking-tight transition-colors ${
                      isHomeActive
                        ? "text-[#16423C] font-semibold"
                        : "text-slate-800 font-medium group-hover:text-slate-950"
                    }`}
                  >
                    Tableau de bord
                  </span>
                )}
              </Link>
            </SidebarItemWrapper>
          </div>

          {/* Nav Categories */}
          {filteredNavItems.slice(1).map((group, idx) => (
            <div key={idx} className="space-y-1">
              {"category" in group && (
                <div
                  className={`text-[10.5px] font-bold tracking-wider mb-1.5 uppercase whitespace-nowrap text-slate-400 ${
                    isCollapsed
                      ? "flex justify-center px-0 overflow-hidden"
                      : "px-2.5"
                  }`}
                >
                  {isCollapsed ? (
                    <span className="text-[10px] text-slate-300">•</span>
                  ) : (
                    group.category
                  )}
                </div>
              )}

              <div className="space-y-0.5">
                {"items" in group &&
                  Array.isArray(group.items) &&
                  group.items.map((item) => (
                    <div key={item.label}>
                      {item.subItems ? (
                        <SidebarItemWrapper
                          label={item.label}
                          isCollapsed={isCollapsed}
                        >
                          <SidebarSubmenu
                            item={
                              item as Parameters<
                                typeof SidebarSubmenu
                              >[0]["item"]
                            }
                            pathname={pathname}
                            isCollapsed={isCollapsed}
                            isOpen={!!openSubMenus[item.label]}
                            onToggle={() => toggleSubMenu(item.label)}
                            userRole={userRole}
                          />
                        </SidebarItemWrapper>
                      ) : (
                        <SidebarItemWrapper
                          label={item.label}
                          isCollapsed={isCollapsed}
                        >
                          <SidebarMenuLink
                            item={
                              item as Parameters<
                                typeof SidebarMenuLink
                              >[0]["item"]
                            }
                            pathname={pathname}
                            isCollapsed={isCollapsed}
                            userRole={userRole}
                          />
                        </SidebarItemWrapper>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar: Voir la boutique link */}
        <div className="p-3 border-t border-slate-200/80 bg-[#f8fafc]/95 shrink-0">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 py-2.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white hover:border-slate-300 text-slate-800 hover:text-slate-950 text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] ${
              isCollapsed ? "justify-center px-0" : "px-3"
            }`}
            title="Voir la boutique en ligne"
          >
            <ExternalLink className="size-4 text-slate-500 shrink-0" strokeWidth={2} />
            {!isCollapsed && <span className="truncate">Voir la boutique</span>}
          </a>
        </div>
      </aside>
    </>
  );
}
