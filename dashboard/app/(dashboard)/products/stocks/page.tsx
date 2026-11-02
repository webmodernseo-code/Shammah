import StockProductTable from "@/components/products/stock-products/stock-product-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Stocks Vêtements | DivinExpress",
  description: "Inventaire et niveaux de stock des collections de mode DivinExpress.",
};

export default function StockProductsPage() {
  return (
    <div className="space-y-6">
      <StockProductTable />
    </div>
  );
}
