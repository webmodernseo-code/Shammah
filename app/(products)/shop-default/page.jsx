import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/products/Breadcumb";
import Features from "@/components/products/Features";
import Products1 from "@/components/products/Products1";
import React from "react";

export const metadata = {
  title: "Boutique de vêtements chrétiens & cadeaux",
  description: "T-shirts, sweats, accessoires et cadeaux chrétiens personnalisés Shammah. Impression à la demande et livraison en France et en Afrique de l’Ouest.",
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
