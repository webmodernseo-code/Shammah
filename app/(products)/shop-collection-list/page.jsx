import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/products/Breadcumb";
import Features2 from "@/components/products/Features2";
import SubCollections2 from "@/components/products/SubCollections2";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Collections de Vêtements & Accessoires Chrétiens",
  description: "Découvrez toutes nos collections de vêtements chrétiens et accessoires de foi : t-shirts, sweats, hoodies, tote bags et cadeaux personnalisés Shammah.",
  alternates: { canonical: "/shop-collection-list" },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <>
        {/* Title Page */}
        <Breadcumb showCollection={false} />
      </>
      <SubCollections2 />
      <Features2 />
      <Footer1 />
    </>
  );
}
