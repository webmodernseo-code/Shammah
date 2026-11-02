import FaqTable from "@/components/faqs/faq-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foire Aux Questions | Shammah Admin",
  description: "Gestion des questions fréquentes et réponses clients Shammah.",
};

export default function FaqPage() {
  return <FaqTable />;
}
