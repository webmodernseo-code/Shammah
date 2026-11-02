"use client";

import { useState, useEffect } from "react";
import UserDropdown from "./dropdown/user-dropdown";
import NotificationDropdown from "./dropdown/notification-dropdown";
import SearchModal from "./search-modal";
import { Search, Calendar, ChevronDown, Menu } from "lucide-react";

import type { AdminIdentity } from "@/components/auth/admin-session-context";

interface HeaderProps {
  onMenuClick?: () => void;
  identity?: AdminIdentity | null;
}

export default function Header({ onMenuClick, identity }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white/85 backdrop-blur-xl border-b z-40 px-4 lg:px-6 py-3 border-slate-200/70 flex items-center justify-between sticky top-0 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu trigger */}
          <button
            className="xl:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Search Trigger Input with ⌘ K shortcut */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50/90 hover:bg-gray-100/80 border border-gray-200/80 text-gray-400 text-xs sm:text-[13px] font-normal transition-all cursor-pointer w-[200px] sm:w-[320px] md:w-[380px] justify-between group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="size-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
              <span className="truncate text-gray-400 group-hover:text-gray-600">
                Rechercher une commande, un client, un produit...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-2xs shrink-0">
              ⌘ K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date Range Selector Dropdown */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium cursor-pointer transition-colors shadow-2xs">
            <Calendar className="size-3.5 text-gray-400" />
            <span>14 sept. 2026 – 14 oct. 2026</span>
            <ChevronDown className="size-3 text-gray-400" />
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile */}
          <UserDropdown identity={identity} />
        </div>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
