import React from "react";
import {
  RotateCcw,
  Users,
  Store,
  KeyRound,
  Mail,
  Wrench,
  Images,
} from "lucide-react";
import {
  SaaSDashboardIcon,
  SaaSOrdersIcon,
  SaaSTransactionsIcon,
  SaaSBasketIcon,
  SaaSCouponIcon,
  SaaSProductsIcon,
  SaaSStocksIcon,
} from "@/components/common/saas-icons";

export type NavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  category?: string;
  badge?: string | number;
  items?: NavItem[];
  subItems?: { label: string; href: string }[];
  superAdminOnly?: boolean;
};

export const navItems: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/",
    icon: <SaaSDashboardIcon className="size-4.5" />,
  },
  {
    label: "Category",
    category: "COMMANDES & VENTES",
    items: [
      {
        label: "Commandes",
        href: "/orders",
        icon: <SaaSOrdersIcon className="size-4.5" />,
      },
      {
        label: "Paiements & transactions",
        href: "/transactions",
        icon: <SaaSTransactionsIcon className="size-4.5" />,
      },
      {
        label: "Paniers abandonnés",
        href: "/abandon-cart",
        icon: <SaaSBasketIcon className="size-4.5" />,
      },
      {
        label: "Retours & remboursements",
        href: "/orders/return-and-refund",
        icon: <RotateCcw className="size-4.5" strokeWidth={1.8} />,
      },
      {
        label: "Codes promo & réductions",
        href: "/coupons",
        icon: <SaaSCouponIcon className="size-4.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "CATALOGUE & PRODUITS",
    items: [
      {
        label: "Catalogue produits",
        href: "/products",
        icon: <SaaSProductsIcon className="size-4.5" />,
      },
      {
        label: "Gestion des stocks",
        href: "/products/stocks",
        icon: <SaaSStocksIcon className="size-4.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "CLIENTS & CONTENU",
    items: [
      {
        label: "Clients & utilisateurs",
        href: "/admin-users",
        icon: <Users className="size-4.5" strokeWidth={1.8} />,
      },
    ],
  },
  {
    label: "Category",
    category: "PARAMÈTRES & CONFIGURATION",
    items: [
      {
        label: "Mode maintenance",
        href: "/settings/maintenance",
        icon: <Wrench className="size-4.5" strokeWidth={1.8} />,
      },
      {
        label: "Paramètres boutique",
        href: "/settings/general",
        icon: <Store className="size-4.5" strokeWidth={1.8} />,
      },
      {
        label: "Passerelles de paiement",
        href: "/settings/payment-api",
        icon: <KeyRound className="size-4.5" strokeWidth={1.8} />,
      },
      {
        label: "Médias & clés Cloudinary",
        href: "/settings/media",
        icon: <Images className="size-4.5" strokeWidth={1.8} />,
      },
      {
        label: "Serveur e-mail & SMTP",
        href: "/settings/smtp",
        icon: <Mail className="size-4.5" strokeWidth={1.8} />,
      },
    ],
  },
];
