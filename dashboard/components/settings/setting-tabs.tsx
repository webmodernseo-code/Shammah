"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Général & Boutique", href: "/settings/general" },
  { name: "Passerelles API & Paiements", href: "/settings/payment-api" },
  { name: "Médias & Cloudinary", href: "/settings/media" },
  { name: "Serveur SMTP & E-mails", href: "/settings/smtp" },
  { name: "SEO & Référencement", href: "/settings/seo" },
  { name: "Mode Maintenance", href: "/settings/maintenance" },
];

export default function SettingTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200/90 px-4 sm:px-6 overflow-x-auto scrollbar-hide bg-white rounded-t-2xl">
      <nav
        className="-mb-px flex items-center space-x-4 sm:space-x-6 lg:space-x-8 min-w-max"
        aria-label="Onglets de configuration"
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/settings/general" && pathname === "/settings");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap py-3.5 border-b-2 font-semibold text-xs sm:text-[13.5px] transition-colors cursor-pointer",
                isActive
                  ? "border-[#2b6b61] text-[#2b6b61] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
