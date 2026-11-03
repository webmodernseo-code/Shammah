import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/products/Breadcumb";
import Features from "@/components/products/Features";
import Products1 from "@/components/products/Products1";
import React from "react";

export const metadata = {
  title: "Boutique de Vêtements & Accessoires Chrétiens",
  description: "Explorez notre boutique : t-shirts chrétiens, sweats, hoodies, tote bags, casquettes et cadeaux de foi personnalisés. Impression soignée et livraison rapide.",
  alternates: { canonical: "/shop-default" },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb />

      <Products1 />
      <Features />
      <Footer1 />
    </>
  );
}
