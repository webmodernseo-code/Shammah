import PrivacyTable from "@/components/privacy-and-policy/privacy-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | DivinExpress Admin",
  description: "Gestion de la politique de confidentialité et de protection des données personnelles.",
};

export default function PrivacyAndPolicyPage() {
  return <PrivacyTable />;
}
