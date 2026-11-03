import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Contact from "@/components/otherPages/Contact";
import React from "react";
import Link from "next/link";
import Breadcumb from "@/components/common/Breadcumb";
export const metadata = {
  title: "Contactez-nous | Service Client Shammah",
  description: "Une question sur nos vêtements et accessoires chrétiens ou sur votre commande ? Contactez le service client Shammah.",
  alternates: { canonical: "/contact-us" },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Contact Us" pageTitle="Contact Us" />
      <Contact />
      <Footer1 />
    </>
  );
}
