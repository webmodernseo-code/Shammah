import OrderDetails from "@/components/orders/order-details/order-details";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détails de la Commande — Shammah",
  description: "Fiche complète de commande, préparation et suivi de livraison.",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  return <OrderDetails id={resolvedParams.id} />;
}
