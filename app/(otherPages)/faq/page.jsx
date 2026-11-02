import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Faqs, { faqCategories } from "@/components/otherPages/Faqs";
import React from "react";
import Link from "next/link";
import Breadcumb from "@/components/common/Breadcumb";
export const metadata = {
  title: "FAQ — commandes, produits et livraison",
  description: "Réponses claires sur les vêtements chrétiens Shammah, les tailles, l’impression à la demande, les commandes, retours et livraisons.",
  alternates: { canonical: "/faq" },
};
export default function page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((category) => category.items).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="FAQ" pageTitle="Questions fréquentes" />

      <Faqs />
      <Footer1 />
    </>
  );
}
