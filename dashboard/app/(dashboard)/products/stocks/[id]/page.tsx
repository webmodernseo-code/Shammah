import StockProductDetail from "@/components/products/stock-products/stock-product-detail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détail du Stock Vêtements | Shammah Admin",
  description: "Consultation et réapprovisionnement de la référence d'épice.",
};

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  return <StockProductDetail id={resolvedParams.id} />;
}
