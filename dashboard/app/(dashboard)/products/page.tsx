import ProductListTable from "@/components/products/products-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Produits | Shammah Admin",
  description: "Gestion et inventaire du catalogue de prêt-à-porter Shammah.",
};

export default function Products() {
  return <ProductListTable />;
}
