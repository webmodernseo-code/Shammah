import TermsAndConditionTable from "@/components/terms-and-conditions/terms-and-condition-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Shammah Admin",
  description: "Gestion des conditions générales de vente et mentions d'achat.",
};

export default function TermsAndConditionsPage() {
  return <TermsAndConditionTable />;
}
