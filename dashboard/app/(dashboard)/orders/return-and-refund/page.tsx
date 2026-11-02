import type { Metadata } from "next";
import ReturnAndRefundTable from "@/components/orders/return-and-refund-table";

export const metadata: Metadata = {
  title: "Retours & Remboursements | DivinExpress Admin",
  description: "Gérez les demandes de retour, les remboursements et les échanges.",
};

export default function ReturnAndRefundPage() {
  return <ReturnAndRefundTable />;
}
