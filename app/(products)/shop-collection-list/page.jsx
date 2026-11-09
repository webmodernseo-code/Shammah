import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/products/Breadcumb";
import Features from "@/components/products/Features";
import Products1 from "@/components/products/Products1";
import React, { Suspense } from "react";

export const metadata = {
  title: "Notre Collection de Vêtements & Accessoires Chrétiens",
  description: "Explorez la collection officielle Shammah : t-shirts chrétiens, sweats à capuche, casquettes et accessoires de foi. Filtrez par catégorie, taille et couleur.",
  alternates: { canonical: "/shop-default" },
};

export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb />
      <Suspense fallback={<div className="container py-5 text-center text-muted">Chargement de la collection...</div>}>
        <Products1 />
      </Suspense>
      <Features />
      <Footer1 />
    </>
  );
}
