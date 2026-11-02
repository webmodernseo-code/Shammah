import type { Metadata } from "next";
import TransactionTable from "@/components/transactions/transaction-table";

export const metadata: Metadata = {
  title: "Paiements | DivinExpress Admin",
  description: "Suivez tous les paiements encaissés via Stripe, PayPal et autres moyens de paiement.",
};

export default function TransactionsPage() {
  return <TransactionTable />;
}
