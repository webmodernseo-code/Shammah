"use client";

import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AutoLogoutGuard from "@/components/auth/auto-logout-guard";
import { AdminIdentity, AdminSessionProvider, isSuperAdminRole } from "@/components/auth/admin-session-context";

const SUPER_ADMIN_PATHS = ["/admin-users", "/settings/payment-api", "/settings/smtp", "/settings/media", "/settings/maintenance"];

interface DashboardLayoutProps {
  children: React.ReactNode;
  defaultUserRole?: "master" | "seller";
}

export default function DashboardLayout({
  children,
  defaultUserRole = "master",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setIdentity(data?.user ?? null); })
      .finally(() => { if (active) setSessionLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const isLocked = Boolean(
    sessionLoaded && identity?.role === "ADMIN" &&
    SUPER_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  );
  const visualRole = identity ? (isSuperAdminRole(identity.role) ? "master" : "seller") : defaultUserRole;

  return (
    <AdminSessionProvider value={identity}>
      <div className="xl:flex min-h-screen">
        <AutoLogoutGuard />
        {/* Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
          toggleCollapse={() => setIsDesktopCollapsed((prev) => !prev)}
          initialUserRole={visualRole}
        />

        {/* Main Content Wrapper */}
        <div
          className={`dx-dashboard-shell flex-1 min-w-0 flex flex-col min-h-screen transition-[margin] duration-300 ml-0 ${
            isDesktopCollapsed ? "xl:ml-[80px]" : "xl:ml-[280px]"
          }`}
        >
          {/* Header */}
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} identity={identity} />

          {/* Main Content Area */}
          <main className="dx-main-content flex-1 py-5 px-4 lg:p-7 xl:px-10 overflow-auto">
            <div
              inert={isLocked}
              aria-disabled={isLocked}
              className={isLocked
                ? "pointer-events-none select-none opacity-75 brightness-95 saturate-[0.85] transition-all duration-300"
                : undefined}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
