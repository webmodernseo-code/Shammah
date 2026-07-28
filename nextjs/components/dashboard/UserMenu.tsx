"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-gray-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary text-sm font-semibold text-white">
          A
        </span>
        <span className="text-left">
          <span className="block text-sm font-medium text-text-heading">Administrateur</span>
          <span className="block text-xs text-text-body">Super Admin</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-card bg-card-bg py-2 shadow-card">
          <span className="block cursor-not-allowed px-4 py-2 text-sm text-gray-400">
            Profil &amp; Paramètres
          </span>
          <button
            id="user-menu-signout"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full px-4 py-2 text-left text-sm text-status-red hover:bg-gray-50"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
