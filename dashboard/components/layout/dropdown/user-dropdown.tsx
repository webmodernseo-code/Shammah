"use client";

import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogoutIcon, SettingsIcon } from "@/icons";
import { ShieldCheck, Loader2 } from "lucide-react";
import type { AdminIdentity } from "@/components/auth/admin-session-context";

export default function UserDropdown({ identity }: { identity?: AdminIdentity | null }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = identity?.name?.trim() || identity?.email?.split("@")[0] || "Admin Shammah";
  const initials = (displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "DX").toUpperCase();
  const roleLabel = identity?.role === "ADMIN" ? "Administrateur" : "Super administrateur";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("userRole");
      }
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/signin");
      router.refresh();
    } catch {
      router.push("/signin");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <MenuButton className="inline-flex items-center gap-2.5 justify-center focus:outline-none text-sm cursor-pointer p-1 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {initials}
              </span>
              <span className="hidden text-left md:block">
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-gray-500 font-normal block leading-tight">
                  {roleLabel}
                </span>
              </span>
              <ChevronDown
                className={`size-4 text-gray-500 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 p-1.5 transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/settings/general"
                    className={`${
                      focus ? "bg-gray-50 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-xl px-3 py-2 text-xs font-semibold gap-2.5 transition-colors`}
                  >
                    <SettingsIcon className="size-4 text-gray-500" />
                    <span>Paramètres Boutique</span>
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/settings/payment-api"
                    className={`${
                      focus ? "bg-gray-50 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-xl px-3 py-2 text-xs font-semibold gap-2.5 transition-colors`}
                  >
                    <ShieldCheck className="size-4 text-slate-700" />
                    <span>Passerelles Stripe & PayPal</span>
                  </Link>
                )}
              </MenuItem>
              <div className="my-1 border-t border-gray-100" />
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`${
                      focus ? "bg-red-50 text-red-700" : "text-gray-600"
                    } group flex w-full items-center rounded-xl px-3 py-2 text-xs font-semibold gap-2.5 transition-colors cursor-pointer text-left disabled:opacity-50`}
                  >
                    {loggingOut ? (
                      <Loader2 className="size-4 animate-spin text-red-600" />
                    ) : (
                      <LogoutIcon className="size-4 text-gray-400 group-hover:text-red-600" />
                    )}
                    <span>{loggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </>
        )}
      </Menu>
    </div>
  );
}
