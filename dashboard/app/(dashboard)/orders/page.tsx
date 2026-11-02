import type { Metadata } from "next";
import OrderTable from "@/components/orders/order-table";

export const metadata: Metadata = {
  title: "Commandes | Shammah Admin",
  description: "Gérez et suivez toutes vos commandes en temps réel.",
};

export default function Page() {
  return <OrderTable />;
}
