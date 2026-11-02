import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  onClose?: () => void;
  userRole?: "master" | "seller";
}

export function SidebarHeader({
  isCollapsed,
  toggleCollapse,
  onClose,
}: SidebarHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between relative shrink-0 h-[76px] border-b border-slate-200/80 bg-[#f8fafc]/95 backdrop-blur-xl">
      {/* Full Official Logo when expanded */}
      <Link
        href="/"
        className={`transition-opacity duration-300 flex items-center min-w-0 pr-2 gap-2 ${
          isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"
        }`}
      >
        <span className="font-bold text-2xl tracking-tight text-slate-900">
          Shammah
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
          Admin
        </span>
      </Link>

      {/* Logo Icon for Collapsed State */}
      <Link
        href="/"
        className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 flex justify-center items-center ${
          isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-sans font-bold text-base shadow-sm">
          SH
        </div>
      </Link>

      {/* Toggle collapse button */}
      <button
        onClick={toggleCollapse}
        className={`hidden xl:flex size-7 rounded-lg items-center justify-center transition-all bg-white/90 text-slate-500 hover:text-slate-950 hover:bg-white border border-slate-200/90 shadow-2xs cursor-pointer shrink-0 ${
          isCollapsed ? "rotate-180 absolute -right-3.5 top-1/2 -translate-y-1/2 bg-white shadow-xs z-50 rounded-full size-7" : ""
        }`}
        aria-label="Réduire / Déplier le menu"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>

      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="xl:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 cursor-pointer"
        aria-label="Fermer le menu"
      >
        <X className="size-5" strokeWidth={2} />
      </button>
    </div>
  );
}
