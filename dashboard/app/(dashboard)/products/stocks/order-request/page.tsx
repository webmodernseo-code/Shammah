import React from "react";
import NewOrderRequestForm from "@/components/products/stock-products/new-order-request-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nouvelle Demande de Production | DivinExpress Admin",
  description: "Créer un ordre de production et de réassort d'épices.",
};

export default function NewOrderRequestPage() {
  return <NewOrderRequestForm />;
}
