import React from "react";
import NewOrderRequestForm from "@/components/products/stock-products/new-order-request-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demande de Réapprovisionnement | DivinExpress Admin",
  description: "Créer un ordre de fabrication et de réapprovisionnement pour l'atelier.",
};

export default function NewOrderRequestDetailPage() {
  return <NewOrderRequestForm />;
}
