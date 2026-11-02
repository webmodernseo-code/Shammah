import React from "react";
import SupportTicketTable from "@/components/support/support-ticket-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tickets d'Assistance | DivinExpress Admin",
  description: "Suivi et gestion des demandes d'assistance client DivinExpress.",
};

export default function SupportPage() {
  return <SupportTicketTable />;
}
