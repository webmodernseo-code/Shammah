import ProductListTable from "@/components/products/products-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Produits | DivinExpress Admin",
  description: "Gestion et inventaire du catalogue de prêt-à-porter DivinExpress.",
};

export default function Products() {
  return <ProductListTable />;
}
