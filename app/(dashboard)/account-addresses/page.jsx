import Breadcumb from "@/components/common/Breadcumb";
import Address from "@/components/dashboard/Address";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";

import React from "react";

export const metadata = {
  title: "Mes Adresses de Livraison | Shammah",
  description: "Gérez vos adresses de livraison sur la boutique Shammah.",
  robots: { index: false, follow: false },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Addresses" pageTitle="Addresses" />
      <Address />
      <Footer1 />
    </>
  );
}
