import type { Metadata } from "next";
import AbandonCartList from "@/components/abandon-cart/abandon-cart-list";

export const metadata: Metadata = {
  title: "Paniers abandonnés | DivinExpress Admin",
  description: "Suivez les paniers non finalisés et relancez vos clients automatiquement.",
};

export default function AbandonCartOrdersPage() {
  return <AbandonCartList />;
}
