import React from "react";
import AddStockForm from "@/components/products/stock-products/add-stock-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajustement & Entrée de Stock | DivinExpress Admin",
  description: "Enregistrer une réception de marchandise ou un ajustement d'inventaire.",
};

export default function AddStockPage() {
  return <AddStockForm />;
}
